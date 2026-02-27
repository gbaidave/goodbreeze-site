/**
 * PATCH /api/support/[id]/reopen
 *
 * Authenticated user reopens their own closed or resolved support ticket.
 *
 * Flow:
 * 1. Authenticate user + verify ownership
 * 2. Verify ticket is closed or resolved
 * 3. Update status → open, clear close_reason + closed_by
 * 4. Notify all admins via bell (type=support_followup)
 * 5. Email support@ (fire and forget)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendSupportAdminNotificationEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

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

    const svc = createServiceClient()

    // Ownership check
    const { data: ticket } = await svc
      .from('support_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    }

    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      return NextResponse.json({ error: 'Only closed or resolved tickets can be reopened.' }, { status: 400 })
    }

    // Reopen the ticket
    const { error: updateError } = await svc
      .from('support_requests')
      .update({
        status: 'open',
        close_reason: null,
        closed_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Support reopen update error:', updateError)
      return NextResponse.json({ error: 'Failed to reopen ticket.' }, { status: 500 })
    }

    // Fetch user profile for notification context
    const { data: profile } = await svc
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()
    const userName = profile?.name || user.email!.split('@')[0]
    const userEmail = profile?.email || user.email!

    // Notify all admins via bell (fire and forget)
    void (async () => {
      try {
        const { data: admins } = await svc.from('profiles').select('id').eq('role', 'admin')
        if (admins?.length) {
          await svc.from('notifications').insert(
            admins.map((a) => ({
              user_id: a.id,
              type: 'support_followup',
              message: `${userName} reopened their support request.`,
            }))
          )
        }
      } catch (e) {
        console.error('Support reopen admin notification error:', e)
      }
    })()

    // Email support@ (fire and forget)
    sendSupportAdminNotificationEmail(
      { userName, userEmail, action: 'reopened', requestId },
      user.id
    ).catch((err) => console.error('Support reopen admin email failed:', err))

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
