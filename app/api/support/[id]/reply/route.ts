/**
 * POST /api/support/[id]/reply
 *
 * Admin-only. Add a reply message to a support ticket thread.
 *
 * Flow:
 * 1. Authenticate + verify admin role
 * 2. Insert message into support_messages (sender_role='admin')
 * 3. Update support_requests.status → in_progress (if currently open)
 * 4. Notify user via bell notification (type=support_reply)
 * 5. Email user (fire and forget)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendSupportReplyEmail } from '@/lib/email'

export async function POST(
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

    // 2. Parse + validate message
    const body = await request.json()
    const message = (body.message ?? '').trim()
    if (message.length < 1) {
      return NextResponse.json({ error: 'Reply message is required.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Reply is too long (max 5000 characters).' }, { status: 400 })
    }

    const svc = createServiceClient()

    // 3. Fetch the support request to verify it exists + get user info
    const { data: supportReq } = await svc
      .from('support_requests')
      .select('id, user_id, email, status')
      .eq('id', requestId)
      .single()

    if (!supportReq) {
      return NextResponse.json({ error: 'Support request not found.' }, { status: 404 })
    }

    // 4. Insert admin message into thread
    const { error: msgError } = await svc.from('support_messages').insert({
      request_id: requestId,
      sender_id: user.id,
      sender_role: 'admin',
      message,
    })

    if (msgError) {
      console.error('Support reply insert error:', msgError)
      return NextResponse.json({ error: 'Failed to send reply.' }, { status: 500 })
    }

    // 5. Update status to in_progress if currently open
    if (supportReq.status === 'open') {
      await svc
        .from('support_requests')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', requestId)
    }

    // 6. Bell notification for the user (fire and forget)
    if (supportReq.user_id) {
      void svc.from('notifications').insert({
        user_id: supportReq.user_id,
        type: 'support_reply',
        message: 'Good Breeze AI replied to your support request.',
      }).then(({ error }) => {
        if (error) console.error('Support reply notification error:', error)
      })
    }

    // 7. Email the user (fire and forget)
    if (supportReq.user_id) {
      const { data: userProfile } = await svc
        .from('profiles')
        .select('name, email')
        .eq('id', supportReq.user_id)
        .single()
      const toEmail = userProfile?.email || supportReq.email
      const toName = userProfile?.name || toEmail.split('@')[0]
      sendSupportReplyEmail(toEmail, toName, message, supportReq.user_id)
        .catch((err) => console.error('Support reply email failed:', err))
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Support reply error:', error)
    return NextResponse.json({ error: 'Failed to send reply.' }, { status: 500 })
  }
}
