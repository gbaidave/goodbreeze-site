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
 * - charge.refunded → sync manual Stripe refunds back to the app (notify user)
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service-client'
import Stripe from 'stripe'
import {
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
  sendRefundProcessedEmail,
} from '@/lib/email'
import { logSystemError } from '@/lib/log-system-error'
import {
  getCatalogItemByStripePriceId,
  getActiveSubscriptionPlans,
} from '@/lib/catalog'

function formatUsd(cents: number | null | undefined): string {
  if (cents == null) return '$0.00'
  return `$${(cents / 100).toFixed(2)}`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
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

        // Look up the catalog entry by Stripe Price ID
        const catalogItem = await getCatalogItemByStripePriceId(priceId)
        if (!catalogItem) {
          console.error('[webhook] No catalog match for priceId:', priceId)
          logSystemError('webhook', `Stripe Price ID has no catalog match: ${priceId}`, { priceId, sessionId: session.id })
          return NextResponse.json({ error: 'Unknown price_id — catalog mismatch' }, { status: 500 })
        }

        // Subscription price IDs are handled by customer.subscription.created/updated
        if (catalogItem.productType === 'subscription_plan') break

        // Credit pack purchase
        if (catalogItem.productType === 'credit_pack') {
          const creditsGranted = catalogItem.creditsGranted
          if (creditsGranted == null || creditsGranted <= 0) {
            console.error('[webhook] Pack', catalogItem.sku, 'has no credits_granted — fix in /admin/catalog')
            logSystemError('webhook', `Pack ${catalogItem.sku} missing credits_granted`, { sku: catalogItem.sku, priceId })
            return NextResponse.json({ error: 'Catalog misconfigured for pack' }, { status: 500 })
          }

          const { error: creditsError } = await supabase.from('credits').insert({
            user_id: userId,
            balance: creditsGranted,
            source: 'pack',
            product: catalogItem.sku,
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
            const receiptRef = (session.payment_intent as string | null) ?? session.id
            await sendPaymentConfirmationEmail(
              profile.email,
              profile.name || profile.email,
              catalogItem.name,
              formatUsd(catalogItem.priceUsdCents),
              userId,
              receiptRef,
              'pack_purchase'
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

        // Resolve plan from catalog by Stripe Price ID
        const planCatalogItem = priceId ? await getCatalogItemByStripePriceId(priceId) : null
        if (priceId && !planCatalogItem) {
          console.error('[webhook] No catalog match for subscription priceId:', priceId)
          logSystemError('webhook', `Subscription Price ID has no catalog match: ${priceId}`, { priceId, subscriptionId: sub.id })
          return NextResponse.json({ error: 'Unknown subscription price_id — catalog mismatch' }, { status: 500 })
        }
        const plan = planCatalogItem?.sku ?? 'free'
        const newCap = planCatalogItem?.priceCredits ?? 0
        const planAmountStr = formatUsd(planCatalogItem?.priceUsdCents)

        // For cap lookup on old plans (existing subscription), fetch active plans once
        const allPlans = await getActiveSubscriptionPlans()
        const capByPlan = new Map<string, number>()
        for (const p of allPlans) capByPlan.set(p.sku, p.priceCredits ?? 0)

        console.log('[webhook] priceId:', priceId, 'resolved plan:', plan, 'cap:', newCap)

        // Stripe API 2026-01-28.clover moved current_period_start/end from the
        // subscription root to sub.items.data[0]. Read from item first, fall back
        // to root for older API versions.
        const periodStart = item?.current_period_start ?? (sub as any).current_period_start ?? sub.start_date
        const periodEnd   = item?.current_period_end   ?? (sub as any).current_period_end

        // Send confirmation email on new subscription
        if (event.type === 'customer.subscription.created' && sub.status === 'active' && profile.email) {
          await sendPaymentConfirmationEmail(
            profile.email,
            profile.name || profile.email,
            plan,
            planAmountStr,
            profile.id,
            sub.id,
            'subscription_purchase'
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
          const oldCap = capByPlan.get(oldPlan) ?? 0
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

        // If the subscription is already 'refunded' in our DB, this deletion was
        // triggered by an admin refund (we called stripe.subscriptions.cancel() after
        // setting the status). Don't overwrite 'refunded' with 'cancelled'.
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle()

        if (existingSub?.status === 'refunded') {
          console.log('[webhook] customer.subscription.deleted — skipping, subscription already marked refunded:', sub.id)
          break
        }

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

      case 'charge.refunded': {
        // Fires for ALL refunds — both app-issued (via admin panel) and manual (via Stripe dashboard).
        // If the refund_request was already marked 'refunded' by the admin panel, we skip it (idempotent).
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string | null
        const invoiceId = (charge as any).invoice as string | null
        const customerId = charge.customer as string | null

        // Fetch charge with refunds expanded — webhook payload does NOT include refund list by default
        let stripeRefundId: string | null = null
        let amountCents: number | null = null
        try {
          const fullCharge = await stripe.charges.retrieve(charge.id, { expand: ['refunds'] })
          const latestRefund = fullCharge.refunds?.data?.[0]
          stripeRefundId = latestRefund?.id ?? null
          amountCents = latestRefund?.amount ?? fullCharge.amount_refunded ?? null
        } catch {
          amountCents = charge.amount_refunded ?? null
        }
        const amountStr = amountCents ? `$${(amountCents / 100).toFixed(2)}` : ''

        // ── Primary match: by stored payment intent ID ───────────────────────────
        let refundReq: { id: string; user_id: string; product_label: string; product_type: string; stripe_refund_id: string | null } | null = null
        if (paymentIntentId) {
          const { data } = await supabase
            .from('refund_requests')
            .select('id, user_id, product_label, product_type, stripe_refund_id')
            .eq('stripe_payment_id', paymentIntentId)
            .eq('status', 'pending')
            .maybeSingle()
          refundReq = data

          if (!refundReq) {
            // Check if already processed by admin panel — skip to avoid duplicate notifications.
            const { data: alreadyProcessed } = await supabase
              .from('refund_requests')
              .select('id')
              .eq('stripe_payment_id', paymentIntentId)
              .neq('status', 'pending')
              .maybeSingle()
            if (alreadyProcessed) break
          }
        }

        // ── Secondary + tertiary matches for subscription refunds ────────────────
        // These handle two cases:
        //   (a) charge.invoice is set  → resolve subscription via invoice
        //   (b) charge.invoice is null → find pending sub refund_request by customer
        // Both cases occur when the PI wasn't stored on the refund_request at creation.
        let subMatchedReq: { id: string; user_id: string; product_label: string; product_type: string } | null = null

        if (!refundReq) {
          // Secondary: invoice → subscription ID
          if (invoiceId) {
            try {
              const inv = await stripe.invoices.retrieve(invoiceId)
              const subscriptionId = (inv as any).subscription as string | null
              if (subscriptionId) {
                const { data: subMatch } = await supabase
                  .from('refund_requests')
                  .select('id, user_id, product_label, product_type')
                  .eq('user_selected_product_id', subscriptionId)
                  .eq('status', 'pending')
                  .maybeSingle()
                if (subMatch) {
                  subMatchedReq = subMatch
                  if (paymentIntentId) {
                    await supabase.from('refund_requests').update({
                      stripe_payment_id: paymentIntentId,
                    }).eq('id', subMatch.id)
                  }
                }
              }
            } catch { /* non-fatal */ }
          }

          // Tertiary: customer → pending subscription refund_request
          // Handles charges where invoice is null (test data / legacy billing paths).
          if (!subMatchedReq && customerId) {
            try {
              const { data: userByCust } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .maybeSingle()
              if (userByCust) {
                const { data: pendingSubReq } = await supabase
                  .from('refund_requests')
                  .select('id, user_id, product_label, product_type')
                  .eq('user_id', userByCust.id)
                  .eq('product_type', 'subscription')
                  .eq('status', 'pending')
                  .maybeSingle()
                if (pendingSubReq) {
                  subMatchedReq = pendingSubReq
                  if (paymentIntentId) {
                    await supabase.from('refund_requests').update({
                      stripe_payment_id: paymentIntentId,
                    }).eq('id', pendingSubReq.id)
                  }
                }
              }
            } catch { /* non-fatal */ }
          }

          if (subMatchedReq) {
            // Found via subscription ID — process it as a matched refund
            await supabase.from('refund_requests').update({
              status: 'refunded',
              stripe_refund_id: stripeRefundId,
              refund_amount_cents: amountCents ?? null,
              reviewed_at: new Date().toISOString(),
            }).eq('id', subMatchedReq.id)

            const { data: subRow } = await supabase
              .from('subscriptions')
              .select('stripe_subscription_id')
              .eq('user_id', subMatchedReq.user_id)
              .in('status', ['active', 'trialing'])
              .maybeSingle()

            await supabase.from('subscriptions').update({
              plan: 'free', status: 'refunded', credits_remaining: 0,
            }).eq('user_id', subMatchedReq.user_id)

            if (subRow?.stripe_subscription_id) {
              await stripe.subscriptions.cancel(subRow.stripe_subscription_id).catch(console.error)
            }

            await supabase.from('notifications').insert({
              user_id: subMatchedReq.user_id,
              type: 'refund_processed',
              message: `Your refund${amountStr ? ` of ${amountStr}` : ''} for ${subMatchedReq.product_label} has been processed.`,
            }).then(null, console.error)

            const { data: refundUserProfile } = await supabase
              .from('profiles').select('name, email').eq('id', subMatchedReq.user_id).single()
            if (refundUserProfile?.email) {
              sendRefundProcessedEmail(
                refundUserProfile.email,
                refundUserProfile.name || refundUserProfile.email,
                subMatchedReq.product_label,
                amountStr || undefined,
                subMatchedReq.user_id
              ).catch(console.error)
            }
            console.log('[webhook] charge.refunded — matched via subscription, processed refund_request', subMatchedReq.id)
            break
          }

          // No refund_request at all — Stripe-direct refund with no support ticket.
          // Look up user via stripe_customer_id, notify them, and revoke access if subscription charge.
          if (customerId) {
            const { data: directProfile } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('stripe_customer_id', customerId)
              .maybeSingle()
            if (directProfile) {
              // Revoke subscription if this was a subscription invoice charge
              if (invoiceId) {
                const { data: activeSub } = await supabase
                  .from('subscriptions')
                  .select('stripe_subscription_id')
                  .eq('user_id', directProfile.id)
                  .in('status', ['active', 'trialing'])
                  .maybeSingle()

                await supabase.from('subscriptions').update({
                  plan: 'free', status: 'refunded', credits_remaining: 0,
                }).eq('user_id', directProfile.id)

                if (activeSub?.stripe_subscription_id) {
                  await stripe.subscriptions.cancel(activeSub.stripe_subscription_id).catch(console.error)
                }
                console.log('[webhook] charge.refunded — Stripe-direct subscription refund, revoked access for user', directProfile.id)
              }

              if (directProfile.email) {
                await supabase.from('notifications').insert({
                  user_id: directProfile.id,
                  type: 'refund_processed',
                  message: `Your refund${amountStr ? ` of ${amountStr}` : ''} has been processed.`,
                }).then(null, console.error)
                sendRefundProcessedEmail(
                  directProfile.email,
                  directProfile.name || directProfile.email,
                  'your purchase',
                  amountStr || undefined,
                  directProfile.id
                ).catch(console.error)
                console.log('[webhook] charge.refunded — Stripe-direct refund, notified user', directProfile.id)
              }
            }
          }
          break
        }

        await supabase.from('refund_requests').update({
          status: 'refunded',
          stripe_refund_id: stripeRefundId,
          refund_amount_cents: amountCents ?? null,
          reviewed_at: new Date().toISOString(),
        }).eq('id', refundReq.id)

        // Revoke product access based on what was refunded
        if (refundReq.product_type === 'credit_pack' || refundReq.product_type === 'credits') {
          // Zero out the refunded credit pack row
          await supabase.from('credits')
            .update({ balance: 0 })
            .eq('user_id', refundReq.user_id)
            .eq('stripe_payment_intent_id', paymentIntentId)
          console.log('[webhook] charge.refunded — zeroed credit pack for user', refundReq.user_id)
        } else if (refundReq.product_type === 'subscription') {
          // Fetch stripe_subscription_id before updating DB (filter by active/trialing)
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('user_id', refundReq.user_id)
            .in('status', ['active', 'trialing'])
            .maybeSingle()

          // Always reset plan/credits — not conditional on having a Stripe sub ID.
          // Set to 'refunded' (not 'cancelled') — money was returned, access revoked.
          // Do this BEFORE cancelling in Stripe so customer.subscription.deleted
          // webhook sees 'refunded' and skips rather than overwriting to 'cancelled'.
          await supabase.from('subscriptions').update({
            plan: 'free',
            status: 'refunded',
            credits_remaining: 0,
          }).eq('user_id', refundReq.user_id)

          // Cancel in Stripe only if we have a sub ID (stops future billing)
          if (sub?.stripe_subscription_id) {
            await stripe.subscriptions.cancel(sub.stripe_subscription_id).catch(console.error)
            console.log('[webhook] charge.refunded — canceled subscription', sub.stripe_subscription_id, 'for user', refundReq.user_id)
          }
        }

        await supabase.from('notifications').insert({
          user_id: refundReq.user_id,
          type: 'refund_processed',
          message: `Your refund${amountStr ? ` of ${amountStr}` : ''} for ${refundReq.product_label} has been processed.`,
        })

        // Email notification (fire and forget)
        const { data: refundUserProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', refundReq.user_id)
          .single()
        if (refundUserProfile?.email) {
          sendRefundProcessedEmail(
            refundUserProfile.email,
            refundUserProfile.name || refundUserProfile.email,
            refundReq.product_label,
            amountStr || undefined,
            refundReq.user_id
          ).catch(console.error)
        }

        console.log('[webhook] charge.refunded — synced refund_request', refundReq.id, 'for user', refundReq.user_id)
        break
      }

      default:
        // Unhandled event — ignore
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[webhook] Unhandled exception:', error)
    logSystemError('webhook', String(error), { stack: (error as Error)?.stack }, '/api/stripe/webhook')
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
