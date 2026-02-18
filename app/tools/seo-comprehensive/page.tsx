'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

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
        <h2 className="text-2xl font-bold text-white mb-3">Comprehensive report started!</h2>
        <p className="text-gray-400 mb-2">This is our most thorough analysis. Allow <strong className="text-white">5–8 minutes</strong> — the PDF will arrive by email when complete.</p>
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

function UpgradeState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary/30 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Starter Plan Required</h2>
        <p className="text-gray-400 mb-2">{error}</p>
        <p className="text-gray-500 text-sm mb-8">
          The SEO Comprehensive Report is our most powerful analysis — it combines technical audit, keyword research, and competitor analysis into one report. Available exclusively on Starter.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/pricing" className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg transition-all">
            Upgrade to Starter — $20/mo
          </Link>
          <Link href="/dashboard" className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:border-gray-500 transition-all">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function SeoComprehensivePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [url, setUrl] = useState('')
  const [company, setCompany] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirectTo=/tools/seo-comprehensive')
  }, [user, authLoading, router])

  if (authLoading || !user) return <LoadingSpinner />
  if (submitted) return <SuccessState onReset={() => setSubmitted(false)} />
  if (upgradePrompt) return <UpgradeState error={error} />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'seo_comprehensive', url, company, focusKeyword }),
      })
      const data = await res.json()
      if (res.status === 402) { setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'starter'); return }
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
            <h1 className="text-4xl font-bold text-white">SEO Comprehensive</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">Starter Only</span>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto">
            Our most powerful report: technical SEO audit + keyword research + competitor analysis, combined into one definitive PDF.
          </p>
        </motion.div>

        {/* What's included */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-dark-700/50 border border-primary/10 rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What&apos;s included</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {['Full technical SEO audit', 'Keyword gap & opportunities', 'Competitor comparison'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </div>
            ))}
          </div>
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
            <label className={labelClass}>Website URL *</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              className={inputClass} placeholder="https://yoursite.com" required />
          </div>

          <div>
            <label className={labelClass}>Company / Brand Name (optional)</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)}
              className={inputClass} placeholder="Your Company Name" />
          </div>

          <div>
            <label className={labelClass}>Primary Focus Keyword (optional)</label>
            <input type="text" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
              className={inputClass} placeholder="e.g. ai automation for small business" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Starting comprehensive analysis…' : 'Generate Comprehensive Report'}
          </button>

          <p className="text-center text-xs text-gray-600">
            Our most thorough report — allow 5–8 minutes. Starter subscription required.
          </p>
        </motion.form>
      </div>
    </div>
  )
}
