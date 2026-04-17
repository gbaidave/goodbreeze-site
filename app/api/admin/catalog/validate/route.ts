/**
 * POST /api/admin/catalog/validate
 *
 * Runs the 7 catalog validator checks and returns a summary + list of
 * errors/warnings. Called by the "Run validator" button on /admin/catalog.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'
import { runCatalogValidator } from '@/lib/catalog-validator'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getCallerRole() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const svc = createServiceClient()
  const { data: profile } = await svc.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role ?? null
}

export async function POST() {
  const role = await getCallerRole()
  if (!canDo(role, 'manage_catalog')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const result = await runCatalogValidator()
  return NextResponse.json(result)
}
