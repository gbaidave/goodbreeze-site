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
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import {
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
} from '@/lib/email'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const priceId = session.metadata?.price_id

        if (!userId || !priceId) break

        const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID
        const impulsePriceId = process.env.STRIPE_IMPULSE_PRICE_ID

        if (priceId === starterPriceId) {
          // Subscription handled by customer.subscription.created/updated
          break
        }

        if (priceId === impulsePriceId) {
          // One-time credit pack — add 3 credits (1 report each)
          await supabase.from('credits').insert({
            user_id: userId,
            balance: 3,
            stripe_payment_intent_id: session.payment_intent as string,
            purchased_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
          })

          // Send payment confirmation email
          const { data: profile } = await supabase
            .from('profiles').select('name, email').eq('id', userId).single()
          if (profile?.email) {
            await sendPaymentConfirmationEmail(
              profile.email, profile.name || profile.email, 'impulse', '$10.00', userId
            ).catch(console.error)
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        // Look up user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) break

        const priceId = sub.items.data[0]?.price.id
        const plan = priceId === process.env.STRIPE_STARTER_PRICE_ID ? 'starter' : 'free'

        // Send confirmation email on new subscription
        if (event.type === 'customer.subscription.created' && sub.status === 'active' && profile.email) {
          await sendPaymentConfirmationEmail(
            profile.email, profile.name || profile.email, 'starter', '$20.00', profile.id
          ).catch(console.error)
        }

        await supabase.from('subscriptions').upsert({
          user_id: profile.id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: customerId,
          plan,
          status: sub.status,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as any).subscription as string

        if (subId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId)

          // Send payment failed email
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
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
