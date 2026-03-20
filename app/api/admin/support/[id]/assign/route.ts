/**
 * PATCH /api/admin/support/[id]/assign
 *
 * Updates the assignee_id on a support request.
 * Permission rules:
 *   - superadmin / admin: can assign any bug to anyone
 *   - support / tester: can only reassign if they ARE the current assignee
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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
  const { data: profile } = await svc
    .from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role ?? ''

  if (!['superadmin', 'admin', 'support', 'tester'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const newAssigneeId: string | null = body.assignee_id ?? null

  // Non-admin roles can only reassign if they ARE the current assignee
  if (!['superadmin', 'admin'].includes(role)) {
    const { data: existing } = await svc
      .from('support_requests')
      .select('assignee_id')
      .eq('id', id)
      .single()
    if (existing?.assignee_id !== user.id) {
      return NextResponse.json({ error: 'You can only reassign bugs assigned to you.' }, { status: 403 })
    }
  }

  // Resolve the new assignee name for the assigned_to text field
  let assignedToName: string | null = null
  if (newAssigneeId) {
    const { data: assigneeProfile } = await svc
      .from('profiles')
      .select('name, email')
      .eq('id', newAssigneeId)
      .single()
    assignedToName = assigneeProfile?.name || assigneeProfile?.email || null
  }

  const { error } = await svc
    .from('support_requests')
    .update({ assignee_id: newAssigneeId, assigned_to: assignedToName })
    .eq('id', id)

  if (error) {
    console.error('[api/admin/support/[id]/assign] Update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Bell notification to newly assigned user
  if (newAssigneeId && newAssigneeId !== user.id) {
    void svc.from('notifications').insert({
      user_id: newAssigneeId,
      type: 'support_request',
      message: `A bug report has been assigned to you.`,
    }).then(null, console.error)
  }

  return NextResponse.json({ success: true })
}
