/**
 * PATCH /api/support/[id]/admin-close
 *
 * Admin-only. Close a support ticket with a required reason.
 * User receives bell notification + email with the reason.
 *
 * Flow:
 * 1. Authenticate + verify admin role
 * 2. Validate reason (min 10 chars)
 * 3. Update status → closed, set close_reason + closed_by='admin'
 * 4. Bell notification for user (type=support_closed)
 * 5. Email user with reason (fire and forget)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendSupportClosedEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

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

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 2. Validate reason
    const body = await request.json()
    const reason = (body.reason ?? '').trim()
    if (reason.length < 10) {
      return NextResponse.json({ error: 'Please provide a reason (at least 10 characters).' }, { status: 400 })
    }

    const svc = createServiceClient()

    // 3. Fetch the support request
    const { data: supportReq } = await svc
      .from('support_requests')
      .select('id, user_id, email, status')
      .eq('id', requestId)
      .single()

    if (!supportReq) {
      return NextResponse.json({ error: 'Support request not found.' }, { status: 404 })
    }

    if (supportReq.status === 'closed') {
      return NextResponse.json({ error: 'Ticket is already closed.' }, { status: 400 })
    }

    // 4. Close the ticket
    const { error: updateError } = await svc
      .from('support_requests')
      .update({
        status: 'closed',
        close_reason: reason,
        closed_by: 'admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Admin close update error:', updateError)
      return NextResponse.json({ error: 'Failed to close ticket.' }, { status: 500 })
    }

    // 5. Bell notification for user (fire and forget)
    if (supportReq.user_id) {
      void svc.from('notifications').insert({
        user_id: supportReq.user_id,
        type: 'support_closed',
        message: 'Your support request has been closed.',
      }).then(({ error }) => {
        if (error) console.error('Support admin-close notification error:', error)
      })
    }

    // 6. Email user with reason (fire and forget)
    if (supportReq.user_id) {
      const { data: userProfile } = await svc
        .from('profiles')
        .select('name, email')
        .eq('id', supportReq.user_id)
        .single()
      const toEmail = userProfile?.email || supportReq.email
      const toName = userProfile?.name || toEmail.split('@')[0]
      sendSupportClosedEmail(toEmail, toName, reason, supportReq.user_id)
        .catch((err) => console.error('Support admin-close email failed:', err))
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin close error:', error)
    return NextResponse.json({ error: 'Failed to close ticket.' }, { status: 500 })
  }
}
