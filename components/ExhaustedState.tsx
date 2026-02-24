'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface Props {
  error: string
  upgradePrompt: string
}

/**
 * Shown on tool pages when a user hits the 402 paywall.
 * Replaces the inline UpgradeState on each tool form — shared across all 6 tools.
 * Shows upgrade options + free credit earning paths (referral + testimonials).
 */
export function ExhaustedState({ error, upgradePrompt }: Props) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary/30 text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-3">Upgrade to Continue</h2>
        <p className="text-gray-400 mb-8">{error}</p>

        {/* Primary upgrade CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {upgradePrompt === 'starter' ? 'Upgrade to Starter' : 'Get Report Credits'}
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:border-gray-500 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Free credit paths */}
        <div className="border-t border-gray-800 pt-6">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-4">Or earn credits</p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-gray-800 hover:border-primary/30 transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                  Refer a friend — earn 1 credit per signup
                </p>
                <p className="text-xs text-gray-500">Your referral link is in the dashboard</p>
              </div>
            </Link>
            <Link
              href="/testimonials/submit"
              className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-gray-800 hover:border-primary/30 transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                  Share your experience — earn up to 6 credits
                </p>
                <p className="text-xs text-gray-500">Written (1 credit) or video (5 credits)</p>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
