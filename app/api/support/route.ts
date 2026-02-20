/**
 * POST /api/support
 *
 * Authenticated support request endpoint.
 * Auto-fills user context (plan, last report) and notifies support@goodbreeze.ai.
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate message
 * 3. Fetch user context (plan, last report) via service client
 * 4. Insert into support_requests table
 * 5. Email support@goodbreeze.ai (reply-to = user email)
 * 6. Return success
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendSupportNotificationEmail } from '@/lib/email'

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
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Validate message
    const body = await request.json()
    const message = (body.message ?? '').trim()

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

    // 3. Fetch user context (use service client to bypass RLS consistently)
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
    const { error: insertError } = await svc.from('support_requests').insert({
      user_id: user.id,
      email: userEmail,
      plan_at_time: plan,
      last_report_context: lastReportContext,
      message,
    })

    if (insertError) {
      console.error('Support request insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      )
    }

    // 5. Notify support (fire and forget — don't fail the user if email fails)
    sendSupportNotificationEmail({ userName, userEmail, planAtTime: plan, lastReportContext, message })
      .catch((err) => console.error('Support notification email failed:', err))

    // 6. Return success
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Support request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    )
  }
}
