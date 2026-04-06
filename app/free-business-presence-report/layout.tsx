import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Business Presence Report',
  description:
    'See how your business shows up online. Get a free report covering your visibility, competitors, reputation, and website performance. No credit card required.',
  openGraph: {
    title: 'Free Business Presence Report | Good Breeze AI',
    description:
      'See how your business shows up online. Get a free report covering your visibility, competitors, reputation, and website performance.',
    url: 'https://goodbreeze.ai/free-business-presence-report',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
