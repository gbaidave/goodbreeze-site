/**
 * POST /api/bug-report
 *
 * Tester-only endpoint for submitting bug reports.
 * Creates a support_requests entry (appears in admin support inbox),
 * emails dave@goodbreeze.ai, and notifies all admin users via the bell.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendBugReportNotificationEmail } from '@/lib/email'

const MIN_MESSAGE_LEN = 10
const MAX_MESSAGE_LEN = 2000

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

    // 2. Validate message
    const body = await request.json()
    const message = (body.message ?? '').trim()

    if (message.length < MIN_MESSAGE_LEN) {
      return NextResponse.json(
        { error: 'Please describe the bug (at least 10 characters).' },
        { status: 400 }
      )
    }
    if (message.length > MAX_MESSAGE_LEN) {
      return NextResponse.json(
        { error: `Message is too long (max ${MAX_MESSAGE_LEN} characters).` },
        { status: 400 }
      )
    }

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
      })
      .select('id')
      .single()

    if (insertError || !insertedRequest) {
      console.error('Bug report insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit bug report. Please try again.' },
        { status: 500 }
      )
    }

    // 5. Email dave@goodbreeze.ai (fire and forget)
    sendBugReportNotificationEmail({ userName, userEmail, planAtTime: plan, lastReportContext, message }, user.id)
      .catch((err) => console.error('Bug report notification email failed:', err))

    // 5b. Initial message in support thread
    void svc.from('support_messages').insert({
      request_id: insertedRequest.id,
      sender_id: user.id,
      sender_role: 'user',
      message,
    }).then(({ error }) => {
      if (error) console.error('Bug report initial message insert error:', error)
    })

    // 5c. Bell notification for all admin users (fire and forget)
    void (async () => {
      try {
        const { data: admins } = await svc
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
        if (admins?.length) {
          await svc.from('notifications').insert(
            admins.map((a) => ({
              user_id: a.id,
              type: 'support_request',
              message: `[Bug Report] from ${userName} (${userEmail})`,
            }))
          )
        }
      } catch (e) {
        console.error('Bug report admin notification error:', e)
      }
    })()

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Bug report error:', error)
    return NextResponse.json(
      { error: 'Failed to submit bug report. Please try again.' },
      { status: 500 }
    )
  }
}
