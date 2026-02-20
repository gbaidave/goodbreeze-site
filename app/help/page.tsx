import type { Metadata } from 'next'
import HelpCenter from './HelpCenter'

export const metadata: Metadata = {
  title: 'Help Center — Good Breeze AI',
  description: 'Find answers to common questions about Good Breeze AI reports, plans, referrals, and your account.',
}

export default function HelpPage() {
  return <HelpCenter />
}
