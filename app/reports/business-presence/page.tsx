'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { captureEvent } from '@/lib/analytics'
import { ExhaustedState } from '@/components/ExhaustedState'
import BusinessPresenceReportView from '@/components/reports/BusinessPresenceReportView'

// ============================================================================
// Types
// ============================================================================

interface Report {
  id: string
  status: string
  html_content: string | null
  pdf_url: string | null
  created_at: string
  expires_at: string | null
  input_data: { url?: string } | null
}

// ============================================================================
// Inner component (needs useSearchParams → must be inside Suspense)
// ============================================================================

// Spinner messages — cycle every 4 seconds during report generation
const SPINNER_MESSAGES = [
  'Digging into your site...',
  'Poking around your competitors...',
  'Asking Google what it thinks of you...',
  'Checking if the internet likes you...',
  'Running the numbers...',
  'Spying on the competition (legally)...',
  'Checking your SEO homework...',
  'Counting your backlinks...',
  'Seeing how fast your site loads...',
  'Teaching robots about your business...',
  'Crunching competitive data...',
  'Mapping your digital footprint...',
  'Sniffing out keyword opportunities...',
  'Comparing you to the top dogs...',
  'Measuring your online street cred...',
  'Checking your visibility score...',
  'Reading between the meta tags...',
  'Asking the algorithm for its opinion...',
  'Turning raw data into insights...',
  'Almost there, putting on the finishing touches...',
]

function BusinessPresenceInner() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url') ?? ''

  const [url, setUrl] = useState(urlParam)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [hasFreeSlot, setHasFreeSlot] = useState(false)
  const [spinnerMsgIndex, setSpinnerMsgIndex] = useState(0)
  const autoSubmittedRef = useRef(false)

  // Redirect non-logged-in users to the landing page
  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = urlParam
        ? `/reports/business-presence?url=${encodeURIComponent(urlParam)}`
        : '/reports/business-presence'
      window.location.href = `/free-business-presence-report?returnUrl=${encodeURIComponent(returnUrl)}`
    }
  }, [authLoading, user, urlParam])

  // Fetch the most recent business_presence_report for this user
  useEffect(() => {
    if (!user) return
    async function fetchReport() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('reports')
          .select('id, status, html_content, pdf_url, created_at, expires_at, input_data')
          .eq('user_id', user!.id)
          .eq('report_type', 'business_presence_report')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (data) setReport(data)
      } catch {
        // No report found — that's fine
      } finally {
        setLoadingReport(false)
      }
    }
    fetchReport()
  }, [user])

  // Check if user has a free slot available
  useEffect(() => {
    if (!user) return
    async function checkFreeSlot() {
      try {
        const supabase = createClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('free_reports_used')
          .eq('id', user!.id)
          .single()
        const used = profile?.free_reports_used ?? {}
        setHasFreeSlot(!used['business_presence_report'])
      } catch {
        // Default to showing credit cost
      }
    }
    checkFreeSlot()
  }, [user])

  // Cycle spinner messages every 4 seconds while pending
  useEffect(() => {
    if (!report || !['pending', 'processing'].includes(report.status)) return
    const interval = setInterval(() => {
      setSpinnerMsgIndex(prev => (prev + 1) % SPINNER_MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [report?.id, report?.status])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url.trim()) return
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'business_presence_report', url: url.trim() }),
      })
      const data = await res.json()
      if (res.status === 402) { setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'impulse'); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      captureEvent('tool_form_submit', { reportType: 'business_presence_report' })
      window.dispatchEvent(new Event('credits-changed'))
      setReport({
        id: data.reportId,
        status: 'pending',
        html_content: null,
        pdf_url: null,
        created_at: new Date().toISOString(),
        expires_at: null,
        input_data: { url: url.trim() },
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [url])

  // Auto-submit if ?url= is present and no existing report
  useEffect(() => {
    if (!user || loadingReport || autoSubmittedRef.current) return
    if (urlParam && !report) {
      autoSubmittedRef.current = true
      handleSubmit()
    }
  }, [user, loadingReport, urlParam, report, handleSubmit])

  // Poll for report status while pending/processing
  useEffect(() => {
    if (!report || !['pending', 'processing'].includes(report.status)) return
    const reportId = report.id
    const supabase = createClient()
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('reports')
          .select('id, status, html_content, pdf_url, created_at, expires_at, input_data')
          .eq('id', reportId)
          .single()
        if (data) {
          setReport(data)
          if (!['pending', 'processing'].includes(data.status)) {
            clearInterval(interval)
          }
        }
      } catch { /* retry next interval */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [report?.id, report?.status])

  if (upgradePrompt) return <ExhaustedState error={error} upgradePrompt={upgradePrompt} />

  // Loading state
  if (authLoading || (!user && !authLoading)) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>
  }

  // Compute report state
  const isExpired = report?.expires_at ? new Date(report.expires_at) < new Date() : false
  // Stale pending reports (>15 min old) are treated as failed — show form, not spinner
  const isRecentPending = report
    && ['pending', 'processing'].includes(report.status)
    && (Date.now() - new Date(report.created_at).getTime()) < 15 * 60 * 1000
  const isPending = isRecentPending
  const isComplete = report?.status === 'complete' && !isExpired
  const isFailed = report && (
    ['failed', 'failed_site_blocked'].includes(report.status)
    || (report && ['pending', 'processing'].includes(report.status) && !isRecentPending)
  )
  const reportDomain = report?.input_data?.url ? extractDomain(report.input_data.url) : ''

  const inputClass = 'w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="min-h-screen bg-dark">
      {/* ── State: Pending / Processing ── */}
      {isPending && (
        <div className="py-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-transparent border-t-accent-blue rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Generating your Business Presence Report</h1>
              {reportDomain && <p className="text-primary font-medium mb-4">{reportDomain}</p>}
              <motion.p
                key={spinnerMsgIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-gray-400 mb-2 h-6"
              >
                {SPINNER_MESSAGES[spinnerMsgIndex]}
              </motion.p>
              <p className="text-gray-500 text-sm mt-4">This usually takes a few minutes. You&apos;ll get an email when it&apos;s ready. This page updates automatically.</p>
              <Link href="/dashboard" className="inline-block mt-8 text-sm text-primary hover:text-primary-light transition-colors">Go to Dashboard →</Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── State: Complete ── */}
      {isComplete && report && (
        <>
          <div className="sticky top-16 z-40 bg-dark-800/95 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-white">Business Presence Report</h2>
                {reportDomain && <span className="text-xs text-primary">{reportDomain}</span>}
                <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</span>
                {report.expires_at && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-800">Available {daysRemaining(report.expires_at)} more days</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {report.pdf_url && (
                  <a href={`/api/reports/${report.id}/download`} className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-primary to-accent-blue text-white rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">Download PDF</a>
                )}
                <button onClick={() => { setReport(null); setUrl('') }} className="px-4 py-1.5 text-xs font-semibold border border-gray-700 text-gray-300 rounded-full hover:border-primary hover:text-white transition-colors">Run New Report</button>
              </div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-6 py-12">
            {report.input_data && typeof report.input_data === 'object' && 'overallScore' in (report.input_data as Record<string, unknown>) ? (
              <BusinessPresenceReportView data={report.input_data as any} domain={reportDomain} />
            ) : (
              <div className="text-center py-20"><p className="text-gray-400">Report content is being prepared. Check back shortly.</p></div>
            )}
          </div>
          <div className="max-w-3xl mx-auto px-6 pb-20">
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/reports" className="block p-5 bg-dark-800 border border-gray-800 rounded-xl hover:border-primary/30 transition-colors text-center">
                <p className="text-sm font-semibold text-white mb-1">Run More Reports</p>
                <p className="text-xs text-gray-500">Dig deeper with SEO audits, keyword research, and competitive analysis.</p>
              </Link>
              <Link href="/pricing" className="block p-5 bg-dark-800 border border-gray-800 rounded-xl hover:border-primary/30 transition-colors text-center">
                <p className="text-sm font-semibold text-white mb-1">Get a Plan</p>
                <p className="text-xs text-gray-500">Monthly reports included. Use it or lose it. No commitment.</p>
              </Link>
              <a href="https://calendly.com/dave-goodbreeze/30min" target="_blank" rel="noopener noreferrer" className="block p-5 bg-dark-800 border border-gray-800 rounded-xl hover:border-primary/30 transition-colors text-center">
                <p className="text-sm font-semibold text-white mb-1">Work With Us</p>
                <p className="text-xs text-gray-500">Let Good Breeze AI fix what the report found. Book a free strategy call.</p>
              </a>
            </div>
          </div>
        </>
      )}

      {/* ── State: Expired ── */}
      {isExpired && report && (
        <div className="py-24 px-6"><div className="max-w-lg mx-auto text-center"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"><svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <h1 className="text-2xl font-bold text-white mb-3">This Report Has Expired</h1>
          <p className="text-gray-400 mb-8">Reports are available for 7 days. Run a fresh one to get updated data.</p>
          <button onClick={() => { setReport(null); setUrl(report.input_data?.url ?? '') }} className="px-8 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">Run a Fresh Report</button>
        </motion.div></div></div>
      )}

      {/* ── State: Failed ── */}
      {isFailed && report && (
        <div className="py-24 px-6"><div className="max-w-lg mx-auto text-center"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg></div>
          <h1 className="text-2xl font-bold text-white mb-3">Report Generation Failed</h1>
          <p className="text-gray-400 mb-8">We weren&apos;t able to generate your report. Your credits have been refunded. Please try again.</p>
          <button onClick={() => { setReport(null); setUrl(report.input_data?.url ?? '') }} className="px-8 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">Try Again</button>
        </motion.div></div></div>
      )}

      {/* ── State: No report (form) ── */}
      {!report && !loadingReport && (
        <div className="py-24 px-6"><div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <Link href="/reports" className="text-gray-500 hover:text-primary text-sm transition-colors">← All Reports</Link>
            <div className="mt-4 mb-3 flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold text-white">Business Presence Report</h1>
              {hasFreeSlot ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">Free</span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">3 Credits</span>
              )}
            </div>
            <p className="text-gray-400 max-w-lg mx-auto">See how your business shows up online. We analyze your visibility, competitors, reputation, and website to tell you exactly where you stand and what to fix first.</p>
          </motion.div>
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-5">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
            <div>
              <label className={labelClass}>Business URL *</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} placeholder="https://yourbusiness.com" required />
              <p className="text-xs text-gray-600 mt-1.5">Enter the main website for the business you want analyzed.</p>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Generating report…' : 'Generate My Business Presence Report'}
            </button>
            <p className="text-center text-xs text-gray-600">Report delivered by email in a few minutes. Also viewable right here.</p>
          </motion.form>
        </div></div>
      )}

      {loadingReport && <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500 text-sm">Loading your report...</div></div>}
    </div>
  )
}

// ============================================================================
// Exported page — wraps inner component in Suspense for useSearchParams
// ============================================================================

export default function BusinessPresencePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <BusinessPresenceInner />
    </Suspense>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function daysRemaining(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}
