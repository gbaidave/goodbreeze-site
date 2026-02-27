'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { captureEvent } from '@/lib/analytics'
import { ExhaustedState } from '@/components/ExhaustedState'
import { ReportSubmittedModal } from '@/components/tools/ReportSubmittedModal'

export default function SeoAuditPage() {
  const { user, loading: authLoading } = useAuth()
  const isGuest = !authLoading && !user

  const [url, setUrl] = useState('')
  const [company, setCompany] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')

  if (upgradePrompt) return <ExhaustedState error={error} upgradePrompt={upgradePrompt} />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'seo_audit', url, company, focusKeyword }),
      })
      const data = await res.json()
      if (res.status === 402) { setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'impulse'); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      captureEvent('tool_form_submit', { reportType: 'seo_audit' })
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
    <>
      {submitted && (
        <ReportSubmittedModal
          heading="Audit running!"
          body={<>Your SEO audit is underway. The PDF will arrive in your inbox within <strong className="text-white">3–5 minutes</strong>.</>}
          detail="Track progress in your dashboard."
          onRunAnother={() => setSubmitted(false)}
        />
      )}
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Link href="/tools" className="text-gray-500 hover:text-primary text-sm transition-colors">← All Reports</Link>
          <div className="mt-4 mb-3 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-white">SEO Audit</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/30">Impulse / Starter</span>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto">
            Full technical SEO audit with actionable recommendations, keyword opportunities, and performance insights.
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
            <label className={labelClass}>Website URL to Audit *</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
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
            <p className="text-xs text-gray-600 mt-1.5">Helps us tailor keyword gap analysis and on-page recommendations.</p>
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
              {submitting ? 'Starting audit…' : 'Run SEO Audit'}
            </button>
          )}

          <p className="text-center text-xs text-gray-600">
            Audit delivered by email in 3–5 minutes. Requires Impulse credits or Starter subscription.
          </p>
        </motion.form>
      </div>
    </div>
    </>
  )
}
