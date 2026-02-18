'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

type ReportType = 'h2h' | 't3c' | 'cp'

const REPORT_LABELS: Record<ReportType, string> = {
  h2h: 'Head to Head',
  t3c: 'Top 3 Competitors',
  cp: 'Competitive Position',
}

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary text-center"
      >
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Report on its way!</h2>
        <p className="text-gray-400 mb-2">
          Your competitive analysis is being generated. You&apos;ll receive the PDF in your inbox within <strong className="text-white">2–4 minutes</strong>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Check your dashboard to track progress or view past reports.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={onReset}
            className="px-6 py-3 border border-primary/40 text-gray-300 rounded-full hover:border-primary hover:text-white transition-all"
          >
            Run Another Report
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function UpgradeState({ error, upgradePrompt }: { error: string; upgradePrompt: string }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary/30 text-center"
      >
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-7V8m0 0V6m0 2h2m-2 0H10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Upgrade to Continue</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {upgradePrompt === 'starter' ? 'Upgrade to Starter' : 'Get Report Credits'}
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:border-gray-500 hover:text-gray-300 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function SalesAnalyzer() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [reportType, setReportType] = useState<ReportType>('h2h')
  const [targetWebsite, setTargetWebsite] = useState('')
  const [competitor1, setCompetitor1] = useState('')
  const [competitor1Website, setCompetitor1Website] = useState('')
  const [competitor2, setCompetitor2] = useState('')
  const [competitor2Website, setCompetitor2Website] = useState('')
  const [competitor3, setCompetitor3] = useState('')
  const [competitor3Website, setCompetitor3Website] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/tools/sales-analyzer')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) return <LoadingSpinner />
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
        body: JSON.stringify({
          reportType,
          targetWebsite,
          competitor1,
          competitor1Website,
          competitor2,
          competitor2Website,
          competitor3,
          competitor3Website,
        }),
      })

      const data = await res.json()

      if (res.status === 402) {
        setError(data.error)
        setUpgradePrompt(data.upgradePrompt ?? 'impulse')
        return
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

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
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/tools" className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← All Tools
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Competitive Analyzer</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            AI-powered competitive intelligence reports. Pick your analysis type and we'll email you a full PDF.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-6"
        >
          {error && !upgradePrompt && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Report Type */}
          <div>
            <label className={labelClass}>Report Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.entries(REPORT_LABELS) as [ReportType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    reportType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                  {type !== 'h2h' && (
                    <span className="block text-xs font-normal mt-0.5 opacity-70">Paid</span>
                  )}
                  {type === 'h2h' && (
                    <span className="block text-xs font-normal mt-0.5 opacity-70">1 free</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Your Website */}
          <div>
            <label className={labelClass}>Your Website</label>
            <input
              type="url"
              value={targetWebsite}
              onChange={e => setTargetWebsite(e.target.value)}
              className={inputClass}
              placeholder="https://yourcompany.com"
              required
            />
          </div>

          {/* Competitor Fields */}
          {(reportType === 'h2h' || reportType === 't3c') && (
            <div className="space-y-5 pt-2 border-t border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 pt-2">
                Competitor{reportType === 't3c' ? 's' : ''} {reportType === 'h2h' ? '(required)' : '(up to 3)'}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Competitor 1 Website *</label>
                  <input type="url" value={competitor1Website} onChange={e => setCompetitor1Website(e.target.value)}
                    className={inputClass} placeholder="https://competitor.com" required />
                </div>
                <div>
                  <label className={labelClass}>Competitor 1 Name (optional)</label>
                  <input type="text" value={competitor1} onChange={e => setCompetitor1(e.target.value)}
                    className={inputClass} placeholder="Competitor Inc" />
                </div>
              </div>

              {reportType === 't3c' && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Competitor 2 Website</label>
                      <input type="url" value={competitor2Website} onChange={e => setCompetitor2Website(e.target.value)}
                        className={inputClass} placeholder="https://competitor2.com" />
                    </div>
                    <div>
                      <label className={labelClass}>Competitor 2 Name (optional)</label>
                      <input type="text" value={competitor2} onChange={e => setCompetitor2(e.target.value)}
                        className={inputClass} placeholder="Competitor 2" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Competitor 3 Website</label>
                      <input type="url" value={competitor3Website} onChange={e => setCompetitor3Website(e.target.value)}
                        className={inputClass} placeholder="https://competitor3.com" />
                    </div>
                    <div>
                      <label className={labelClass}>Competitor 3 Name (optional)</label>
                      <input type="text" value={competitor3} onChange={e => setCompetitor3(e.target.value)}
                        className={inputClass} placeholder="Competitor 3" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Generating report…' : 'Generate Report'}
          </button>

          <p className="text-center text-xs text-gray-600">
            Report delivered to your email in 2–4 minutes. Saved to your dashboard.
          </p>
        </motion.form>

      </div>
    </div>
  )
}
