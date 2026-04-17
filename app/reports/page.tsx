import { getActiveSubscriptionPlans, getCatalogItem } from '@/lib/catalog'
import ReportsDirectoryClient from './ReportsDirectoryClient'

// Server component — fetches BPR credit cost + cheapest active plan from catalog,
// hands dynamic copy to the client component. Tool suites themselves (Competitive
// Analyzer / Brand Visibility / Content Generator) are grouping concepts, not
// catalog commerce items, so they stay as static copy inside the client.
export default async function ReportsPage() {
  const [bprItem, plans] = await Promise.all([
    getCatalogItem('business_presence_report'),
    getActiveSubscriptionPlans(),
  ])

  const bprCreditCost = bprItem?.priceCredits ?? 0

  // Cheapest active plan for the "Need More Firepower" CTA
  const cheapestPlan = plans
    .filter((p) => p.priceUsdCents != null && p.creditsGranted != null)
    .sort((a, b) => (a.priceUsdCents ?? 0) - (b.priceUsdCents ?? 0))[0]

  const minPlanPrice = cheapestPlan?.priceUsdCents
    ? `$${Math.round(cheapestPlan.priceUsdCents / 100)}`
    : ''
  const minPlanCredits = cheapestPlan?.creditsGranted ?? 0

  return (
    <ReportsDirectoryClient
      bprCreditCost={bprCreditCost}
      minPlanPrice={minPlanPrice}
      minPlanCredits={minPlanCredits}
    />
  )
}
