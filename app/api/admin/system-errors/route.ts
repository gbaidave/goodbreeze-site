/**
 * GET /api/admin/system-errors
 *
 * Admin-only. Returns system errors with optional filters.
 * Query params: type, resolved, date_range (today|7d|30d|all), limit
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'

export async function GET(request: NextRequest) {
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
  if (!canDo(profile?.role, 'view_error_monitoring')) {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'all'
  const resolvedParam = searchParams.get('resolved') ?? 'all'
  const dateRange = searchParams.get('date_range') ?? '30d'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '200', 10), 500)

  let query = svc
    .from('system_errors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type !== 'all') {
    query = query.eq('type', type)
  }

  if (resolvedParam === 'true') {
    query = query.eq('resolved', true)
  } else if (resolvedParam === 'false') {
    query = query.eq('resolved', false)
  }

  if (dateRange !== 'all') {
    const ms: Record<string, number> = { today: 86400000, '7d': 604800000, '30d': 2592000000 }
    if (ms[dateRange]) {
      query = query.gte('created_at', new Date(Date.now() - ms[dateRange]).toISOString())
    }
  }

  const { data: errors, error } = await query

  if (error) {
    console.error('[api/admin/system-errors] Query error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  return NextResponse.json({ errors: errors ?? [] })
}
