/**
 * PATCH /api/admin/refunds/[id]
 *
 * Admin action on a refund request: issue Stripe refund or deny.
 * Body: { action: 'refund' | 'deny', notes?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service-client'
import { stripe } from '@/lib/stripe'
import { canDo } from '@/lib/permissions'
import { sendRefundProcessedEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

    // Auth — admin only
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

    const { action, notes, stripePaymentId: incomingPaymentId } = await request.json()
    if (!['refund', 'deny', 'set_payment_id'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }

    // Load the refund request
    const { data: refundReq } = await svc
      .from('refund_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!refundReq) {
      return NextResponse.json({ error: 'Refund request not found.' }, { status: 404 })
    }
    if (refundReq.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been processed.' }, { status: 409 })
    }

    if (action === 'set_payment_id') {
      const pid = (incomingPaymentId ?? '').trim()
      if (!pid.startsWith('pi_')) {
        return NextResponse.json({ error: 'Invalid payment intent ID — must start with pi_.' }, { status: 400 })
      }

      // Look up the payment details from Stripe to populate amount and date
      let amountPaidCents: number | null = null
      let purchaseDate: string | null = null
      try {
        const pi = await stripe.paymentIntents.retrieve(pid)
        amountPaidCents = pi.amount ?? null
        purchaseDate = pi.created ? new Date(pi.created * 1000).toISOString() : null
      } catch {
        // Non-fatal — save the ID even if Stripe lookup fails
      }

      await svc.from('refund_requests').update({
        stripe_payment_id: pid,
        ...(amountPaidCents !== null && { amount_paid_cents: amountPaidCents }),
        ...(purchaseDate !== null && { purchase_date: purchaseDate }),
      }).eq('id', requestId)
      return NextResponse.json({ success: true })
    }

    if (action === 'deny') {
      await svc.from('refund_requests').update({
        status: 'denied',
        admin_notes: notes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', requestId)

      return NextResponse.json({ success: true })
    }

    // action === 'refund'
    // Guard: credits must not have been used
    if (refundReq.credits_used_at_request > 0) {
      return NextResponse.json({ error: 'Refund ineligible — credits have been used.' }, { status: 422 })
    }

    // Guard: must have a valid Stripe payment ID
    if (!refundReq.stripe_payment_id || refundReq.stripe_payment_id.trim() === '') {
      return NextResponse.json({ error: 'No Stripe payment ID on file for this request. Cannot issue automated refund — process manually in Stripe dashboard.' }, { status: 422 })
    }

    // Issue via Stripe
    let stripeRefund: Awaited<ReturnType<typeof stripe.refunds.create>> | null = null
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: refundReq.stripe_payment_id,
      })
    } catch (stripeErr: any) {
      console.error('[admin/refunds] Stripe refund failed:', stripeErr?.message)
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeErr?.message ?? 'Unknown error'}` },
        { status: 502 }
      )
    }

    // Revoke product access — must happen here because the charge.refunded webhook
    // will see status='refunded' (set below) and skip, so this route owns revocation.
    if (refundReq.product_type === 'subscription') {
      const { data: subRow } = await svc
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', refundReq.user_id)
        .in('status', ['active', 'trialing'])
        .maybeSingle()

      // Update DB to 'refunded' BEFORE cancelling in Stripe so that when the
      // customer.subscription.deleted webhook fires it sees 'refunded' and skips,
      // rather than overwriting our status back to 'cancelled'.
      await svc.from('subscriptions').update({
        plan: 'free',
        status: 'refunded',
        credits_remaining: 0,
      }).eq('user_id', refundReq.user_id)

      // Cancel in Stripe only if we have a subscription ID (stops future billing)
      if (subRow?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(subRow.stripe_subscription_id).catch(console.error)
      }
    } else if (refundReq.product_type === 'credit_pack' || refundReq.product_type === 'credits') {
      if (refundReq.stripe_payment_id) {
        await svc.from('credits')
          .update({ balance: 0 })
          .eq('user_id', refundReq.user_id)
          .eq('stripe_payment_intent_id', refundReq.stripe_payment_id)
      } else {
        // No PI on file — zero the most recent non-zero pack credit row
        const { data: latestCredit } = await svc
          .from('credits')
          .select('id')
          .eq('user_id', refundReq.user_id)
          .gt('balance', 0)
          .not('source', 'in', '("admin_grant","signup_credit","signup_bonus","free_credit","testimonial_reward","referral_credit","credit_grant")')
          .order('purchased_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (latestCredit) {
          await svc.from('credits').update({ balance: 0 }).eq('id', latestCredit.id)
        }
      }
    }

    const amountStr = stripeRefund.amount ? `$${(stripeRefund.amount / 100).toFixed(2)}` : undefined

    await svc.from('refund_requests').update({
      status: 'refunded',
      stripe_refund_id: stripeRefund.id,
      refund_amount_cents: stripeRefund.amount,
      admin_notes: notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId)

    // Bust server-side cache for admin user pages
    revalidatePath(`/admin/users/${refundReq.user_id}`)
    revalidatePath('/admin/users')

    // Notify user via bell
    await svc.from('notifications').insert({
      user_id: refundReq.user_id,
      type: 'refund_processed',
      message: `Your refund request for ${refundReq.product_label} has been approved and processed.`,
    })

    // Email notification (fire and forget)
    const { data: userProfile } = await svc
      .from('profiles')
      .select('name, email')
      .eq('id', refundReq.user_id)
      .single()
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
