import type { Metadata } from 'next'
import Link from 'next/link'
import FaqPageClient from './FaqPageClient'

export const metadata: Metadata = {
  title: 'FAQ — Good Breeze AI',
  description:
    "Everything you want to know before running your first AI report. No jargon, straight answers about how Good Breeze AI works, what's in the reports, pricing, and more.",
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2">
          <Link href="/" className="text-gray-500 hover:text-primary text-sm transition-colors">← Home</Link>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 mt-6">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Straight answers before you run your first report.
        </p>
        <FaqPageClient />
      </div>
    </div>
  )
}
