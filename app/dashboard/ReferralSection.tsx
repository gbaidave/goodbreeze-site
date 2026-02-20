'use client'

import { useState } from 'react'

interface Props {
  code: string
  signups: number
  creditsEarned: number
}

export function ReferralSection({ code, signups, creditsEarned }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goodbreeze.ai'
  const referralUrl = `${siteUrl}/ref/${code}`

  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = referralUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-lg">Refer a friend, earn credits</h3>
          <p className="text-gray-400 text-sm mt-1">
            Share your link. You earn 1 free report credit for every person who signs up.
          </p>
        </div>
        {/* Stats */}
        <div className="flex gap-6 flex-shrink-0">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{signups}</p>
            <p className="text-gray-500 text-xs mt-0.5">Sign-ups</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{creditsEarned}</p>
            <p className="text-gray-500 text-xs mt-0.5">Credits earned</p>
          </div>
        </div>
      </div>

      {/* Referral link copy */}
      <div className="mt-5 flex items-center gap-2">
        <div className="flex-1 bg-dark border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-300 font-mono truncate">
          {referralUrl}
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
