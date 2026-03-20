/**
 * PATCH /api/admin/support/[id]
 *
 * Admin-only. Updates admin-facing fields on a support request.
 * Supports: assigned_to (free text, nullable), priority, status.
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
  if (!canDo(profile?.role, 'view_all_tickets')) {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, string | null> = {}

  if ('assigned_to' in body) {
    const val = body.assigned_to
    if (val !== null && typeof val !== 'string') {
      return NextResponse.json({ error: 'assigned_to must be a string or null' }, { status: 400 })
    }
    updates.assigned_to = val ? val.trim().slice(0, 100) || null : null
  }

  if ('priority' in body) {
    const val = body.priority
    const valid = ['low', 'medium', 'high', 'critical', null]
    if (!valid.includes(val)) {
      return NextResponse.json({ error: 'Invalid priority value.' }, { status: 400 })
    }
    updates.priority = val
  }

  if ('status' in body) {
    const val = body.status
    const valid = ['open', 'in_progress', 'resolved', 'closed', 'info_needed', 'dupe', 'reopened']
    if (!valid.includes(val)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
    }
    updates.status = val
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // Fetch the request before update so we can notify the reporter
  const { data: existing } = await svc
    .from('support_requests')
    .select('user_id, subject, bug_number, status')
    .eq('id', id)
    .single()

  const { error } = await svc
    .from('support_requests')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('[api/admin/support/[id]] Update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Bell notification to reporter when status or priority changes
  if (existing?.user_id && ('status' in updates || 'priority' in updates)) {
    const bugRef = existing.bug_number ? `Bug #${existing.bug_number}` : 'Your bug report'
    const what = 'status' in updates
      ? `status changed to ${(updates.status as string).replace('_', ' ')}`
      : `priority updated`
    void svc.from('notifications').insert({
      user_id: existing.user_id,
      type: 'support_request',
      message: `${bugRef} — ${what}.`,
    }).then(null, console.error)
  }

  return NextResponse.json({ success: true })
}
