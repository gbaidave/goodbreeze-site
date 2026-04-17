import type { Metadata } from 'next'
import HelpCenter from './HelpCenter'
import { getAllCatalogItems } from '@/lib/catalog'
import { buildHelpArticles, toHelpArticlesCatalog } from '@/lib/help-articles'

export const metadata: Metadata = {
  title: 'Help Center | Good Breeze AI',
  description: 'Find answers to common questions about Good Breeze AI reports, plans, referrals, and your account.',
}

// Server component: fetches catalog, interpolates into help articles, hands off to client.
// Help articles used to have hardcoded pack/plan prices + credit counts. Now catalog-driven.
export default async function HelpPage() {
  const catalog = await getAllCatalogItems()
  const articles = buildHelpArticles(toHelpArticlesCatalog(catalog))
  return <HelpCenter articles={articles} />
}
