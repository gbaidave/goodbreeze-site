/**
 * Product catalog — DB-driven pricing and product configuration.
 *
 * Reads from `products` table (seeded by migration 061, extended by 062 + 064).
 * Source of truth for all pricing, credits, plan caps, Stripe price IDs.
 * Cached per serverless instance for 5 seconds.
 *
 * After 2026-04-16 catalog migration, NEVER hardcode pricing/credit/plan data in code.
 * See reference memory: reference_catalog_integration_decisions.md
 */

import { createClient } from '@supabase/supabase-js'

export interface CatalogItem {
  id: string
  sku: string
  name: string
  productType: string
  priceCredits: number | null
  priceUsdCents: number | null
  creditsGranted: number | null
  stripePriceId: string | null
  active: boolean
  displayOrder: number | null
  metadata: Record<string, unknown>
  description: string | null
  tagline: string | null
  features: unknown[]
  lifecycleStatus: string | null
  // Added in migration 068:
  badge: string | null
  syncErrorDetail: string | null
  lastSyncAttemptAt: string | null
  lastSyncSuccessAt: string | null
}

let cache: { items: CatalogItem[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 5_000

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role configuration')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function loadCatalog(): Promise<CatalogItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, sku, name, product_type, price_credits, price_usd_cents, credits_granted, stripe_price_id, active, display_order, metadata, description, tagline, features, lifecycle_status, badge, sync_error_detail, last_sync_attempt_at, last_sync_success_at')
    .not('sku', 'is', null)
    .order('display_order', { ascending: true })

  if (error || !data) {
    console.error('Failed to load product catalog:', error)
    return cache?.items ?? []
  }

  const items: CatalogItem[] = data.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    productType: row.product_type,
    priceCredits: row.price_credits,
    priceUsdCents: row.price_usd_cents,
    creditsGranted: row.credits_granted,
    stripePriceId: row.stripe_price_id,
    active: row.active,
    displayOrder: row.display_order,
    metadata: row.metadata ?? {},
    description: row.description,
    tagline: row.tagline,
    features: Array.isArray(row.features) ? row.features : [],
    lifecycleStatus: row.lifecycle_status,
    badge: row.badge ?? (row.metadata?.badge as string | undefined) ?? null,
    syncErrorDetail: row.sync_error_detail,
    lastSyncAttemptAt: row.last_sync_attempt_at,
    lastSyncSuccessAt: row.last_sync_success_at,
  }))

  cache = { items, fetchedAt: Date.now() }
  return items
}

export async function getCatalogItem(sku: string): Promise<CatalogItem | null> {
  const items = await loadCatalog()
  return items.find((item) => item.sku === sku) ?? null
}

export async function getReportCreditCost(reportType: string): Promise<number> {
  const item = await getCatalogItem(reportType)
  if (!item) {
    throw new Error(`Report type "${reportType}" not found in product catalog. Seed a row in the products table or add it via /admin/catalog.`)
  }
  if (item.priceCredits == null) {
    throw new Error(`Product "${reportType}" is in catalog but has no price_credits set. Fix it in /admin/catalog.`)
  }
  if (!item.active) {
    throw new Error(`Product "${reportType}" is marked inactive in catalog. Activate it in /admin/catalog.`)
  }
  return item.priceCredits
}

export async function getCatalogByType(type: string): Promise<CatalogItem[]> {
  const items = await loadCatalog()
  return items.filter((item) => item.productType === type)
}

export async function getAllCatalogItems(): Promise<CatalogItem[]> {
  return loadCatalog()
}

/**
 * Look up a catalog item by its Stripe Price ID.
 * Used by the webhook handler to resolve incoming Stripe events → catalog rows.
 * Returns null if no match — caller MUST handle as error, never fall back to hardcoded values.
 */
export async function getCatalogItemByStripePriceId(stripePriceId: string): Promise<CatalogItem | null> {
  if (!stripePriceId) return null
  const items = await loadCatalog()
  return items.find((item) => item.stripePriceId === stripePriceId && item.active) ?? null
}

/**
 * Return all active subscription plans (starter / growth / pro / ...) from catalog.
 * Used by checkout consent audit trail, entitlement monthly caps, pricing page.
 */
export async function getActiveSubscriptionPlans(): Promise<CatalogItem[]> {
  const items = await loadCatalog()
  return items.filter((item) => item.productType === 'subscription_plan' && item.active)
}

/**
 * Return all active credit packs (spark_pack / boost_pack / ...) from catalog.
 * Used by webhook credit grants, pricing page, reports-exhausted email.
 */
export async function getActivePackProducts(): Promise<CatalogItem[]> {
  const items = await loadCatalog()
  return items.filter((item) => item.productType === 'credit_pack' && item.active)
}

/**
 * Look up the plan monthly credit cap for a given plan SKU.
 * Replaces the deleted PLAN_MONTHLY_CAPS / PLAN_CAPS / PLAN_CREDITS_PER_PERIOD constants.
 * For subscription plans, monthly credits are stored in credits_granted (not price_credits).
 * Throws if the plan is missing or not a subscription plan.
 */
export async function getPlanCreditsPerPeriod(planSku: string): Promise<number> {
  const item = await getCatalogItem(planSku)
  if (!item || item.productType !== 'subscription_plan') {
    throw new Error(`Plan "${planSku}" not found in catalog or not a subscription_plan. Check products table.`)
  }
  if (item.creditsGranted == null) {
    throw new Error(`Plan "${planSku}" has no credits_granted set in catalog. Fix via /admin/catalog.`)
  }
  return item.creditsGranted
}

export function invalidateCatalogCache(): void {
  cache = null
}
