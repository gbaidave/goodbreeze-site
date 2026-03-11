/**
 * GET /api/admin/failures
 *
 * Returns failed/failed_site_blocked reports with user info.
 * Supports filtering by status, report_type, failure_type, date_range, user_email.
 * Supports sorting by created_at, report_type, admin_failure_status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'

async function requireAdmin(): Promise<boolean> {
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
  if (!user) return false

  const svc = createServiceClient()
  const { data: profile } = await svc
    .from('profiles').select('role').eq('id', user.id).single()
  return canDo(profile?.role, 'view_error_monitoring')
}

export async function GET(request: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const statusFilter  = searchParams.get('status')      ?? 'all'
  const reportType    = searchParams.get('report_type') ?? 'all'
  const failureType   = searchParams.get('failure_type') ?? 'all'
  const dateRange     = searchParams.get('date_range')  ?? '30d'
  const userEmail     = searchParams.get('user_email')  ?? ''
  const sort          = searchParams.get('sort')        ?? 'created_at'
  const ascending     = searchParams.get('order') === 'asc'

  const svc = createServiceClient()

  let query = svc
    .from('reports')
    .select(`
      id, report_type, status, created_at, input_data,
      n8n_execution_id, admin_failure_status, admin_failure_notes, usage_type,
      profiles!inner ( name, email )
    `)
    .in('status', ['failed', 'failed_site_blocked'])

  // Date range
  if (dateRange !== 'all') {
    const cutoff = new Date()
    if (dateRange === 'today') {
      cutoff.setHours(0, 0, 0, 0)
    } else {
      const days = dateRange === '7d' ? 7 : 30
      cutoff.setDate(cutoff.getDate() - days)
    }
    query = query.gte('created_at', cutoff.toISOString())
  }

  // Failure type (failed vs failed_site_blocked)
  if (failureType !== 'all') {
    query = query.eq('status', failureType)
  }

  // Report type
  if (reportType !== 'all') {
    query = query.eq('report_type', reportType)
  }

  // Admin status
  if (statusFilter !== 'all') {
    query = query.eq('admin_failure_status', statusFilter)
  }

  // Sort
  const sortCol = ['created_at', 'report_type', 'admin_failure_status'].includes(sort)
    ? sort : 'created_at'
  query = query.order(sortCol, { ascending })

  const { data, error } = await query

  if (error) {
    console.error('[api/admin/failures] Query error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  // Filter by user email client-side (after join)
  let results = data ?? []
  if (userEmail.trim()) {
    const q = userEmail.toLowerCase()
    results = results.filter((r: any) =>
      (r.profiles as any)?.email?.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({ failures: results })
}
