/**
 * POST /api/bug-report
 *
 * Tester-only endpoint for submitting bug reports.
 * Creates a support_requests entry with structured fields, creates the initial
 * support_message, and returns { requestId, messageId } so the client can
 * upload attachments via /api/support/attachments.
 *
 * Also emails dave@goodbreeze.ai and notifies all admin users via the bell.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendBugReportNotificationEmail } from '@/lib/email'

const MIN_SUBJECT_LEN = 5
const MAX_SUBJECT_LEN = 120
const MIN_DESC_LEN = 10
const MAX_DESC_LEN = 2000

const VALID_IMPORTANCE = ['low', 'medium', 'high'] as const
const VALID_BUG_CATEGORIES = [
  'login_auth',
  'account_profile',
  'dashboard_reports',
  'payments_credits',
  'pdf_report_content',
  'navigation_ui',
  'other',
] as const

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

    // 2. Parse and validate body
    const body = await request.json()
    const subject = (body.subject ?? '').trim()
    const description = (body.description ?? '').trim()
    const importance = body.importance ?? null
    const bug_category = body.bug_category ?? null

    if (subject.length < MIN_SUBJECT_LEN) {
      return NextResponse.json(
        { error: `Subject must be at least ${MIN_SUBJECT_LEN} characters.` },
        { status: 400 }
      )
    }
    if (subject.length > MAX_SUBJECT_LEN) {
      return NextResponse.json(
        { error: `Subject is too long (max ${MAX_SUBJECT_LEN} characters).` },
        { status: 400 }
      )
    }
    if (description.length < MIN_DESC_LEN) {
      return NextResponse.json(
        { error: 'Please describe the bug (at least 10 characters).' },
        { status: 400 }
      )
    }
    if (description.length > MAX_DESC_LEN) {
      return NextResponse.json(
        { error: `Description is too long (max ${MAX_DESC_LEN} characters).` },
        { status: 400 }
      )
    }
    if (importance && !VALID_IMPORTANCE.includes(importance)) {
      return NextResponse.json({ error: 'Invalid importance value.' }, { status: 400 })
    }
    if (bug_category && !VALID_BUG_CATEGORIES.includes(bug_category)) {
      return NextResponse.json({ error: 'Invalid bug category.' }, { status: 400 })
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
        message: description,
        subject,
        importance: importance || null,
        bug_category: bug_category || null,
        category: 'bug_report',
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

    const requestId = insertedRequest.id

    // 5. Create initial support message (awaited — we need messageId for attachment uploads)
    const { data: insertedMessage, error: messageError } = await svc
      .from('support_messages')
      .insert({
        request_id: requestId,
        sender_id: user.id,
        sender_role: 'user',
        message: description,
      })
      .select('id')
      .single()

    if (messageError || !insertedMessage) {
      console.error('Bug report initial message insert error:', messageError)
      // Request was created — return requestId even if message failed (non-fatal)
      return NextResponse.json({ success: true, requestId, messageId: null })
    }

    const messageId = insertedMessage.id

    // 6. Email dave@goodbreeze.ai (fire and forget)
    sendBugReportNotificationEmail({ userName, userEmail, planAtTime: plan, lastReportContext, message: `[${subject}]\n\n${description}` }, user.id)
      .catch((err) => console.error('Bug report notification email failed:', err))

    // 7. Bell notification for all admin users (fire and forget)
    void (async () => {
      try {
        const { data: admins } = await svc
          .from('profiles')
          .select('id')
          .in('role', ['superadmin', 'admin', 'support'])
        if (admins?.length) {
          await svc.from('notifications').insert(
            admins.map((a) => ({
              user_id: a.id,
              type: 'support_request',
              message: `[Bug Report] ${subject} — from ${userName} (${userEmail})`,
            }))
          )
        }
      } catch (e) {
        console.error('Bug report admin notification error:', e)
      }
    })()

    return NextResponse.json({ success: true, requestId, messageId })

  } catch (error) {
    console.error('Bug report error:', error)
    return NextResponse.json(
      { error: 'Failed to submit bug report. Please try again.' },
      { status: 500 }
    )
  }
}
