/**
 * Catalog validator — confirms every catalog row is consistent with Stripe
 * and has the fields required for its product type.
 *
 * Surfaced two ways:
 *   1. /api/admin/catalog/validate (POST) — admin clicks "Run validator"
 *   2. scripts/validate-pricing-sync.ts — pre-deploy CI check
 *
 * Six checks (agreed 2026-04-16, updated Sprint 5 2026-04-16):
 *   1. Every stripe_price_id actually exists in Stripe
 *   2. Catalog price_usd_cents matches the Stripe price
 *   3. Every active subscription_plan has a stripe_price_id
 *   4. Every active credit_pack has both price_usd_cents AND credits_granted
 *   5. No duplicate SKUs
 *   6. SKU format valid (soft warnings only; runs on every row post-Sprint-5)
 *
 * Sprint 5 removed the "legacy SKUs still present" check (formerly check 7) —
 * all SKUs now follow the new scheme, nothing legacy to enforce.
 */

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service-client'
import { validateSkuFormat } from '@/lib/sku-generator'

export interface ValidationIssue {
  severity: 'error' | 'warning'
  sku: string | null
  productId: string | null
  check: string
  message: string
}

export interface ValidationResult {
  ok: boolean
  summary: string
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  checkedAt: string
}

// All SKUs use the UPPERCASE-{TYPE}-{SLUG} scheme as of Sprint 5 (2026-04-16).
// The old LEGACY_SKUS list + legacy_missing check (check 7) were removed —
// no more legacy entries. SKU format validation (check 6) now runs on every row.

export async function runCatalogValidator(): Promise<ValidationResult> {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  const svc = createServiceClient()
  const { data: rows, error: loadErr } = await svc
    .from('products')
    .select('id, sku, name, product_type, price_usd_cents, credits_granted, stripe_price_id, active')
    .not('sku', 'is', null)

  if (loadErr || !rows) {
    errors.push({ severity: 'error', sku: null, productId: null, check: 'load', message: `Failed to load catalog: ${loadErr?.message}` })
    return packResult(errors, warnings)
  }

  // Map SKU → id for cross-row lookups (duplicate_sku, legacy_missing)
  const idBySku = new Map<string, string>()
  for (const row of rows) {
    if (!idBySku.has(row.sku)) idBySku.set(row.sku, row.id)
  }

  // Check 5: duplicate SKUs
  const seen = new Map<string, number>()
  for (const row of rows) {
    seen.set(row.sku, (seen.get(row.sku) ?? 0) + 1)
  }
  for (const [sku, count] of seen) {
    if (count > 1) {
      errors.push({ severity: 'error', sku, productId: idBySku.get(sku) ?? null, check: 'duplicate_sku', message: `SKU "${sku}" appears ${count} times` })
    }
  }

  // Per-row checks
  for (const row of rows) {
    // Check 6: SKU format — now runs on every row since Sprint 5 rename
    const formatCheck = validateSkuFormat(row.sku)
    for (const w of formatCheck.warnings) {
      warnings.push({ severity: 'warning', sku: row.sku, productId: row.id, check: 'sku_format', message: w })
    }

    // Checks 3+4: required fields per product type
    if (row.active) {
      if (row.product_type === 'subscription_plan') {
        if (!row.stripe_price_id) {
          errors.push({ severity: 'error', sku: row.sku, productId: row.id, check: 'missing_stripe_price_id', message: `Active subscription "${row.sku}" has no stripe_price_id` })
        }
        if (row.credits_granted == null) {
          errors.push({ severity: 'error', sku: row.sku, productId: row.id, check: 'missing_credits_granted', message: `Active subscription "${row.sku}" has no credits_granted` })
        }
      }
      if (row.product_type === 'credit_pack') {
        if (row.price_usd_cents == null) {
          errors.push({ severity: 'error', sku: row.sku, productId: row.id, check: 'missing_price', message: `Active credit pack "${row.sku}" has no price_usd_cents` })
        }
        if (row.credits_granted == null) {
          errors.push({ severity: 'error', sku: row.sku, productId: row.id, check: 'missing_credits_granted', message: `Active credit pack "${row.sku}" has no credits_granted` })
        }
      }
    }

    // Checks 1+2: Stripe-tracked rows — verify price exists + matches
    if (row.stripe_price_id && (row.product_type === 'subscription_plan' || row.product_type === 'credit_pack')) {
      try {
        const stripePrice = await stripe.prices.retrieve(row.stripe_price_id)
        const stripeCents = stripePrice.unit_amount
        if (row.price_usd_cents != null && stripeCents != null && row.price_usd_cents !== stripeCents) {
          errors.push({
            severity: 'error',
            sku: row.sku,
            productId: row.id,
            check: 'price_mismatch',
            message: `Catalog $${(row.price_usd_cents / 100).toFixed(2)} ≠ Stripe $${(stripeCents / 100).toFixed(2)} (${row.stripe_price_id})`,
          })
        }
        if (!stripePrice.active) {
          warnings.push({
            severity: 'warning',
            sku: row.sku,
            productId: row.id,
            check: 'stripe_price_inactive',
            message: `Stripe Price ${row.stripe_price_id} is inactive — customers can't check out`,
          })
        }
      } catch (err) {
        errors.push({
          severity: 'error',
          sku: row.sku,
          productId: row.id,
          check: 'stripe_price_missing',
          message: `Stripe Price ${row.stripe_price_id} not found: ${err instanceof Error ? err.message : 'unknown error'}`,
        })
      }
    }
  }

  return packResult(errors, warnings)
}

function packResult(errors: ValidationIssue[], warnings: ValidationIssue[]): ValidationResult {
  const ok = errors.length === 0
  const summary = ok && warnings.length === 0
    ? `All checks passed (${errors.length} errors, ${warnings.length} warnings)`
    : `${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
  return { ok, summary, errors, warnings, checkedAt: new Date().toISOString() }
}
