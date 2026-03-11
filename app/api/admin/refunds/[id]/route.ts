/**
 * PATCH /api/admin/refunds/[id]
 *
 * Admin action on a refund request: issue Stripe refund or deny.
 * Body: { action: 'refund' | 'deny', notes?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { stripe } from '@/lib/stripe'
import { canDo } from '@/lib/permissions'

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
      await svc.from('refund_requests').update({ stripe_payment_id: pid }).eq('id', requestId)
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

    await svc.from('refund_requests').update({
      status: 'refunded',
      stripe_refund_id: stripeRefund.id,
      refund_amount_cents: stripeRefund.amount,
      admin_notes: notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId)

    // Notify user via bell
    await svc.from('notifications').insert({
      user_id: refundReq.user_id,
      type: 'info',
      message: `Your refund request for ${refundReq.product_label} has been approved and processed. Please allow 5–10 business days for the amount to appear on your statement.`,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[admin/refunds] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
