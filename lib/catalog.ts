/**
 * Product catalog — DB-driven pricing and product configuration.
 *
 * Reads from `products` table (seeded by migration 061).
 * Used by entitlement.ts to get credit costs without hardcoding.
 * Cached per serverless instance for 30 seconds.
 */

import { createClient } from '@supabase/supabase-js'

export interface CatalogItem {
  id: string
  sku: string
  name: string
  productType: string
  priceCredits: number | null
  priceUsdCents: number | null
  stripePriceId: string | null
  active: boolean
  displayOrder: number | null
  metadata: Record<string, unknown>
}

let cache: { items: CatalogItem[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 30_000

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
    .select('id, sku, name, product_type, price_credits, price_usd_cents, stripe_price_id, active, display_order, metadata')
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
    stripePriceId: row.stripe_price_id,
    active: row.active,
    displayOrder: row.display_order,
    metadata: row.metadata ?? {},
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
  if (!item || item.priceCredits == null) return 1
  return item.priceCredits
}

export async function getCatalogByType(type: string): Promise<CatalogItem[]> {
  const items = await loadCatalog()
  return items.filter((item) => item.productType === type)
}

export async function getAllCatalogItems(): Promise<CatalogItem[]> {
  return loadCatalog()
}

export function invalidateCatalogCache(): void {
  cache = null
}
