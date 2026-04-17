import { Metadata } from 'next'
import { getCatalogByType, type CatalogItem } from '@/lib/catalog'
import PricingClient, { type PlanDisplay } from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing | Good Breeze AI',
  description: 'Simple, transparent pricing. Start free. Upgrade when you need more. Cancel anytime.',
}

// Server component — fetches catalog, derives display shape, hands off to client.
// Per catalog-integration decision #5: /pricing is a server component reading
// catalog at request time. No client-side fetch, no loading state for prices.
export default async function PricingPage() {
  // Fetch both types (active + inactive) — inactive items render dimmed with "Unavailable" badge
  const [subPlans, packItems] = await Promise.all([
    getCatalogByType('subscription_plan'),
    getCatalogByType('credit_pack'),
  ])

  const plans: PlanDisplay[] = subPlans.map(toPlanDisplay)
  const packs: PlanDisplay[] = packItems.map(toPackDisplay)

  return <PricingClient plans={plans} packs={packs} />
}

// ── Display-shape mappers ──────────────────────────────────────────────────

function usdDisplay(cents: number | null): string {
  if (cents == null) return ''
  // Whole dollars if ends at .00, else show cents
  return cents % 100 === 0 ? `$${Math.round(cents / 100)}` : `$${(cents / 100).toFixed(2)}`
}

function toPlanDisplay(item: CatalogItem): PlanDisplay {
  const credits = item.creditsGranted ?? 0
  const badge = (item.metadata?.badge as string | undefined) ?? null
  const features = item.features.length > 0
    ? (item.features as string[])
    : defaultPlanFeatures(credits)

  return {
    sku: item.sku,
    name: item.name.replace(/\s+Plan$/i, ''), // "Starter Plan" → "Starter" for the card header
    price: usdDisplay(item.priceUsdCents),
    period: '/month',
    reports: `${credits} credits/month`,
    features,
    priceUsdCents: item.priceUsdCents ?? 0,
    active: item.active,
    badge,
    highlighted: !!badge,
  }
}

function toPackDisplay(item: CatalogItem): PlanDisplay {
  const credits = item.creditsGranted ?? 0
  const features = item.features.length > 0
    ? (item.features as string[])
    : defaultPackFeatures(credits)

  return {
    sku: item.sku,
    name: item.name,
    price: usdDisplay(item.priceUsdCents),
    period: '',
    reports: `${credits} credit${credits === 1 ? '' : 's'}`,
    subtitle: item.tagline ?? 'One-time purchase',
    description: item.description ?? `${credits} credit${credits === 1 ? '' : 's'}, use anytime`,
    features,
    priceUsdCents: item.priceUsdCents ?? 0,
    active: item.active,
    badge: null,
    highlighted: false,
  }
}

// Default feature lists used when catalog.features is empty.
// These are the SAME strings the pricing page has shipped with — swap each
// product's `features` JSONB array in /admin/catalog to customize.
function defaultPlanFeatures(credits: number): string[] {
  return [
    `${credits} credits per month — all report types`,
    'Head-to-Head, Top 3 & Competitive Position',
    'AI SEO, Keyword Research, Landing Page Optimizer',
    'SEO Audit & SEO Comprehensive Report',
    'Multi-Page Audit',
    'Reports delivered by email + stored in dashboard',
    'Cancel anytime. Access until billing period ends.',
  ]
}

function defaultPackFeatures(credits: number): string[] {
  return [
    `${credits} credits (no expiry)`,
    'All standard report types',
    'PDF by email + dashboard access',
  ]
}
