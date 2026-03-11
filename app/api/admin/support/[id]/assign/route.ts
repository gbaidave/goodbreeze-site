/**
 * PATCH /api/admin/support/[id]/assign
 *
 * Assign or unassign a support ticket's assignee_id.
 * Body: { assignee_id: string | null }
 *
 * Access rules:
 * - admin/superadmin: can assign to any user with role in [superadmin, admin, support]
 * - support: can only self-assign (assignee_id must equal their own user.id or null)
 *
 * On assignment: bell notification to the new assignee.
 * On unassignment: no notification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const svc = createServiceClient()
  const { data: actorProfile } = await svc
    .from('profiles').select('role').eq('id', user.id).single()
  const actorRole = actorProfile?.role

  if (!canDo(actorRole, 'assign_ticket')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json()
  const { assignee_id } = body as { assignee_id: string | null }

  // support role: can only self-assign or unassign
  if (actorRole === 'support') {
    if (assignee_id !== null && assignee_id !== user.id) {
      return NextResponse.json({ error: 'Support role can only self-assign.' }, { status: 403 })
    }
  }

  // If assigning, verify the target user exists and has an eligible role
  if (assignee_id !== null) {
    const { data: assigneeProfile } = await svc
      .from('profiles').select('role, name').eq('id', assignee_id).single()
    if (!assigneeProfile || !['superadmin', 'admin', 'support'].includes(assigneeProfile.role)) {
      return NextResponse.json({ error: 'Invalid assignee — must be admin or support role.' }, { status: 400 })
    }
  }

  // Verify ticket exists
  const { data: ticket } = await svc
    .from('support_requests')
    .select('id, user_id')
    .eq('id', ticketId)
    .single()
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  // Update assignee_id
  const { error: updateError } = await svc
    .from('support_requests')
    .update({ assignee_id: assignee_id ?? null })
    .eq('id', ticketId)

  if (updateError) {
    console.error('[assign] Update error:', updateError)
    return NextResponse.json({ error: 'Assignment failed.' }, { status: 500 })
  }

  // Bell notification to new assignee (fire and forget)
  if (assignee_id) {
    void svc.from('notifications').insert({
      user_id: assignee_id,
      type: 'support_request',
      message: `You have been assigned a support ticket.`,
    }).then(({ error }) => {
      if (error) console.error('[assign] Notification error:', error)
    })
  }

  return NextResponse.json({ success: true })
}
