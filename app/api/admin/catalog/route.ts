/**
 * GET    /api/admin/catalog             — list all catalog rows (superadmin only)
 * POST   /api/admin/catalog             — create new product (auto-syncs to Stripe for plan/pack types)
 * PATCH  /api/admin/catalog             — update existing product (auto-syncs to Stripe if price_usd_cents changed)
 * DELETE /api/admin/catalog?id={id}     — soft-delete (sets active=false, lifecycle_status='retired')
 *
 * Permission: manage_catalog (superadmin only per lib/permissions.ts).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { canDo } from '@/lib/permissions'
import { invalidateCatalogCache } from '@/lib/catalog'
import { syncProductToStripe } from '@/lib/catalog-stripe-sync'
import { generateBaseSku, findAvailableSku, validateSkuFormat } from '@/lib/sku-generator'

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

export async function GET() {
  const role = await getCallerRole()
  if (!canDo(role, 'manage_catalog')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('products')
    .select('id, sku, name, product_type, price_credits, price_usd_cents, credits_granted, stripe_price_id, active, display_order, metadata, description, tagline, features, lifecycle_status, badge, sync_error_detail, last_sync_attempt_at, last_sync_success_at')
    .not('sku', 'is', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[admin/catalog GET] Supabase error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message, code: error.code, hint: error.hint, detail: error.details }, { status: 500 })
  }
  return NextResponse.json({ items: data })
}

// ─── CREATE ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const role = await getCallerRole()
  if (!canDo(role, 'manage_catalog')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const {
    product_type,
    name,
    sku: userSku,         // optional — admin can override the auto-generated SKU
    tagline,
    description,
    features,
    badge,
    display_order,
    price_credits,
    price_usd_cents,
    credits_granted,
    active,
  } = body

  if (!product_type || !name) {
    return NextResponse.json({ error: 'product_type and name are required' }, { status: 400 })
  }

  const svc = createServiceClient()

  // Determine final SKU
  let finalSku: string
  if (userSku && typeof userSku === 'string' && userSku.trim()) {
    finalSku = userSku.trim()
    // Reject if exact match already exists (never reuse SKUs — even retired ones)
    const { data: existing } = await svc.from('products').select('id').eq('sku', finalSku).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: `SKU "${finalSku}" already exists. Choose a different one — SKUs are never reused.` }, { status: 409 })
    }
  } else {
    const base = generateBaseSku(product_type, name)
    if (!base) {
      return NextResponse.json({ error: 'Cannot derive a SKU from the given name.' }, { status: 400 })
    }
    finalSku = await findAvailableSku(base, async (candidate) => {
      const { data } = await svc.from('products').select('id').eq('sku', candidate).maybeSingle()
      return !!data
    })
  }

  // Soft-validate and log warnings (don't block)
  const skuCheck = validateSkuFormat(finalSku)
  if (!skuCheck.valid) {
    console.warn(`[catalog POST] SKU "${finalSku}" has warnings:`, skuCheck.warnings)
  }

  const insertRow: Record<string, unknown> = {
    sku: finalSku,
    name,
    product_type,
    tagline: tagline ?? null,
    description: description ?? null,
    features: Array.isArray(features) ? features : [],
    badge: badge ?? null,
    display_order: display_order ?? 1000,
    price_credits: price_credits ?? null,
    price_usd_cents: price_usd_cents ?? null,
    credits_granted: credits_granted ?? null,
    active: active !== false,  // default active = true
    lifecycle_status: active === false ? 'retired' : 'active',
  }

  const { data: created, error: insertErr } = await svc
    .from('products')
    .insert(insertRow)
    .select('id')
    .single()

  if (insertErr || !created) {
    return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 })
  }

  invalidateCatalogCache()

  // Auto-sync to Stripe for plan/pack types (fire-and-report)
  let syncResult = null
  if (product_type === 'subscription_plan' || product_type === 'credit_pack') {
    syncResult = await syncProductToStripe(created.id)
  }

  return NextResponse.json({
    success: true,
    id: created.id,
    sku: finalSku,
    syncResult,
  })
}

// ─── UPDATE ────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const role = await getCallerRole()
  if (!canDo(role, 'manage_catalog')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { id } = body
  if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 })

  // Pull existing row so we can detect price changes
  const svc = createServiceClient()
  const { data: existing, error: loadErr } = await svc
    .from('products')
    .select('id, product_type, price_usd_cents, stripe_price_id, active')
    .eq('id', id)
    .single()
  if (loadErr || !existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Whitelist of fields that can be updated. SKU + product_type are NOT editable after creation.
  const allowedFields: string[] = [
    'name', 'tagline', 'description', 'features', 'badge',
    'display_order', 'price_credits', 'price_usd_cents', 'credits_granted',
    'active', 'lifecycle_status', 'metadata',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  // If `active` toggled, keep lifecycle_status in sync (backward-compat for Sprint 4)
  if ('active' in body && !('lifecycle_status' in body)) {
    updates.lifecycle_status = body.active === false ? 'retired' : 'active'
  }

  const { error: updateErr } = await svc.from('products').update(updates).eq('id', id)
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  invalidateCatalogCache()

  // Auto-sync to Stripe if price_usd_cents changed on a stripe-tracked product type
  let syncResult = null
  const priceChanged = 'price_usd_cents' in body && body.price_usd_cents !== existing.price_usd_cents
  const isStripeType = existing.product_type === 'subscription_plan' || existing.product_type === 'credit_pack'
  if (priceChanged && isStripeType) {
    syncResult = await syncProductToStripe(id)
  }

  return NextResponse.json({ success: true, syncResult })
}

// ─── SOFT DELETE ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const role = await getCallerRole()
  if (!canDo(role, 'manage_catalog')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 })

  const svc = createServiceClient()
  const { error } = await svc
    .from('products')
    .update({
      active: false,
      lifecycle_status: 'retired',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  invalidateCatalogCache()
  return NextResponse.json({ success: true })
}
