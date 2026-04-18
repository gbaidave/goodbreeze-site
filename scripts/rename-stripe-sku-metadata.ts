/**
 * Stripe metadata sync script — Sprint 5 SKU rename.
 *
 * For each paid SKU (5 total), looks up the Stripe Product via its known
 * Stripe Price ID (hardcoded per environment), then sets metadata.sku to
 * the new UPPERCASE-dashes value on both the Product and all its Prices.
 *
 * Why hardcoded Price IDs instead of a Supabase read: this script needs to
 * work regardless of Supabase env-var setup. The Price IDs are pinned in
 * memory/reference_stripe_price_ids.md and are stable per Stripe account.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/rename-stripe-sku-metadata.ts
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/rename-stripe-sku-metadata.ts
 *
 * Mode auto-detected from the key prefix.
 *
 * Idempotent: compares current metadata and skips if already synced.
 */

import Stripe from 'stripe'

// Target SKU → Stripe Price ID per environment.
// Values from memory/reference_stripe_price_ids.md (locked 2026-04-16).
const PRICE_IDS_TEST: Record<string, string> = {
  'PCK-SPARK':    'price_1T3399IlkTC3VEz5mLd7Dg4g',
  'PCK-BOOST':    'price_1T2FjnIlkTC3VEz5leDfyYrW',
  'PLN-STARTER':  'price_1T2FiZIlkTC3VEz5NA3fdSL6',
  'PLN-GROWTH':   'price_1T33AuIlkTC3VEz5pObIZXFD',
  'PLN-PRO':      'price_1T33BlIlkTC3VEz5CmeVkF4t',
}

const PRICE_IDS_LIVE: Record<string, string> = {
  'PCK-SPARK':    'price_1TB0piIMI2iVRBKy6Xqq2Il5',
  'PCK-BOOST':    'price_1TB0rqIMI2iVRBKy9hynd7fn',
  'PLN-STARTER':  'price_1TB0sSIMI2iVRBKykCxndkB7',
  'PLN-GROWTH':   'price_1TB0svIMI2iVRBKyz6jZUvXm',
  'PLN-PRO':      'price_1TB0tEIMI2iVRBKyGfCkSN8L',
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) { console.error('STRIPE_SECRET_KEY env var required'); process.exit(2) }

  const mode = key.startsWith('sk_test_') ? 'TEST' : key.startsWith('sk_live_') ? 'LIVE' : null
  if (!mode) { console.error('STRIPE_SECRET_KEY must start with sk_test_ or sk_live_'); process.exit(2) }

  const mapping = mode === 'TEST' ? PRICE_IDS_TEST : PRICE_IDS_LIVE
  const stripe = new Stripe(key, { apiVersion: '2026-01-28.clover' })

  console.log(`[rename-stripe-sku-metadata] mode=${mode}, ${Object.keys(mapping).length} products`)
  console.log('')

  let ok = 0, fail = 0
  for (const [newSku, priceId] of Object.entries(mapping)) {
    try {
      const price = await stripe.prices.retrieve(priceId)
      const productId = typeof price.product === 'string' ? price.product : price.product.id
      const product = await stripe.products.retrieve(productId)

      const productNeedsUpdate = (product.metadata ?? {}).sku !== newSku
      if (productNeedsUpdate) {
        await stripe.products.update(productId, { metadata: { ...product.metadata, sku: newSku } })
      }

      let priceUpdates = 0
      for await (const p of stripe.prices.list({ product: productId, limit: 100 })) {
        if ((p.metadata ?? {}).sku !== newSku) {
          await stripe.prices.update(p.id, { metadata: { ...p.metadata, sku: newSku } })
          priceUpdates++
        }
      }

      if (!productNeedsUpdate && priceUpdates === 0) {
        console.log(`  = ${newSku} (Product ${productId}) — already synced`)
      } else {
        console.log(`  ✓ ${newSku} (Product ${productId}) — ${productNeedsUpdate ? 'Product metadata updated, ' : ''}${priceUpdates} Price${priceUpdates === 1 ? '' : 's'} updated`)
      }
      ok++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ✗ ${newSku} (${priceId}): ${msg}`)
      fail++
    }
  }

  console.log('')
  console.log(`=== Summary: ${ok}/${Object.keys(mapping).length} synced, ${fail} failed ===`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[rename-stripe-sku-metadata] Fatal:', err)
  process.exit(2)
})
