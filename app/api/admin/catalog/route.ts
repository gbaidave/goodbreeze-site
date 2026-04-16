import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { canDo } from '@/lib/permissions'
import { invalidateCatalogCache } from '@/lib/catalog'

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
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const svc = createServiceClient()
  const { data: profile } = await svc.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role ?? null
}

export async function GET() {
  const role = await getCallerRole()
  if (!role || role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin required' }, { status: 403 })
  }

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('products')
    .select('id, sku, name, product_type, price_credits, price_usd_cents, stripe_price_id, active, display_order, metadata, status')
    .not('sku', 'is', null)
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function PATCH(request: NextRequest) {
  const role = await getCallerRole()
  if (!role || role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin required' }, { status: 403 })
  }

  const body = await request.json()
  const { id, price_credits, price_usd_cents, active, display_order, metadata } = body

  if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (price_credits !== undefined) updates.price_credits = price_credits
  if (price_usd_cents !== undefined) updates.price_usd_cents = price_usd_cents
  if (active !== undefined) updates.active = active
  if (display_order !== undefined) updates.display_order = display_order
  if (metadata !== undefined) updates.metadata = metadata

  const svc = createServiceClient()
  const { error } = await svc.from('products').update(updates).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  invalidateCatalogCache()
  return NextResponse.json({ success: true })
}
