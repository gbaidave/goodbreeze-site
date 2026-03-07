import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'

const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const

export async function POST(request: NextRequest) {
  // Verify admin session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse form body
  const body = await request.formData()
  const id = body.get('id') as string
  const status = body.get('status') as string
  const rejectionReason = (body.get('rejection_reason') as string | null) ?? ''

  if (!id || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  // Fetch testimonial before updating (need user_id + credits_granted + type)
  const { data: testimonial, error: fetchError } = await serviceClient
    .from('testimonials')
    .select('user_id, credits_granted, type')
    .eq('id', id)
    .single()

  if (fetchError || !testimonial) {
    return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
  }

  const { error } = await serviceClient
    .from('testimonials')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Post-action: grant credits on approval, send user notification for approve/reject
  if (status === 'approved') {
    const credits = testimonial.credits_granted ?? 0
    if (credits > 0) {
      await serviceClient.from('credits').insert({
        user_id: testimonial.user_id,
        balance: credits,
        product: null,
        expires_at: null,
        purchased_at: new Date().toISOString(),
      })
    }
    const creditLabel = credits === 1 ? '1 credit' : `${credits} credits`
    const approvalMessage = credits > 0
      ? `Thank you for your ${testimonial.type} testimonial submission! ${creditLabel} have been added to your account.`
      : `Thank you for your ${testimonial.type} testimonial submission! It has been approved.`
    await serviceClient.from('notifications').insert({
      user_id: testimonial.user_id,
      type: 'testimonial_credit',
      message: approvalMessage,
    })
  } else if (status === 'rejected') {
    const rejectionMessages: Record<string, string> = {
      not_enough_detail: `Your ${testimonial.type} testimonial wasn\u2019t selected \u2014 it could use more detail about your specific results. Feel free to resubmit.`,
      no_gbai_mention: `Your ${testimonial.type} testimonial wasn\u2019t selected \u2014 make sure to mention Good Breeze AI specifically. Feel free to resubmit.`,
      video_quality: `Your video testimonial wasn\u2019t selected due to audio or video quality. Try refilming somewhere quiet with good lighting and resubmit.`,
      too_short: `Your ${testimonial.type} testimonial wasn\u2019t selected \u2014 it was a bit brief. Try expanding on your results and resubmit.`,
      not_a_fit: `Your ${testimonial.type} testimonial wasn\u2019t selected this time. You\u2019re welcome to submit a new one.`,
      duplicate: `Your ${testimonial.type} testimonial wasn\u2019t selected \u2014 a similar submission already exists. Feel free to submit something new.`,
      policy_violation: `Your ${testimonial.type} testimonial wasn\u2019t selected \u2014 it didn\u2019t meet our submission guidelines. Review the guidelines and resubmit.`,
      other: `Your ${testimonial.type} testimonial wasn\u2019t selected this time. You\u2019re welcome to submit a new one.`,
    }
    const message = rejectionMessages[rejectionReason] ?? rejectionMessages.not_a_fit
    await serviceClient.from('notifications').insert({
      user_id: testimonial.user_id,
      type: 'testimonial_rejected',
      message,
    })
  }

  // Redirect back to testimonials page (form POST → redirect)
  const referer = request.headers.get('referer') ?? '/admin/testimonials'
  return NextResponse.redirect(new URL(referer, request.url))
}
