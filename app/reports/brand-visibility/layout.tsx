import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Visibility Reports',
  description:
    'SEO audits, keyword research, landing page analysis, competitor benchmarking, and AI visibility reports for your business.',
  openGraph: {
    title: 'Brand Visibility Reports | Good Breeze AI',
    description:
      'SEO audits, keyword research, landing page analysis, competitor benchmarking, and AI visibility reports for your business.',
    url: 'https://goodbreeze.ai/reports/brand-visibility',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
