/**
 * POST /api/admin/catalog/sync-stripe
 *
 * Manual re-sync button for a single catalog row.
 * Called from the admin catalog page when an admin clicks "Re-sync" or
 * from the Stripe Sync tab in the edit modal.
 *
 * Body: { productId: string }
 *
 * Auto-sync on price change happens inside the main /api/admin/catalog PATCH handler.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'
import { syncProductToStripe } from '@/lib/catalog-stripe-sync'

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

export async function POST(request: NextRequest) {
  const role = await getCallerRole()
  if (!canDo(role, 'manage_catalog')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const productId = body.productId as string | undefined
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  const result = await syncProductToStripe(productId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    newStripePriceId: result.newStripePriceId,
    oldStripePriceId: result.oldStripePriceId,
  })
}
