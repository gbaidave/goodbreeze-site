/**
 * Stripe metadata rename script — Sprint 5 SKU rename.
 *
 * For each of the 5 paid products (3 plans + 2 packs):
 *   - Find the Stripe Product by current metadata.sku
 *   - Update metadata.sku to the new value
 *   - Update metadata.sku on every Price under that Product (active + archived)
 *
 * Usage (forward — legacy → new):
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/rename-stripe-sku-metadata.ts
 *
 * Usage (reverse — new → legacy, rollback):
 *   STRIPE_SECRET_KEY=sk_test_... DIRECTION=reverse npx tsx scripts/rename-stripe-sku-metadata.ts
 *
 * Run against Stripe test mode first (staging env), then live mode (production).
 * Idempotent: if a Product already has the target SKU, the search misses it
 * and the script skips it with a warning. Safe to re-run.
 *
 * Does NOT touch Price IDs or prices themselves. Only metadata.sku on both
 * Product and every Price under it.
 */

import Stripe from 'stripe'

type Direction = 'forward' | 'reverse'

const FORWARD_MAPPING: Record<string, string> = {
  starter:    'PLN-STARTER',
  growth:     'PLN-GROWTH',
  pro:        'PLN-PRO',
  spark_pack: 'PCK-SPARK',
  boost_pack: 'PCK-BOOST',
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.error('STRIPE_SECRET_KEY env var is required')
    process.exit(2)
  }

  const direction: Direction = (process.env.DIRECTION as Direction) ?? 'forward'
  if (direction !== 'forward' && direction !== 'reverse') {
    console.error('DIRECTION must be "forward" or "reverse"')
    process.exit(2)
  }

  const mapping = direction === 'forward'
    ? FORWARD_MAPPING
    : Object.fromEntries(Object.entries(FORWARD_MAPPING).map(([k, v]) => [v, k]))

  const mode = key.startsWith('sk_test_') ? 'TEST' : key.startsWith('sk_live_') ? 'LIVE' : 'UNKNOWN'

  console.log(`[rename-stripe-sku-metadata] direction=${direction} mode=${mode}`)
  console.log(`[rename-stripe-sku-metadata] ${Object.keys(mapping).length} products to process`)
  console.log('')

  const stripe = new Stripe(key, { apiVersion: '2026-01-28.clover' })

  const results: { from: string; to: string; ok: boolean; reason?: string; productId?: string; prices?: number }[] = []

  for (const [oldSku, newSku] of Object.entries(mapping)) {
    try {
      // Find the Product by current metadata.sku (Stripe Search API)
      const products = await stripe.products.search({
        query: `metadata['sku']:'${oldSku}'`,
      })

      if (products.data.length === 0) {
        results.push({ from: oldSku, to: newSku, ok: false, reason: 'Not found in Stripe — may already have new SKU or never existed' })
        console.log(`  ⚠ ${oldSku} → ${newSku}: not found (skipped; safe to ignore on re-runs or reverse after partial rollback)`)
        continue
      }

      if (products.data.length > 1) {
        results.push({ from: oldSku, to: newSku, ok: false, reason: `Found ${products.data.length} Products with this SKU — ambiguous, manual review required` })
        console.error(`  ✗ ${oldSku} → ${newSku}: AMBIGUOUS (${products.data.length} Products match). Skipping; manual fix required.`)
        continue
      }

      const product = products.data[0]

      // Update Product metadata
      await stripe.products.update(product.id, {
        metadata: { ...product.metadata, sku: newSku },
      })

      // Update every Price under this Product (active + archived)
      let priceCount = 0
      for await (const price of stripe.prices.list({ product: product.id, limit: 100 })) {
        await stripe.prices.update(price.id, {
          metadata: { ...price.metadata, sku: newSku },
        })
        priceCount++
      }

      results.push({ from: oldSku, to: newSku, ok: true, productId: product.id, prices: priceCount })
      console.log(`  ✓ ${oldSku} → ${newSku} (Product ${product.id}, ${priceCount} Price${priceCount === 1 ? '' : 's'})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ from: oldSku, to: newSku, ok: false, reason: msg })
      console.error(`  ✗ ${oldSku} → ${newSku}: ${msg}`)
    }
  }

  console.log('')
  const okCount = results.filter((r) => r.ok).length
  const failCount = results.filter((r) => !r.ok).length
  console.log(`=== Summary: ${okCount}/${results.length} renamed, ${failCount} skipped/failed ===`)

  if (failCount > 0) {
    console.log('')
    console.log('Failures:')
    for (const r of results.filter((f) => !f.ok)) {
      console.log(`  ${r.from} → ${r.to}: ${r.reason}`)
    }
  }

  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[rename-stripe-sku-metadata] Fatal:', err)
  process.exit(2)
})
