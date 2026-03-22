/**
 * POST /api/support
 *
 * Authenticated support request endpoint.
 * Auto-fills user context (plan, last report) and notifies support@goodbreeze.ai.
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate message + category
 * 3. Fetch user context (plan, last report) via service client
 * 4. Insert into support_requests table
 * 5. If category = 'refund': create placeholder refund_requests row
 * 6. Email support@goodbreeze.ai (reply-to = user email)
 * 7. Return success + ticketId + messageId (for future attachment uploads)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendSupportNotificationEmail } from '@/lib/email'
import { stripe } from '@/lib/stripe'

const MIN_MESSAGE_LEN = 10
const MAX_MESSAGE_LEN = 2000
const MAX_SUBJECT_LEN = 120

const VALID_CATEGORIES = [
  'account_access', 'report_issue', 'billing', 'refund', 'dispute', 'help', 'feedback', 'bug_report',
] as const

const VALID_PRODUCT_TYPES = ['subscription', 'credit_pack'] as const

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    // Support page is accessible without login — unauthenticated submissions allowed

    // 2. Validate body
    const body = await request.json()
    const message = (body.message ?? '').trim()
    const category: string = body.category ?? 'help'
    const subject = body.subject ? String(body.subject).trim().slice(0, MAX_SUBJECT_LEN) : null
    const productType: string | null = body.product_type ?? null
    const userSelectedProductId: string | null = body.user_selected_product_id ?? null
    const userSelectedProductLabel: string | null = body.user_selected_product_label ?? null
    const clientCreditsUsed: number | null = typeof body.credits_used === 'number' ? body.credits_used : null
    const clientIsEligible: boolean | null = typeof body.is_eligible === 'boolean' ? body.is_eligible : null
    const clientIneligibilityReasons: string[] | null = Array.isArray(body.ineligibility_reasons) ? body.ineligibility_reasons : null

    // Guest fields (only used when no authenticated user)
    const guestName: string = body.guest_name ? String(body.guest_name).trim().slice(0, 120) : ''
    const guestEmail: string = body.guest_email ? String(body.guest_email).trim().slice(0, 254) : ''
    if (!user && (!guestName || !guestEmail || !guestEmail.includes('@'))) {
      return NextResponse.json(
        { error: 'Please provide your name and email address.' },
        { status: 400 }
      )
    }

    if (message.length < MIN_MESSAGE_LEN) {
      return NextResponse.json(
        { error: 'Please describe your issue (at least 10 characters).' },
        { status: 400 }
      )
    }
    if (message.length > MAX_MESSAGE_LEN) {
      return NextResponse.json(
        { error: `Message is too long (max ${MAX_MESSAGE_LEN} characters).` },
        { status: 400 }
      )
    }
    if (!(VALID_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
    }
    if (productType && !(VALID_PRODUCT_TYPES as readonly string[]).includes(productType)) {
      return NextResponse.json({ error: 'Invalid product type.' }, { status: 400 })
    }

    const priority = category === 'dispute' ? 'high' : null

    // 3. Fetch user context (skip for unauthenticated guests)
    const svc = createServiceClient()
    let userName: string
    let userEmail: string
    let plan: string
    let lastReportContext: string

    if (user) {
      const [profileRes, subRes, lastReportRes] = await Promise.all([
        svc.from('profiles').select('name, email').eq('id', user.id).single(),
        svc
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        svc
          .from('reports')
          .select('report_type, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ])
      userName = profileRes.data?.name || user.email!.split('@')[0]
      userEmail = profileRes.data?.email || user.email!
      plan = subRes.data?.plan || 'free'
      const lastReport = lastReportRes.data
      lastReportContext = lastReport
        ? `${lastReport.report_type} (${lastReport.status})`
        : 'No reports yet'
    } else {
      userName = guestName
      userEmail = guestEmail
      plan = 'free'
      lastReportContext = 'Guest (no account)'
    }

    // 4. Insert support request
    const { data: insertedRequest, error: insertError } = await svc
      .from('support_requests')
      .insert({
        user_id: user?.id ?? null,
        email: userEmail,
        plan_at_time: plan,
        last_report_context: lastReportContext,
        message,
        category,
        subject: subject || null,
        priority,
      })
      .select('id')
      .single()

    if (insertError || !insertedRequest) {
      console.error('Support request insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      )
    }

    const ticketId = insertedRequest.id

    // 5. Insert initial message in thread — return messageId for future attachment uploads
    const { data: insertedMsg } = await svc
      .from('support_messages')
      .insert({
        request_id: ticketId,
        sender_id: user?.id ?? null,
        sender_role: 'user',
        message,
      })
      .select('id')
      .single()

    const messageId = insertedMsg?.id ?? null

    // 5b. If category = 'refund' and user is authenticated: create placeholder refund_requests row
    if (category === 'refund' && user) {
      const resolvedProductType = productType && (VALID_PRODUCT_TYPES as readonly string[]).includes(productType)
        ? productType
        : 'subscription'


      // Credits used at time of request — used to determine refund eligibility.
      // Subscription: plan_cap - credits_remaining (accurate regardless of webhook timing)
      // Credit pack: count all completed reports (non-refundable once used)
      void (async () => {
        try {
          let creditsUsedAtRequest = 0
          let autoPaymentId: string | null = null
          // Monthly credit caps — must match PLAN_MONTHLY_CAPS in entitlement.ts
          const PLAN_CAPS: Record<string, number> = { starter: 25, growth: 40, pro: 50 }
          const PLAN_LABELS: Record<string, string> = { starter: 'Starter Plan', growth: 'Growth Plan', pro: 'Pro Plan' }

          let amountPaidCents: number | null = null
          let purchaseDate: string | null = null
          // productLabel built inside IIFE so it can use the actual plan name
          let productLabel = resolvedProductType === 'subscription' ? 'Subscription' : 'Credit Pack'

          if (resolvedProductType === 'subscription') {
            // Use credits_remaining to derive usage — avoids timing issue where
            // the subscription webhook hasn't fired yet (current_period_start would be stale)
            const { data: sub } = await svc.from('subscriptions')
              .select('plan, credits_remaining, stripe_subscription_id, stripe_customer_id')
              .eq('user_id', user.id)
              .in('status', ['active', 'trialing'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
            const cap = PLAN_CAPS[sub?.plan ?? ''] ?? 0
            const remaining = sub?.credits_remaining ?? 0
            creditsUsedAtRequest = Math.max(0, cap - remaining)
            // Use specific plan name (e.g. "Starter Plan") instead of generic "Subscription"
            const planName = PLAN_LABELS[sub?.plan ?? ''] ?? 'Subscription'
            productLabel = planName

            // Auto-populate PI + amount + date from Stripe latest invoice on the subscription
            if (sub?.stripe_subscription_id) {
              try {
                const stripeSub = await stripe.subscriptions.retrieve(
                  sub.stripe_subscription_id,
                  { expand: ['latest_invoice.payment_intent'] }
                )
                const inv = (stripeSub as any).latest_invoice
                autoPaymentId = inv?.payment_intent?.id ?? null
                // Get amount and date from the invoice
                if (inv) {
                  amountPaidCents = inv.amount_paid ?? inv.total ?? null
                  purchaseDate = inv.created
                    ? new Date(inv.created * 1000).toISOString()
                    : null
                }
              } catch {
                // Non-fatal — will try customer fallback below
              }
            }

            // Fallback: list invoices for THIS subscription only — avoids picking up
            // credit pack payment intents (which also belong to the same Stripe customer)
            if (!autoPaymentId && sub?.stripe_subscription_id) {
              try {
                const invList = await stripe.invoices.list({
                  subscription: sub.stripe_subscription_id,
                  limit: 5,
                })
                const fallbackInv = invList.data.find((inv: any) =>
                  inv.payment_intent && (inv.amount_paid ?? 0) > 0
                )
                if (fallbackInv) {
                  const pi = (fallbackInv as any).payment_intent
                  const piId = typeof pi === 'string' ? pi : pi?.id ?? null
                  if (piId) {
                    autoPaymentId = piId
                    amountPaidCents = fallbackInv.amount_paid ?? fallbackInv.total ?? null
                    purchaseDate = fallbackInv.created
                      ? new Date(fallbackInv.created * 1000).toISOString()
                      : null
                  }
                }
              } catch {
                // Non-fatal — admin can manually set PI via the refund ticket
              }
            }

            // Skip this PI if it was already refunded — prevents showing same purchase as eligible
            if (autoPaymentId) {
              const { data: alreadyRefunded } = await svc
                .from('refund_requests')
                .select('id')
                .eq('user_id', user.id)
                .eq('stripe_payment_id', autoPaymentId)
                .neq('status', 'pending')
                .maybeSingle()
              if (alreadyRefunded) {
                autoPaymentId = null
                amountPaidCents = null
                purchaseDate = null
              }
            }
          } else {
            // Credit pack: count all completed reports
            const { count } = await svc.from('reports').select('id', { count: 'exact', head: true })
              .eq('user_id', user.id).eq('status', 'complete')
            creditsUsedAtRequest = count ?? 0
            productLabel = 'Credit Pack'

            // Auto-populate PI + amount + date from most recent non-refunded credit pack purchase
            const [packCreditsRes, refundedIdsRes] = await Promise.all([
              svc
                .from('credits')
                .select('stripe_payment_intent_id, purchased_at')
                .eq('user_id', user.id)
                .eq('source', 'pack')
                .not('stripe_payment_intent_id', 'is', null)
                .order('purchased_at', { ascending: false }),
              svc
                .from('refund_requests')
                .select('stripe_payment_id')
                .eq('user_id', user.id)
                .eq('status', 'refunded')
                .not('stripe_payment_id', 'is', null),
            ])
            const alreadyRefundedIds = new Set(
              (refundedIdsRes.data ?? []).map((r: any) => r.stripe_payment_id).filter(Boolean)
            )
            const latestCredit = (packCreditsRes.data ?? []).find(
              (c: any) => c.stripe_payment_intent_id && !alreadyRefundedIds.has(c.stripe_payment_intent_id)
            ) ?? null
            autoPaymentId = latestCredit?.stripe_payment_intent_id ?? null
            purchaseDate = latestCredit?.purchased_at ?? null

            // Fetch amount from Stripe PI
            if (autoPaymentId) {
              try {
                const pi = await stripe.paymentIntents.retrieve(autoPaymentId)
                amountPaidCents = pi.amount ?? null
              } catch {
                // Non-fatal
              }
            }
          }

          const { error } = await svc.from('refund_requests').insert({
            user_id: user.id,
            support_request_id: ticketId,
            user_selected_product_id: userSelectedProductId ?? null,
            user_selected_product_label: userSelectedProductLabel ?? null,
            stripe_payment_id: autoPaymentId ?? null,
            product_type: resolvedProductType,
            product_label: productLabel,
            status: 'pending',
            credits_used_at_request: clientCreditsUsed ?? creditsUsedAtRequest,
            is_eligible: clientIsEligible ?? (creditsUsedAtRequest === 0),
            ineligibility_reasons: clientIneligibilityReasons ?? null,
            amount_paid_cents: amountPaidCents,
            purchase_date: purchaseDate,
          })
          if (error) console.error('Auto refund_request insert error:', error)
        } catch (e) {
          console.error('Refund request creation error:', e)
        }
      })()
    }

    // 5c. Email support@ (fire and forget)
    sendSupportNotificationEmail(
      { userName, userEmail, planAtTime: plan, lastReportContext, message, category, subject },
      user?.id
    ).catch((err) => console.error('Support notification email failed:', err))

    // 5d. Auto-assign to first support user if one exists (fire and forget)
    void (async () => {
      try {
        const { data: supportUsers } = await svc
          .from('profiles').select('id').eq('role', 'support').limit(1)
        if (supportUsers && supportUsers.length > 0) {
          await svc.from('support_requests')
            .update({ assignee_id: supportUsers[0]!.id })
            .eq('id', ticketId)
        }
      } catch (e) {
        console.error('Auto-assign error:', e)
      }
    })()

    // 5e. Bell notification for all admin/support users (fire and forget)
    void (async () => {
      try {
        const { data: admins } = await svc.from('profiles').select('id').in('role', ['superadmin', 'admin', 'support'])
        if (admins?.length) {
          const notifMsg = category === 'dispute'
            ? `🚨 Dispute from ${userName} (${userEmail})`
            : `New ${category.replace('_', ' ')} request from ${userName} (${userEmail})`
          const notifType = category === 'dispute' ? 'dispute_request' : category === 'refund' ? 'refund_request' : 'support_request'
          await svc.from('notifications').insert(
            admins.map((a) => ({ user_id: a.id, type: notifType, message: notifMsg }))
          )
        }
      } catch (e) {
        console.error('Admin support notification error:', e)
      }
    })()

    return NextResponse.json({ success: true, ticketId, messageId })

  } catch (error) {
    console.error('Support request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    )
  }
}
