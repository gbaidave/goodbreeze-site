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
            source: 'pack',
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

        // Per-plan monthly credit caps — must match PLAN_MONTHLY_CAPS in entitlement.ts
        const PLAN_CAPS: Record<string, number> = { starter: 25, growth: 40, pro: 50 }
        const newCap = PLAN_CAPS[plan] ?? 0

        console.log('[webhook] priceId:', priceId, 'resolved plan:', plan, 'cap:', newCap)

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

        const periodStartIso = periodStart != null ? new Date(periodStart * 1000).toISOString() : new Date().toISOString()
        const periodEndIso   = periodEnd   != null ? new Date(periodEnd   * 1000).toISOString() : null

        console.log('[webhook] Looking up subscription for user:', profile.id)

        // Every user has exactly one subscription row (created on signup as 'free' plan).
        // Look up by user_id — the free plan row has stripe_subscription_id = NULL so
        // looking up by stripe_subscription_id would never find it on first upgrade.
        // Fetch current plan + credits_remaining + period to compute credit changes.
        const { data: existing, error: lookupError } = await supabase
          .from('subscriptions')
          .select('id, plan, credits_remaining, current_period_start')
          .eq('user_id', profile.id)
          .maybeSingle()

        if (lookupError) {
          console.error('[webhook] Subscription lookup failed:', lookupError)
          return NextResponse.json({ error: 'Failed to look up subscription' }, { status: 500 })
        }

        // ── Compute new credits_remaining ──────────────────────────────────────
        //
        // created: Always provision full plan cap.
        //
        // updated (plan change):
        //   upgrade (new cap > old cap) → additive: current + new cap
        //   downgrade (new cap < old cap) → top off only: max(current, new cap)
        //   same plan → keep existing (handled below as renewal or no-op)
        //
        // updated (renewal = same plan, new billing period):
        //   Reset credits_remaining to plan cap.
        //   Zero all credit pack rows for this user — subscriptions reset everything.
        //   "Use em or lose em while a subscription is active."
        //
        // updated (neither plan change nor new period): keep credits_remaining as-is.
        let creditsRemaining: number

        if (event.type === 'customer.subscription.created') {
          creditsRemaining = newCap

        } else {
          // customer.subscription.updated
          const oldPlan = existing?.plan ?? 'free'
          const oldCap = PLAN_CAPS[oldPlan] ?? 0
          const currentCredits = existing?.credits_remaining ?? 0
          const oldPeriodStart = existing?.current_period_start

          const isRenewal =
            oldPeriodStart != null &&
            new Date(periodStartIso).getTime() !== new Date(oldPeriodStart).getTime()

          if (plan !== oldPlan) {
            // Plan change
            if (newCap > oldCap) {
              // Upgrade: additive — reward the user for paying more
              creditsRemaining = currentCredits + newCap
              console.log('[webhook] Upgrade from', oldPlan, 'to', plan, '— credits:', currentCredits, '+', newCap, '=', creditsRemaining)
            } else {
              // Downgrade: top off only — don't take away credits already earned
              creditsRemaining = Math.max(currentCredits, newCap)
              console.log('[webhook] Downgrade from', oldPlan, 'to', plan, '— credits: max(', currentCredits, ',', newCap, ') =', creditsRemaining)
            }
          } else if (isRenewal) {
            // Same plan, new billing period = renewal
            // Reset to plan cap and zero all credit packs ("use em or lose em")
            creditsRemaining = newCap
            console.log('[webhook] Renewal for plan', plan, '— resetting credits to', newCap, 'and zeroing pack credits')

            const { error: zeroError } = await supabase
              .from('credits')
              .update({ balance: 0 })
              .eq('user_id', profile.id)
              .gt('balance', 0)

            if (zeroError) {
              console.error('[webhook] Failed to zero credits on renewal:', zeroError)
              // Non-fatal: continue with subscription update
            }
          } else {
            // No plan change, no new period — just a Stripe metadata sync (e.g. cancel_at_period_end toggle)
            creditsRemaining = currentCredits
            console.log('[webhook] No plan/period change — keeping credits_remaining:', creditsRemaining)
          }
        }

        if (existing) {
          console.log('[webhook] Updating subscription row id:', existing.id, 'for user:', profile.id, 'credits_remaining:', creditsRemaining)
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: sub.id,
              stripe_customer_id: customerId,
              plan,
              status: sub.status,
              credits_remaining: creditsRemaining,
              current_period_start: periodStartIso,
              current_period_end:   periodEndIso,
              cancel_at_period_end: sub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.id)

          if (updateError) {
            console.error('[webhook] Subscription update failed:', updateError)
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
          }
        } else {
          // Safety fallback: no subscription row found for this user (shouldn't happen
          // since handle_new_user() creates one on signup, but handle gracefully).
          console.log('[webhook] No subscription row found — inserting for user:', profile.id)
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: profile.id,
              stripe_subscription_id: sub.id,
              stripe_customer_id: customerId,
              plan,
              status: sub.status,
              credits_remaining: creditsRemaining,
              current_period_start: periodStartIso,
              current_period_end:   periodEndIso,
              cancel_at_period_end: sub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('[webhook] Subscription insert failed:', insertError)
            return NextResponse.json({ error: 'Failed to insert subscription' }, { status: 500 })
          }
        }

        console.log('[webhook] Subscription saved successfully for user:', profile.id)
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
