/**
 * SKU auto-generator for the catalog admin.
 *
 * Scheme (locked 2026-04-16, see PLAN-sprint4-catalog-design.md §2):
 *   {TYPE-PREFIX}-{SLUG}[-{SEQ}]
 *
 * Examples:
 *   PLN-TURBO          (subscription plan "Turbo Plan")
 *   PCK-BOOST-15       (credit pack "Boost Pack 15")
 *   RPT-AUDIT-V2       (report "SEO Audit V2")
 *   BND-AGENCY         (bundle "Agency Starter Kit")
 *
 * Format rules:
 *   - UPPERCASE + dashes only (matches industry norm: Shopify, Amazon docs)
 *   - Total length capped at 24 chars (well under Amazon's 40-char limit)
 *   - Legacy SKUs (lowercase_underscore) keep their format, never renamed
 *   - Immutable after first save
 *
 * Legacy SKUs that are untouchable:
 *   starter, growth, pro, spark_pack, boost_pack, mega_pack,
 *   business_presence_report, h2h, t3c, cp
 */

const PREFIX_MAP: Record<string, string> = {
  subscription_plan: 'PLN',
  credit_pack: 'PCK',
  report: 'RPT',
  bundle: 'BND',        // future
  addon: 'ADD',         // future
  service: 'SRV',       // future
}

export function getSkuPrefix(productType: string): string {
  return PREFIX_MAP[productType] ?? 'GBA'
}

/**
 * Convert a display name into a SKU slug.
 * Uppercase, alphanumeric + dashes only, no leading zeros, max 12 chars.
 */
export function slugify(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')   // non-alphanumeric → dash
    .replace(/-+/g, '-')            // collapse multiple dashes
    .replace(/^-|-$/g, '')          // trim leading/trailing
    .replace(/^0+/, '')             // strip leading zeros
    .substring(0, 12)               // cap at 12 chars
    .replace(/-$/, '')              // re-trim after substring
}

/**
 * Generate a base SKU (no collision handling yet).
 * Returns empty string if name can't produce a valid slug.
 */
export function generateBaseSku(productType: string, displayName: string): string {
  const prefix = getSkuPrefix(productType)
  const slug = slugify(displayName)
  if (!slug) return ''
  return `${prefix}-${slug}`
}

/**
 * Find an available SKU by appending -2, -3, ... if the base collides.
 * Caller supplies a checkExists function that returns true if the SKU
 * is already in the DB (including retired products — never reuse SKUs).
 *
 * Throws if more than 99 collisions (should never happen in practice).
 */
export async function findAvailableSku(
  baseSku: string,
  checkExists: (sku: string) => Promise<boolean>,
): Promise<string> {
  if (!baseSku) throw new Error('Cannot find SKU for empty base')
  if (!(await checkExists(baseSku))) return baseSku

  for (let n = 2; n <= 99; n++) {
    const candidate = `${baseSku}-${n}`
    if (!(await checkExists(candidate))) return candidate
  }
  throw new Error(`Too many collisions for base SKU "${baseSku}" — rename the product.`)
}

/**
 * Soft-validate a SKU string. Returns warnings, not blockers.
 * Legacy SKUs (lowercase_underscore) will fail multiple checks — that's expected.
 */
export function validateSkuFormat(sku: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  if (!sku) {
    warnings.push('SKU is empty')
    return { valid: false, warnings }
  }
  if (!/^[A-Z0-9-]+$/.test(sku)) warnings.push('Contains lowercase or special characters (new SKUs should be UPPERCASE with dashes)')
  if (sku.length > 24) warnings.push(`Length ${sku.length} exceeds 24-char limit`)
  if (sku.length < 3) warnings.push('Very short — at least 3 characters recommended')
  if (!/^[A-Z]+-/.test(sku)) warnings.push('Missing type prefix (e.g., PLN-, PCK-, RPT-)')
  if (/^0/.test(sku.split('-')[1] ?? '')) warnings.push('SKU slug starts with a zero')
  return { valid: warnings.length === 0, warnings }
}
