/**
 * PATCH /api/admin/refunds/[id]
 *
 * Admin actions on a refund request.
 * Body: { action: 'refund' | 'deny' | 'set_payment_id', ... }
 *
 * deny: store separate deny_reason + deny_reason_detail, set ticket to 'denied'
 *       (not closed), post system message, send bell + email to user.
 *
 * refund: for subscriptions, looks up PI from Stripe invoice list at processing
 *         time using user_selected_product_id (stripe_subscription_id) if no
 *         stripe_payment_id is stored. No manual PI entry needed for subscriptions.
 *
 * set_payment_id: manual fallback for edge cases where PI cannot be found.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service-client'
import { stripe } from '@/lib/stripe'
import { canDo } from '@/lib/permissions'
import { sendRefundProcessedEmail, sendRefundDeniedEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://goodbreeze-site.vercel.app'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

    // ── Auth ────────────────────────────────────────────────────────────────
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const svc = createServiceClient()
    const { data: adminProfile } = await svc
      .from('profiles').select('role').eq('id', user.id).single()
    if (!canDo(adminProfile?.role, 'process_refunds')) {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, notes, stripePaymentId: incomingPaymentId, denyReason, denyReasonDetail } = body

    if (!['refund', 'deny', 'set_payment_id', 'reopen'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }

    // ── Load refund request ─────────────────────────────────────────────────
    const { data: refundReq } = await svc
      .from('refund_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!refundReq) {
      return NextResponse.json({ error: 'Refund request not found.' }, { status: 404 })
    }

    // ── reopen ───────────────────────────────────────────────────────────────
    if (action === 'reopen') {
      if (!['denied', 'open'].includes(refundReq.status)) {
        return NextResponse.json({ error: 'Only denied requests can be reopened.' }, { status: 409 })
      }
      await svc.from('refund_requests').update({ status: 'pending' }).eq('id', requestId)
      if (refundReq.support_request_id) {
        await svc.from('support_requests')
          .update({ status: 'open' })
          .eq('id', refundReq.support_request_id)
      }
      revalidatePath(`/admin/refunds`)
      return NextResponse.json({ success: true })
    }

    if (refundReq.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been processed.' }, { status: 409 })
    }

    // ── set_payment_id ──────────────────────────────────────────────────────
    if (action === 'set_payment_id') {
      const pid = (incomingPaymentId ?? '').trim()
      if (!pid.startsWith('pi_')) {
        return NextResponse.json({ error: 'Invalid payment intent ID — must start with pi_.' }, { status: 400 })
      }
      let amountPaidCents: number | null = null
      let purchaseDate: string | null = null
      try {
        const pi = await stripe.paymentIntents.retrieve(pid)
        amountPaidCents = pi.amount ?? null
        purchaseDate = pi.created ? new Date(pi.created * 1000).toISOString() : null
      } catch { /* non-fatal */ }

      await svc.from('refund_requests').update({
        stripe_payment_id: pid,
        ...(amountPaidCents !== null && { amount_paid_cents: amountPaidCents }),
        ...(purchaseDate !== null && { purchase_date: purchaseDate }),
      }).eq('id', requestId)
      return NextResponse.json({ success: true })
    }

    // ── deny ────────────────────────────────────────────────────────────────
    if (action === 'deny') {
      const reason = (denyReason ?? '').trim()
      const detail = (denyReasonDetail ?? '').trim() || null

      if (!reason) {
        return NextResponse.json({ error: 'Denial reason is required.' }, { status: 400 })
      }
      if (reason === 'Other' && !detail) {
        return NextResponse.json({ error: 'Please explain the denial reason.' }, { status: 400 })
      }

      // 1. Update refund request
      await svc.from('refund_requests').update({
        status: 'denied',
        deny_reason: reason,
        deny_reason_detail: detail,
        admin_notes: notes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', requestId)

      // 2. Set the specific linked support ticket to 'denied' (stays open for reply)
      if (refundReq.support_request_id) {
        await svc.from('support_requests')
          .update({ status: 'denied' })
          .eq('id', refundReq.support_request_id)
          .in('status', ['open', 'in_progress'])
      }

      // 3. Post system message to the ticket thread
      if (refundReq.support_request_id) {
        const displayReason = reason === 'Other' && detail ? detail : reason
        await svc.from('support_messages').insert({
          request_id: refundReq.support_request_id,
          sender_id: user.id,
          sender_role: 'admin',
          message: `Your refund request has been reviewed and was not approved.\n\nReason: ${displayReason}\n\nIf you have questions or would like to discuss this, please reply to this ticket.`,
        })
      }

      // 4. Bell notification
      if (refundReq.user_id) {
        await svc.from('notifications').insert({
          user_id: refundReq.user_id,
          type: 'refund_denied',
          message: `Your refund request for ${refundReq.product_label ?? 'your purchase'} was not approved.`,
        })
      }

      // 5. Email (always send — forced on)
      if (refundReq.user_id) {
        const { data: userProfile } = await svc
          .from('profiles').select('name, email').eq('id', refundReq.user_id).single()
        if (userProfile?.email) {
          const supportUrl = refundReq.support_request_id
            ? `${APP_URL}/support`
            : `${APP_URL}/support`
          sendRefundDeniedEmail(
            userProfile.email,
            userProfile.name || userProfile.email,
            refundReq.product_label ?? 'your purchase',
            reason,
            detail ?? undefined,
            supportUrl,
            refundReq.user_id
          ).catch(console.error)
        }
      }

      return NextResponse.json({ success: true })
    }

    // ── refund ──────────────────────────────────────────────────────────────
    if (refundReq.credits_used_at_request > 0) {
      return NextResponse.json({ error: 'Refund ineligible — credits have been used.' }, { status: 422 })
    }

    // Resolve stripe_payment_id — look up at processing time for subscriptions
    // if not already stored on the record.
    let stripePaymentId = refundReq.stripe_payment_id ?? ''

    if ((!stripePaymentId || stripePaymentId.trim() === '') &&
        refundReq.product_type === 'subscription' &&
        refundReq.user_selected_product_id) {
      // Look up latest paid invoice for this subscription
      try {
        const invList = await stripe.invoices.list({
          subscription: refundReq.user_selected_product_id,
          limit: 5,
        })
        const paidInv = invList.data.find((inv: any) =>
          inv.payment_intent && (inv.amount_paid ?? 0) > 0
        )
        if (paidInv) {
          const pi = (paidInv as any).payment_intent
          stripePaymentId = typeof pi === 'string' ? pi : pi?.id ?? ''
          if (stripePaymentId) {
            await svc.from('refund_requests').update({
              stripe_payment_id: stripePaymentId,
              amount_paid_cents: paidInv.amount_paid ?? null,
              purchase_date: paidInv.created ? new Date(paidInv.created * 1000).toISOString() : null,
            }).eq('id', requestId)
          }
        }
      } catch { /* non-fatal — will fall through to error below */ }
    }

    // Tertiary fallback: if still no PI and product_type is subscription,
    // look up the user's active subscription directly from Supabase.
    if ((!stripePaymentId || stripePaymentId.trim() === '') &&
        refundReq.product_type === 'subscription') {
      try {
        const { data: sub } = await svc
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', refundReq.user_id)
          .in('status', ['active', 'trialing', 'refunded'])
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        const subId = sub?.stripe_subscription_id
        if (subId) {
          const invList = await stripe.invoices.list({ subscription: subId, limit: 5 })
          const paidInv = invList.data.find((inv: any) =>
            inv.payment_intent && (inv.amount_paid ?? 0) > 0
          )
          if (paidInv) {
            const pi = (paidInv as any).payment_intent
            stripePaymentId = typeof pi === 'string' ? pi : pi?.id ?? ''
            if (stripePaymentId) {
              await svc.from('refund_requests').update({
                stripe_payment_id: stripePaymentId,
                user_selected_product_id: subId,
                amount_paid_cents: paidInv.amount_paid ?? null,
                purchase_date: paidInv.created ? new Date(paidInv.created * 1000).toISOString() : null,
              }).eq('id', requestId)
            }
          }
        }
      } catch { /* non-fatal */ }
    }

    if (!stripePaymentId || stripePaymentId.trim() === '') {
      return NextResponse.json({
        error: 'No Stripe payment ID found for this request. Use "Set Payment ID" to enter it manually.',
      }, { status: 422 })
    }

    // Mark refunded BEFORE Stripe call — webhook sees this and skips
    await svc.from('refund_requests').update({ status: 'refunded' }).eq('id', requestId)

    let stripeRefund: Awaited<ReturnType<typeof stripe.refunds.create>> | null = null
    try {
      stripeRefund = await stripe.refunds.create({ payment_intent: stripePaymentId })
    } catch (stripeErr: any) {
      await svc.from('refund_requests').update({ status: 'pending' }).eq('id', requestId)
      console.error('[admin/refunds] Stripe refund failed:', stripeErr?.message)
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeErr?.message ?? 'Unknown error'}` },
        { status: 502 }
      )
    }

    // Revoke product access
    if (refundReq.product_type === 'subscription') {
      const { data: subRow } = await svc
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', refundReq.user_id)
        .in('status', ['active', 'trialing'])
        .maybeSingle()

      await svc.from('subscriptions').update({
        plan: 'free',
        status: 'refunded',
        credits_remaining: 0,
      }).eq('user_id', refundReq.user_id)

      if (subRow?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(subRow.stripe_subscription_id).catch(console.error)
      }
    } else {
      // credit_pack — zero by PI if available, else zero by user_selected_product_id (credits row ID)
      if (stripePaymentId) {
        await svc.from('credits')
          .update({ balance: 0 })
          .eq('user_id', refundReq.user_id)
          .eq('stripe_payment_intent_id', stripePaymentId)
      } else if (refundReq.user_selected_product_id) {
        await svc.from('credits')
          .update({ balance: 0 })
          .eq('id', refundReq.user_selected_product_id)
      }
    }

    const amountStr = stripeRefund.amount ? `$${(stripeRefund.amount / 100).toFixed(2)}` : undefined

    await svc.from('refund_requests').update({
      stripe_payment_id: stripePaymentId,
      stripe_refund_id: stripeRefund.id,
      refund_amount_cents: stripeRefund.amount,
      admin_notes: notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId)

    revalidatePath(`/admin/users/${refundReq.user_id}`)
    revalidatePath('/admin/users')

    await svc.from('notifications').insert({
      user_id: refundReq.user_id,
      type: 'refund_processed',
      message: `Your refund request for ${refundReq.product_label} has been approved and processed.`,
    })

    const { data: userProfile } = await svc
      .from('profiles').select('name, email').eq('id', refundReq.user_id).single()
    if (userProfile?.email) {
      sendRefundProcessedEmail(
        userProfile.email,
        userProfile.name || userProfile.email,
        refundReq.product_label,
        amountStr,
        refundReq.user_id
      ).catch(console.error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[admin/refunds] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
