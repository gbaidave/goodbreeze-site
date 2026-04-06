import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Competitive Analyzer',
  description:
    'Head-to-head competitor analysis, top 3 competitor reports, and competitive position assessments for your business.',
  openGraph: {
    title: 'Competitive Analyzer | Good Breeze AI',
    description:
      'Head-to-head competitor analysis, top 3 competitor reports, and competitive position assessments for your business.',
    url: 'https://goodbreeze.ai/reports/competitive-analyzer',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
