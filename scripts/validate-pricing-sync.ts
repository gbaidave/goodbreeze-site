/**
 * CLI wrapper: scripts/validate-pricing-sync.ts
 *
 * Pre-deploy check for the catalog → Stripe integrity.
 * Thin wrapper around lib/catalog-validator.ts so we don't duplicate logic.
 *
 * Usage (from goodbreeze-site/ root):
 *   npx tsx scripts/validate-pricing-sync.ts
 *
 * Exit codes:
 *   0  all 7 checks passed (warnings allowed)
 *   1  one or more errors found
 *   2  runtime failure (env vars missing, etc.)
 *
 * Requires these env vars (read from .env.local automatically in Next.js dev;
 * for CI, export them or use a dotenv loader):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY
 */

import { runCatalogValidator } from '@/lib/catalog-validator'

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.STRIPE_SECRET_KEY) {
    console.error('[validate-pricing-sync] Missing required env vars. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY')
    process.exit(2)
  }

  console.log('[validate-pricing-sync] Running 7 catalog checks...')
  const result = await runCatalogValidator()

  console.log('')
  console.log(`=== ${result.summary} ===`)
  console.log(`Checked at: ${result.checkedAt}`)
  console.log('')

  if (result.errors.length > 0) {
    console.log('ERRORS:')
    for (const e of result.errors) {
      console.log(`  [${e.check}] ${e.sku ?? '-'}: ${e.message}`)
    }
    console.log('')
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS:')
    for (const w of result.warnings) {
      console.log(`  [${w.check}] ${w.sku ?? '-'}: ${w.message}`)
    }
    console.log('')
  }

  process.exit(result.ok ? 0 : 1)
}

main().catch((err) => {
  console.error('[validate-pricing-sync] Runtime error:', err)
  process.exit(2)
})
