import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Written guides, templates, tools, and case studies to help small businesses understand and implement AI automation.',
  openGraph: {
    title: 'Resources | Good Breeze AI',
    description:
      'Written guides, templates, tools, and case studies to help small businesses understand and implement AI automation.',
    url: 'https://goodbreeze.ai/resources',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
