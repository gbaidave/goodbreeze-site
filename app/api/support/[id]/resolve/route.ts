/**
 * PATCH /api/support/[id]/resolve
 *
 * Admin-only. Mark a support ticket as resolved.
 *
 * Flow:
 * 1. Authenticate + verify admin role
 * 2. Update support_requests.status → resolved
 * 3. Notify user via bell notification (type=support_resolved)
 * 4. Email user (fire and forget)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendSupportResolvedEmail } from '@/lib/email'

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

    const svc = createServiceClient()

    // 2. Fetch the support request
    const { data: supportReq } = await svc
      .from('support_requests')
      .select('id, user_id, email, status')
      .eq('id', requestId)
      .single()

    if (!supportReq) {
      return NextResponse.json({ error: 'Support request not found.' }, { status: 404 })
    }

    if (supportReq.status === 'resolved') {
      return NextResponse.json({ error: 'Already resolved.' }, { status: 400 })
    }

    // 3. Mark resolved
    const { error: updateError } = await svc
      .from('support_requests')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (updateError) {
      console.error('Support resolve update error:', updateError)
      return NextResponse.json({ error: 'Failed to resolve ticket.' }, { status: 500 })
    }

    // 4. Bell notification for the user (fire and forget)
    if (supportReq.user_id) {
      void svc.from('notifications').insert({
        user_id: supportReq.user_id,
        type: 'support_resolved',
        message: 'Your support request has been resolved.',
      }).then(({ error }) => {
        if (error) console.error('Support resolved notification error:', error)
      })
    }

    // 5. Email the user (fire and forget)
    if (supportReq.user_id) {
      const { data: userProfile } = await svc
        .from('profiles')
        .select('name, email')
        .eq('id', supportReq.user_id)
        .single()
      const toEmail = userProfile?.email || supportReq.email
      const toName = userProfile?.name || toEmail.split('@')[0]
      sendSupportResolvedEmail(toEmail, toName, supportReq.user_id)
        .catch((err) => console.error('Support resolved email failed:', err))
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Support resolve error:', error)
    return NextResponse.json({ error: 'Failed to resolve ticket.' }, { status: 500 })
  }
}
