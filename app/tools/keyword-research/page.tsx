'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Research underway!</h2>
        <p className="text-gray-400 mb-2">Your keyword research report is being generated. The PDF will arrive by email in <strong className="text-white">2–3 minutes</strong>.</p>
        <p className="text-gray-500 text-sm mb-8">Track progress in your dashboard.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
            Go to Dashboard
          </Link>
          <button onClick={onReset} className="px-6 py-3 border border-primary/40 text-gray-300 rounded-full hover:border-primary hover:text-white transition-all">
            Run Another
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function UpgradeState({ error, upgradePrompt }: { error: string; upgradePrompt: string }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary/30 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Upgrade to Continue</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/pricing" className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg transition-all">
            {upgradePrompt === 'starter' ? 'Upgrade to Starter' : 'Get Report Credits'}
          </Link>
          <Link href="/dashboard" className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:border-gray-500 transition-all">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function KeywordResearchPage() {
  const { user, loading: authLoading } = useAuth()
  const isGuest = !authLoading && !user

  const [keyword, setKeyword] = useState('')
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')

  if (submitted) return <SuccessState onReset={() => setSubmitted(false)} />
  if (upgradePrompt) return <UpgradeState error={error} upgradePrompt={upgradePrompt} />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // focusKeyword = seed keyword; url = website for context
        body: JSON.stringify({ reportType: 'keyword_research', focusKeyword: keyword, url }),
      })
      const data = await res.json()
      if (res.status === 402) { setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'impulse'); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Link href="/tools" className="text-gray-500 hover:text-primary text-sm transition-colors">← All Tools</Link>
          <div className="mt-4 mb-3 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-white">Keyword Research</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/30">Impulse / Starter</span>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto">
            Discover high-value keywords with difficulty scores, search volume, and content opportunity mapping.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-5"
        >
          {error && !upgradePrompt && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className={labelClass}>Seed Keyword *</label>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
              className={inputClass} placeholder="e.g. ai automation for small business" required />
            <p className="text-xs text-gray-600 mt-1.5">Enter your main topic — we&apos;ll find related keywords, questions, and content gaps.</p>
          </div>

          <div>
            <label className={labelClass}>Your Website (optional — for competitor gap analysis)</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              className={inputClass} placeholder="https://yoursite.com" />
          </div>

          {isGuest ? (
            <div className="border border-primary/20 rounded-xl p-5 text-center space-y-3">
              <p className="text-sm text-gray-400">Create a free account to access this tool. Requires Impulse credits or Starter subscription.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/register" className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all">Create free account</Link>
                <Link href="/login" className="px-5 py-2.5 border border-primary/30 text-gray-300 text-sm rounded-full hover:border-primary hover:text-white transition-colors">Sign in</Link>
              </div>
            </div>
          ) : (
            <button type="submit" disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Researching keywords…' : 'Run Keyword Research'}
            </button>
          )}

          <p className="text-center text-xs text-gray-600">
            Report delivered by email in 2–3 minutes. Requires Impulse credits or Starter subscription.
          </p>
        </motion.form>
      </div>
    </div>
  )
}
