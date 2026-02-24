/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events to keep Supabase in sync.
 *
 * Events handled:
 * - checkout.session.completed  → provision subscription or credits
 * - customer.subscription.updated → sync subscription status
 * - customer.subscription.deleted → mark subscription cancelled
 * - invoice.payment_failed → flag subscription past_due
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service-client'
import Stripe from 'stripe'
import {
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
} from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  // Try all configured webhook secrets — we have two Stripe destinations:
  // goodbreeze.ai (STRIPE_WEBHOOK_SECRET) and goodbreeze-site.vercel.app (STRIPE_WEBHOOK_SECRET_VERCEL).
  // Both route to the same Vercel deployment so we must accept both signing secrets.
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_VERCEL,
  ].filter(Boolean) as string[]

  if (!sig || secrets.length === 0) {
    console.error('[webhook] Missing stripe-signature or no secrets configured')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event | undefined

  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, secret)
      break
    } catch {
      // Try next secret
    }
  }

  if (!event) {
    console.error('[webhook] Signature verification failed — no matching secret. sig:', sig?.slice(0, 20))
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[webhook] Received event:', event.type, event.id)

  let supabase: ReturnType<typeof createServiceClient>
  try {
    supabase = createServiceClient()
  } catch (e) {
    console.error('[webhook] Failed to create Supabase service client:', e)
    return NextResponse.json({ error: 'Service client unavailable' }, { status: 500 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const priceId = session.metadata?.price_id

        if (!userId || !priceId) {
          console.error('[webhook] checkout.session.completed missing metadata — userId:', userId, 'priceId:', priceId)
          break
        }

        // Subscription price IDs — handled by customer.subscription.created/updated
        const subscriptionPriceIds = [
          process.env.STRIPE_STARTER_PLAN_PRICE_ID,
          process.env.STRIPE_GROWTH_PLAN_PRICE_ID,
          process.env.STRIPE_PRO_PLAN_PRICE_ID,
        ]
        if (subscriptionPriceIds.includes(priceId)) break

        // One-time credit packs
        const packMap: Record<string, { credits: number; amount: string; label: string }> = {
          [process.env.STRIPE_SPARK_PACK_PRICE_ID!]: { credits: 3,  amount: '$5.00',  label: 'Spark Pack' },
          [process.env.STRIPE_BOOST_PACK_PRICE_ID!]: { credits: 10, amount: '$10.00', label: 'Boost Pack' },
        }
        const pack = priceId ? packMap[priceId] : undefined
        if (pack) {
          const { error: creditsError } = await supabase.from('credits').insert({
            user_id: userId,
            balance: pack.credits,
            stripe_payment_intent_id: session.payment_intent as string,
            purchased_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          })

          if (creditsError) {
            console.error('[webhook] Failed to insert credits for userId:', userId, creditsError)
            return NextResponse.json({ error: 'Failed to provision credits' }, { status: 500 })
          }

          const { data: profile } = await supabase
            .from('profiles').select('name, email').eq('id', userId).single()
          if (profile?.email) {
            await sendPaymentConfirmationEmail(
              profile.email, profile.name || profile.email, pack.label, pack.amount, userId
            ).catch(console.error)
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        console.log('[webhook]', event.type, '— customerId:', customerId, 'subscriptionId:', sub.id, 'status:', sub.status)

        // Look up user by Stripe customer ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileError || !profile) {
          console.error('[webhook] Profile not found for customerId:', customerId, 'error:', profileError)
          return NextResponse.json({ error: 'Profile not found for customer' }, { status: 500 })
        }

        console.log('[webhook] Found profile id:', profile.id, 'email:', profile.email)

        const item = sub.items.data[0]
        const priceId = item?.price.id

        const planMap: Record<string, string> = {
          [process.env.STRIPE_STARTER_PLAN_PRICE_ID!]: 'starter',
          [process.env.STRIPE_GROWTH_PLAN_PRICE_ID!]:  'growth',
          [process.env.STRIPE_PRO_PLAN_PRICE_ID!]:     'pro',
        }
        const planAmountMap: Record<string, string> = {
          [process.env.STRIPE_STARTER_PLAN_PRICE_ID!]: '$20.00',
          [process.env.STRIPE_GROWTH_PLAN_PRICE_ID!]:  '$30.00',
          [process.env.STRIPE_PRO_PLAN_PRICE_ID!]:     '$40.00',
        }
        const plan = (priceId ? planMap[priceId] : undefined) ?? 'free'

        console.log('[webhook] priceId:', priceId, 'resolved plan:', plan)

        // Stripe API 2026-01-28.clover moved current_period_start/end from the
        // subscription root to sub.items.data[0]. Read from item first, fall back
        // to root for older API versions.
        const periodStart = item?.current_period_start ?? (sub as any).current_period_start ?? sub.start_date
        const periodEnd   = item?.current_period_end   ?? (sub as any).current_period_end

        // Send confirmation email on new subscription
        if (event.type === 'customer.subscription.created' && sub.status === 'active' && profile.email) {
          const planLabel = priceId ? planMap[priceId] ?? 'starter' : 'starter'
          const planAmount = priceId ? planAmountMap[priceId] ?? '$20.00' : '$20.00'
          await sendPaymentConfirmationEmail(
            profile.email, profile.name || profile.email, planLabel, planAmount, profile.id
          ).catch(console.error)
        }

        const upsertPayload = {
          user_id: profile.id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: customerId,
          plan,
          status: sub.status,
          current_period_start: periodStart != null ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
          current_period_end:   periodEnd   != null ? new Date(periodEnd   * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }

        console.log('[webhook] Upserting subscription:', JSON.stringify(upsertPayload))

        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(upsertPayload, { onConflict: 'stripe_subscription_id' })

        if (upsertError) {
          console.error('[webhook] Subscription upsert failed:', upsertError)
          return NextResponse.json({ error: 'Failed to upsert subscription' }, { status: 500 })
        }

        console.log('[webhook] Subscription upsert succeeded for user:', profile.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const { error: deleteError } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)

        if (deleteError) {
          console.error('[webhook] Failed to mark subscription cancelled:', deleteError)
          return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as any).subscription as string

        if (subId) {
          const { error: pastDueError } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId)

          if (pastDueError) {
            console.error('[webhook] Failed to mark subscription past_due:', pastDueError)
            return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 })
          }

          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subId)
            .single()
          if (sub?.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', sub.user_id)
              .single()
            if (profile?.email) {
              await sendPaymentFailedEmail(profile.email, profile.name || profile.email, sub.user_id).catch(console.error)
            }
          }
        }
        break
      }

      default:
        // Unhandled event — ignore
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[webhook] Unhandled exception:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
