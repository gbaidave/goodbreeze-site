/**
 * Stripe Option B (automated sync) helper.
 *
 * When an admin changes a product's USD price in the catalog, this module:
 *   1. Creates a new Stripe Price with the new amount on the existing Stripe Product
 *      (or creates a new Stripe Product + Price if this is a new catalog row)
 *   2. Deactivates the old Stripe Price (Stripe never deletes; existing
 *      subscribers continue on the old price until their next renewal — native behavior)
 *   3. Updates the catalog row's stripe_price_id to point at the new Price
 *   4. Updates sync timestamps + clears sync_error_detail on success
 *   5. On failure: writes a human-readable error into sync_error_detail
 *      so the admin UI can show "retry" and leaves the catalog row as-is
 *      (never roll back the user's intent — surface the error instead)
 *
 * Only applies to product_type IN ('subscription_plan', 'credit_pack').
 * Report product types don't touch Stripe (paid via credits).
 */

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service-client'
import { invalidateCatalogCache } from '@/lib/catalog'

export type SyncOutcome =
  | { ok: true; newStripePriceId: string; oldStripePriceId: string | null }
  | { ok: false; error: string }

interface ProductRow {
  id: string
  sku: string
  name: string
  product_type: string
  price_usd_cents: number | null
  stripe_price_id: string | null
  description: string | null
  active: boolean
}

function isStripeTrackedType(productType: string): boolean {
  return productType === 'subscription_plan' || productType === 'credit_pack'
}

function humanizeError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('No such price')) {
      return 'Linked Stripe Price no longer exists. Create a new one by saving the catalog row again.'
    }
    if (err.message.includes('No such product')) {
      return 'Linked Stripe Product no longer exists. Contact engineering.'
    }
    if (err.message.includes('Invalid API Key')) {
      return 'Stripe API key invalid or missing. Check Vercel env vars.'
    }
    return `Stripe error: ${err.message}`
  }
  return 'Unknown Stripe error. Check server logs.'
}

/**
 * Sync a single catalog row to Stripe. Called from:
 *   - /api/admin/catalog PATCH (when price_usd_cents changed)
 *   - /api/admin/catalog POST (when creating a new product)
 *   - /api/admin/catalog/sync-stripe (manual re-sync button)
 */
export async function syncProductToStripe(productId: string): Promise<SyncOutcome> {
  const svc = createServiceClient()

  const { data: product, error: loadErr } = await svc
    .from('products')
    .select('id, sku, name, product_type, price_usd_cents, stripe_price_id, description, active')
    .eq('id', productId)
    .single()

  if (loadErr || !product) {
    return { ok: false, error: 'Product not found in catalog.' }
  }

  const row = product as ProductRow

  if (!isStripeTrackedType(row.product_type)) {
    return { ok: false, error: `Product type "${row.product_type}" is not sold via Stripe (reports are paid via credits).` }
  }

  if (row.price_usd_cents == null || row.price_usd_cents <= 0) {
    return { ok: false, error: 'Price must be set (greater than $0) before syncing to Stripe.' }
  }

  // Record that we attempted a sync (even if it fails)
  await svc
    .from('products')
    .update({ last_sync_attempt_at: new Date().toISOString() })
    .eq('id', productId)

  try {
    // Resolve Stripe Product: reuse existing if there's already a Price linked, else create new
    let stripeProductId: string
    const oldStripePriceId = row.stripe_price_id

    if (oldStripePriceId) {
      const oldPrice = await stripe.prices.retrieve(oldStripePriceId)
      stripeProductId = typeof oldPrice.product === 'string' ? oldPrice.product : oldPrice.product.id
    } else {
      const newStripeProduct = await stripe.products.create({
        name: row.name,
        description: row.description ?? undefined,
        metadata: { sku: row.sku, product_type: row.product_type },
      })
      stripeProductId = newStripeProduct.id
    }

    // Create the new Stripe Price
    const recurringConfig = row.product_type === 'subscription_plan'
      ? ({ interval: 'month' as const } satisfies { interval: 'month' })
      : undefined

    const newPrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: row.price_usd_cents,
      currency: 'usd',
      recurring: recurringConfig,
      metadata: { sku: row.sku },
    })

    // Deactivate the old Price (if any). Stripe never hard-deletes prices —
    // existing subscriptions stay on the old price until renewal.
    if (oldStripePriceId && oldStripePriceId !== newPrice.id) {
      try {
        await stripe.prices.update(oldStripePriceId, { active: false })
      } catch {
        // Non-fatal: if we can't deactivate the old one, the new one is still the source of truth.
        // The validator script will flag this on its next run.
      }
    }

    // Update the catalog row
    await svc
      .from('products')
      .update({
        stripe_price_id: newPrice.id,
        last_sync_success_at: new Date().toISOString(),
        sync_error_detail: null,
      })
      .eq('id', productId)

    invalidateCatalogCache()

    return { ok: true, newStripePriceId: newPrice.id, oldStripePriceId }
  } catch (err) {
    const humanMsg = humanizeError(err)
    console.error(`[catalog-stripe-sync] Failed for product ${row.sku}:`, err)

    // Save the error so the admin UI can show it + offer retry
    await svc
      .from('products')
      .update({ sync_error_detail: humanMsg })
      .eq('id', productId)

    invalidateCatalogCache()

    return { ok: false, error: humanMsg }
  }
}
