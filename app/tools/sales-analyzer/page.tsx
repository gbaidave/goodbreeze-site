'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { GuestFields } from '@/components/tools/GuestFields'
import { captureEvent } from '@/lib/analytics'
import { ExhaustedState } from '@/components/ExhaustedState'
import { isValidPhone, normalizePhone } from '@/lib/phone'

type ReportType = 'h2h' | 't3c' | 'cp'

const REPORT_LABELS: Record<ReportType, string> = {
  h2h: 'Head to Head',
  t3c: 'Top 3 Competitors',
  cp: 'Competitive Position',
}

function SuccessState({ isGuest, onReset }: { isGuest: boolean; onReset: () => void }) {
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
        {isGuest ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-3">Report running — check your inbox!</h2>
            <p className="text-gray-400 mb-2">
              We&apos;ve started your competitive analysis and emailed you a link to access your account and results.
            </p>
            <p className="text-gray-500 text-sm mb-8">The PDF will be ready in 2–4 minutes.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-3">Report on its way!</h2>
            <p className="text-gray-400 mb-2">
              Your competitive analysis is being generated. You&apos;ll receive the PDF in your inbox within <strong className="text-white">2–4 minutes</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-8">Check your dashboard to track progress or view past reports.</p>
          </>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isGuest && (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Go to Dashboard
            </Link>
          )}
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

export default function SalesAnalyzer() {
  const { user, loading: authLoading } = useAuth()
  const isGuest = !authLoading && !user

  const [reportType, setReportType] = useState<ReportType>('h2h')
  const [targetWebsite, setTargetWebsite] = useState('')
  const [competitor1, setCompetitor1] = useState('')
  const [competitor1Website, setCompetitor1Website] = useState('')
  const [competitor2, setCompetitor2] = useState('')
  const [competitor2Website, setCompetitor2Website] = useState('')
  const [competitor3, setCompetitor3] = useState('')
  const [competitor3Website, setCompetitor3Website] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestErrors, setGuestErrors] = useState<Partial<Record<'name' | 'email' | 'phone', string>>>({})

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')

  if (submitted) return <SuccessState isGuest={isGuest} onReset={() => setSubmitted(false)} />
  if (upgradePrompt) return <ExhaustedState error={error} upgradePrompt={upgradePrompt} />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Guests can only run h2h (freeAllowed)
    if (isGuest && reportType !== 'h2h') {
      setError('Sign in to access this report type.')
      return
    }

    if (isGuest) {
      const errs: typeof guestErrors = {}
      if (!guestName.trim()) errs.name = 'Name is required'
      if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errs.email = 'Valid email is required'
      if (guestPhone.trim() && !isValidPhone(guestPhone)) errs.phone = 'Enter a valid phone number'
      if (Object.keys(errs).length) { setGuestErrors(errs); return }
      setGuestErrors({})
    }

    setSubmitting(true)
    try {
      if (user) {
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
        if (res.status === 402) { setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'impulse'); return }
        if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      } else {
        // Guest frictionless — h2h only
        const res = await fetch('/api/frictionless', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType: 'h2h',
            targetWebsite,
            competitor1,
            competitor1Website,
            name: guestName,
            email: guestEmail,
            ...(guestPhone.trim() && { phone: normalizePhone(guestPhone) }),
          }),
        })
        const data = await res.json()
        if (res.status === 409) { setError('You already have an account. Sign in to continue.'); return }
        if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      }
      captureEvent('tool_form_submit', { reportType })
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

          {/* Guest identity fields — only shown for h2h (freeAllowed) */}
          {isGuest && reportType === 'h2h' && (
            <GuestFields
              name={guestName} onNameChange={setGuestName}
              email={guestEmail} onEmailChange={setGuestEmail}
              phone={guestPhone} onPhoneChange={setGuestPhone}
              showPhone={true}
              errors={guestErrors}
            />
          )}

          {/* Sign-in CTA for guests selecting paid report types */}
          {isGuest && reportType !== 'h2h' ? (
            <div className="border border-primary/20 rounded-xl p-5 text-center space-y-3">
              <p className="text-sm text-gray-400">
                {REPORT_LABELS[reportType]} requires a paid plan. Create a free account to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/register" className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all">
                  Create free account
                </Link>
                <Link href="/login" className="px-5 py-2.5 border border-primary/30 text-gray-300 text-sm rounded-full hover:border-primary hover:text-white transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Generating report…' : 'Generate Report'}
            </button>
          )}

          <p className="text-center text-xs text-gray-600">
            {isGuest && reportType === 'h2h'
              ? 'Free for new users — no account needed. Report delivered by email in 2–4 minutes.'
              : 'Report delivered to your email in 2–4 minutes. Saved to your dashboard.'}
          </p>
        </motion.form>

      </div>
    </div>
  )
}
