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

const MIN_MESSAGE_LEN = 10
const MAX_MESSAGE_LEN = 2000
const MAX_SUBJECT_LEN = 120

const VALID_CATEGORIES = [
  'account_access', 'report_issue', 'billing', 'refund', 'dispute', 'help', 'feedback',
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // 2. Validate body
    const body = await request.json()
    const message = (body.message ?? '').trim()
    const category: string = body.category ?? 'help'
    const subject = body.subject ? String(body.subject).trim().slice(0, MAX_SUBJECT_LEN) : null
    const productType: string | null = body.product_type ?? null

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

    const priority = category === 'dispute' ? 'high' : 'normal'

    // 3. Fetch user context
    const svc = createServiceClient()
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

    const userName = profileRes.data?.name || user.email!.split('@')[0]
    const userEmail = profileRes.data?.email || user.email!
    const plan = subRes.data?.plan || 'free'
    const lastReport = lastReportRes.data
    const lastReportContext = lastReport
      ? `${lastReport.report_type} (${lastReport.status})`
      : 'No reports yet'

    // 4. Insert support request
    const { data: insertedRequest, error: insertError } = await svc
      .from('support_requests')
      .insert({
        user_id: user.id,
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
        sender_id: user.id,
        sender_role: 'user',
        message,
      })
      .select('id')
      .single()

    const messageId = insertedMsg?.id ?? null

    // 5b. If category = 'refund': create placeholder refund_requests row
    if (category === 'refund') {
      const resolvedProductType = productType && (VALID_PRODUCT_TYPES as readonly string[]).includes(productType)
        ? productType
        : 'subscription'
      const productLabel = resolvedProductType === 'subscription' ? 'Subscription' : 'Credit Pack'

      // Count credits used at time of request to determine eligibility for auto-refund
      // Subscription: reports completed in current billing period
      // Credit pack: all completed reports (credits are non-refundable once used)
      void (async () => {
        try {
          let creditsUsedAtRequest = 0
          if (resolvedProductType === 'subscription') {
            const { data: sub } = await svc.from('subscriptions').select('current_period_start').eq('user_id', user.id).single()
            const periodStart = sub?.current_period_start ?? new Date(0).toISOString()
            const { count } = await svc.from('reports').select('id', { count: 'exact', head: true })
              .eq('user_id', user.id).eq('status', 'complete').gte('created_at', periodStart)
            creditsUsedAtRequest = count ?? 0
          } else {
            // Credit pack: count all completed reports
            const { count } = await svc.from('reports').select('id', { count: 'exact', head: true })
              .eq('user_id', user.id).eq('status', 'complete')
            creditsUsedAtRequest = count ?? 0
          }

          const { error } = await svc.from('refund_requests').insert({
            user_id: user.id,
            stripe_payment_id: null,
            product_type: resolvedProductType,
            product_label: productLabel,
            status: 'pending',
            support_request_id: ticketId,
            credits_used_at_request: creditsUsedAtRequest,
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
      user.id
    ).catch((err) => console.error('Support notification email failed:', err))

    // 5d. Bell notification for all admin users (fire and forget)
    void (async () => {
      try {
        const { data: admins } = await svc.from('profiles').select('id').eq('role', 'admin')
        if (admins?.length) {
          const notifMsg = category === 'dispute'
            ? `🚨 Dispute from ${userName} (${userEmail})`
            : `New ${category.replace('_', ' ')} request from ${userName} (${userEmail})`
          await svc.from('notifications').insert(
            admins.map((a) => ({ user_id: a.id, type: 'support_request', message: notifMsg }))
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
