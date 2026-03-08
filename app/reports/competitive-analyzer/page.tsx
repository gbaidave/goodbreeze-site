'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { captureEvent } from '@/lib/analytics'
import { ExhaustedState } from '@/components/ExhaustedState'
import { PhoneGatePrompt } from '@/components/tools/PhoneGatePrompt'
import { CreditsDisplay } from '@/components/tools/CreditsDisplay'
import { ReportSubmittedModal } from '@/components/tools/ReportSubmittedModal'

type ReportType = 'h2h' | 't3c' | 'cp'

const REPORT_LABELS: Record<ReportType, string> = {
  h2h: 'Head to Head',
  t3c: 'Top 3 Competitors',
  cp: 'Competitive Position',
}

export default function SalesAnalyzer() {
  const { user, loading: authLoading } = useAuth()
  const isGuest = !authLoading && !user
  const pathname = usePathname()

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
  const [reportId, setReportId] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')
  const [phoneRequired, setPhoneRequired] = useState(false)

  if (upgradePrompt) return <ExhaustedState error={error} upgradePrompt={upgradePrompt} />

  async function doSubmitAuthenticated() {
    setSubmitting(true)
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
        if (data.code === 'PHONE_REQUIRED') { setPhoneRequired(true); return }
        setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'impulse'); return
      }
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      captureEvent('tool_form_submit', { reportType })
      setReportId(data.reportId)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPhoneRequired(false)
    await doSubmitAuthenticated()
  }

  const inputClass = 'w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <>
      {submitted && (
        <ReportSubmittedModal
          heading="Report on its way!"
          body={<>Your competitive analysis is being generated. You&apos;ll receive the PDF in your inbox within <strong className="text-white">2–4 minutes</strong>.</>}
          detail="Check your dashboard to track progress or view past reports."
          reportId={reportId}
          onRunAnother={() => { setSubmitted(false); setReportId(undefined); setTargetWebsite(''); setCompetitor1(''); setCompetitor1Website(''); setCompetitor2(''); setCompetitor2Website(''); setCompetitor3(''); setCompetitor3Website('') }}
        />
      )}
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/reports" className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← All Reports
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Competitive Analyzer</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            AI-powered competitive intelligence reports. Pick your analysis type and we&apos;ll email you a full PDF.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-6"
        >
          {phoneRequired && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
              <div className="max-w-md w-full relative">
                <button
                  type="button"
                  onClick={() => setPhoneRequired(false)}
                  className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <PhoneGatePrompt onPhoneSaved={() => { setPhoneRequired(false); doSubmitAuthenticated() }} />
              </div>
            </div>
          )}
          {error && !upgradePrompt && !phoneRequired && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Report Type */}
          <div>
            <p className={labelClass}>Report Type</p>
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
                  <span className="block text-xs font-normal mt-0.5 opacity-70">1 credit</span>
                </button>
              ))}
            </div>
          </div>

          {/* Your Website */}
          <div>
            <label htmlFor="ca-target-website" className={labelClass}>Company A Website</label>
            <input
              id="ca-target-website"
              type="text"
              value={targetWebsite}
              onChange={e => setTargetWebsite(e.target.value)}
              className={inputClass}
              placeholder="https://yoursite.com"
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
                  <label htmlFor="ca-comp1-website" className={labelClass}>Company B Website</label>
                  <input id="ca-comp1-website" type="text" value={competitor1Website} onChange={e => setCompetitor1Website(e.target.value)}
                    className={inputClass} placeholder="https://theirsite.com" required />
                </div>
                <div>
                  <label htmlFor="ca-comp1-name" className={labelClass}>Company B Name (optional)</label>
                  <input id="ca-comp1-name" type="text" value={competitor1} onChange={e => setCompetitor1(e.target.value)}
                    className={inputClass} placeholder="Competitor Inc" />
                </div>
              </div>

              {reportType === 't3c' && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ca-comp2-website" className={labelClass}>Company C Website</label>
                      <input id="ca-comp2-website" type="text" value={competitor2Website} onChange={e => setCompetitor2Website(e.target.value)}
                        className={inputClass} placeholder="https://competitor2.com" />
                    </div>
                    <div>
                      <label htmlFor="ca-comp2-name" className={labelClass}>Company C Name (optional)</label>
                      <input id="ca-comp2-name" type="text" value={competitor2} onChange={e => setCompetitor2(e.target.value)}
                        className={inputClass} placeholder="Rival Co" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ca-comp3-website" className={labelClass}>Company D Website</label>
                      <input id="ca-comp3-website" type="text" value={competitor3Website} onChange={e => setCompetitor3Website(e.target.value)}
                        className={inputClass} placeholder="https://competitor3.com" />
                    </div>
                    <div>
                      <label htmlFor="ca-comp3-name" className={labelClass}>Company D Name (optional)</label>
                      <input id="ca-comp3-name" type="text" value={competitor3} onChange={e => setCompetitor3(e.target.value)}
                        className={inputClass} placeholder="Third Co" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isGuest ? (
            <div className="border border-primary/20 rounded-xl p-5 text-center space-y-3">
              <p className="text-sm text-gray-400">Create a free account to run competitive analysis reports.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href={`/signup?returnUrl=${encodeURIComponent(pathname)}`} className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all">Create free account</Link>
                <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`} className="px-5 py-2.5 border border-primary/30 text-gray-300 text-sm rounded-full hover:border-primary hover:text-white transition-colors">Sign in</Link>
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

          <div className="text-center space-y-1">
            <CreditsDisplay />
            <p className="text-xs text-gray-600">
              Report delivered to your email in 2–4 minutes. Saved to your dashboard.
            </p>
          </div>
        </motion.form>

      </div>
    </div>
    </>
  )
}
