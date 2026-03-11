/**
 * GET  /api/admin/settings  — returns all admin_settings as { key: value } object
 * PATCH /api/admin/settings — upserts one or more allowed settings keys
 *
 * Admin auth required for both.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'

const ALLOWED_KEYS = [
  'failure_email_enabled',
  'digest_email_enabled',
  'digest_send_hour_pacific',
]

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
  return canDo(profile?.role, 'system_settings')
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 })
  }

  const svc = createServiceClient()
  const { data } = await svc.from('admin_settings').select('key, value')
  const settings = Object.fromEntries((data ?? []).map(row => [row.key, row.value]))
  return NextResponse.json({ settings })
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 })
  }

  const body = await request.json()
  const updates = Object.entries(body)
    .filter(([k]) => ALLOWED_KEYS.includes(k))
    .map(([key, value]) => ({ key, value: String(value) }))

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid keys provided' }, { status: 400 })
  }

  const svc = createServiceClient()
  for (const row of updates) {
    await svc.from('admin_settings').upsert(row, { onConflict: 'key' })
  }

  return NextResponse.json({ success: true })
}
