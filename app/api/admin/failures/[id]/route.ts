/**
 * PATCH /api/admin/failures/[id]
 *
 * Updates admin_failure_status and/or admin_failure_notes on a failed report.
 * Admin auth required.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

const VALID_STATUSES = ['unresolved', 'in_progress', 'resolved', 'wont_fix']

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
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, string | null> = {}

  if (body.admin_failure_status !== undefined) {
    if (!VALID_STATUSES.includes(body.admin_failure_status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    updates.admin_failure_status = body.admin_failure_status
  }

  if (body.admin_failure_notes !== undefined) {
    updates.admin_failure_notes = body.admin_failure_notes || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await svc
    .from('reports')
    .update(updates)
    .eq('id', id)
    .in('status', ['failed', 'failed_site_blocked'])

  if (error) {
    console.error('[api/admin/failures/[id]] Update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
