'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { GuestFields } from '@/components/tools/GuestFields'
import { captureEvent } from '@/lib/analytics'
import { ExhaustedState } from '@/components/ExhaustedState'
import { PhoneGatePrompt } from '@/components/tools/PhoneGatePrompt'
import { isValidPhone, normalizePhone } from '@/lib/phone'
import { CreditsDisplay } from '@/components/tools/CreditsDisplay'

type BVReportType = 'ai_seo' | 'seo_audit' | 'keyword_research' | 'landing_page' | 'seo_comprehensive'

interface ReportConfig {
  label: string
  tier: string
  tierStyle: string
  description: string
  showKeyword: boolean
  keywordLabel?: string
  keywordPlaceholder?: string
  keywordRequired?: boolean
  showCompany: boolean
  frictionless: boolean
  urlLabel: string
  urlPlaceholder: string
  badge?: string
}

const REPORT_CONFIG: Record<BVReportType, ReportConfig> = {
  ai_seo: {
    label: 'AI SEO Optimizer',
    tier: '1 credit',
    tierStyle: 'text-primary',
    description: 'AI & LLM visibility analysis + on-page SEO gaps and prioritized fixes.',
    showKeyword: false,
    showCompany: true,
    frictionless: true,
    urlLabel: 'Page URL to Analyze',
    urlPlaceholder: 'https://yoursite.com/your-page',
  },
  seo_audit: {
    label: 'SEO Audit',
    tier: '1 credit',
    tierStyle: 'text-primary',
    description: 'Full technical SEO audit with keyword opportunities, backlink signals, and actionable fixes.',
    showKeyword: true,
    keywordLabel: 'Focus Keyword (optional)',
    keywordPlaceholder: 'e.g. project management software',
    showCompany: true,
    frictionless: false,
    urlLabel: 'Website URL',
    urlPlaceholder: 'https://yoursite.com',
  },
  keyword_research: {
    label: 'Keyword Research',
    tier: '1 credit',
    tierStyle: 'text-accent-blue',
    description: 'Discover high-value keywords with difficulty scores, search volume, and content opportunity mapping.',
    showKeyword: true,
    keywordLabel: 'Seed Keyword',
    keywordPlaceholder: 'e.g. email marketing tools',
    keywordRequired: true,
    showCompany: false,
    frictionless: false,
    urlLabel: 'Website URL (for context)',
    urlPlaceholder: 'https://yoursite.com',
  },
  landing_page: {
    label: 'Landing Page Optimizer',
    tier: '1 credit',
    tierStyle: 'text-accent-blue',
    description: 'Optimize your landing page for conversions, search ranking, and messaging clarity.',
    showKeyword: true,
    keywordLabel: 'Target Keyword (optional)',
    keywordPlaceholder: 'e.g. CRM software for small business',
    showCompany: true,
    frictionless: false,
    urlLabel: 'Landing Page URL',
    urlPlaceholder: 'https://yoursite.com/landing-page',
  },
  seo_comprehensive: {
    label: 'SEO Comprehensive',
    tier: '1 credit',
    tierStyle: 'text-primary',
    description: 'Our most powerful report — technical audit + keyword research + competitor analysis combined.',
    showKeyword: true,
    keywordLabel: 'Focus Keyword (optional)',
    keywordPlaceholder: 'e.g. project management',
    showCompany: true,
    frictionless: false,
    urlLabel: 'Website URL',
    urlPlaceholder: 'https://yoursite.com',
  },
}

function SuccessState({
  isGuest,
  reportType,
  onReset,
}: {
  isGuest: boolean
  reportType: BVReportType
  onReset: () => void
}) {
  const config = REPORT_CONFIG[reportType]
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
            <h2 className="text-2xl font-bold text-white mb-3">Check your inbox. Your account is ready.</h2>
            <p className="text-gray-400 mb-2">
              We created your Good Breeze AI account and started your {config.label} report. A sign-in link and your PDF results are on their way to your inbox.
            </p>
            <p className="text-gray-500 text-sm mb-8">The PDF will be ready in 2–3 minutes.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-3">Report on its way!</h2>
            <p className="text-gray-400 mb-2">
              Your {config.label} report is being generated. You&apos;ll receive the PDF by email in{' '}
              <strong className="text-white">2–3 minutes</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-8">Track progress or view past reports in your dashboard.</p>
          </>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isGuest ? (
            <Link
              href="/login"
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Sign in to your account
            </Link>
          ) : (
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
            Run Another
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function SeoIntelligencePage() {
  const { user, loading: authLoading } = useAuth()
  const isGuest = !authLoading && !user

  const [reportType, setReportType] = useState<BVReportType>('ai_seo')
  const [url, setUrl] = useState('')
  const [company, setCompany] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestErrors, setGuestErrors] = useState<Partial<Record<'name' | 'email' | 'phone', string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState('')
  const [phoneRequired, setPhoneRequired] = useState(false)

  const config = REPORT_CONFIG[reportType]

  if (submitted) return <SuccessState isGuest={isGuest} reportType={reportType} onReset={() => setSubmitted(false)} />
  if (upgradePrompt) return <ExhaustedState error={error} upgradePrompt={upgradePrompt} />

  function handleTypeChange(type: BVReportType) {
    setReportType(type)
    setError('')
    setUpgradePrompt('')
    setPhoneRequired(false)
    setFocusKeyword('')
  }

  async function doSubmitAuthenticated() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          url,
          company: config.showCompany ? company : undefined,
          focusKeyword: config.showKeyword ? focusKeyword : undefined,
        }),
      })
      const data = await res.json()
      if (res.status === 402) {
        if (data.code === 'PHONE_REQUIRED') { setPhoneRequired(true); return }
        setError(data.error); setUpgradePrompt(data.upgradePrompt ?? 'impulse'); return
      }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      captureEvent('tool_form_submit', { reportType })
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

    // Guests can only run ai_seo (frictionless)
    if (isGuest && !config.frictionless) {
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

    if (user) {
      await doSubmitAuthenticated()
      return
    }

    // Guest frictionless — ai_seo only
    setSubmitting(true)
    try {
      const res = await fetch('/api/frictionless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'ai_seo',
          url,
          company,
          name: guestName,
          email: guestEmail,
          ...(guestPhone.trim() && { phone: normalizePhone(guestPhone) }),
        }),
      })
      const data = await res.json()
      if (res.status === 409) { setError('You already have an account. Sign in to continue.'); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      captureEvent('tool_form_submit', { reportType })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Link href="/tools" className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← All Reports
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">SEO Intelligence Suite</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Choose your report type — AI-generated SEO intelligence delivered as a full PDF to your inbox.
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
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          {/* Report Type Selector */}
          <div>
            <label className={labelClass}>Report Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {(Object.entries(REPORT_CONFIG) as [BVReportType, ReportConfig][]).map(([type, cfg]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`relative px-3 py-3 rounded-xl border text-xs font-medium transition-all text-left ${
                    reportType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  {cfg.badge && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent-blue text-white text-[10px] font-bold rounded-full">
                      {cfg.badge}
                    </span>
                  )}
                  <span className="block font-semibold mb-1 leading-tight">{cfg.label}</span>
                  <span className={`block text-[10px] font-normal ${reportType === type ? 'opacity-70' : cfg.tierStyle + ' opacity-80'}`}>
                    {cfg.tier}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">{config.description}</p>
          </div>

          {/* URL Field */}
          <div>
            <label className={labelClass}>{config.urlLabel} *</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className={inputClass}
              placeholder={config.urlPlaceholder}
              required
            />
          </div>

          {/* Focus Keyword (conditional) */}
          {config.showKeyword && (
            <div>
              <label className={labelClass}>
                {config.keywordLabel}
                {config.keywordRequired ? ' *' : ''}
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={e => setFocusKeyword(e.target.value)}
                className={inputClass}
                placeholder={config.keywordPlaceholder}
                required={config.keywordRequired}
              />
            </div>
          )}

          {/* Company (conditional) */}
          {config.showCompany && (
            <div>
              <label className={labelClass}>Company / Brand Name (optional)</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className={inputClass}
                placeholder="Your Company Name"
              />
            </div>
          )}

          {/* Guest identity fields — ai_seo only */}
          {isGuest && config.frictionless && (
            <GuestFields
              name={guestName} onNameChange={setGuestName}
              email={guestEmail} onEmailChange={setGuestEmail}
              phone={guestPhone} onPhoneChange={setGuestPhone}
              showPhone={true}
              errors={guestErrors}
            />
          )}

          {/* Sign-in CTA for guests on paid types */}
          {isGuest && !config.frictionless ? (
            <div className="border border-primary/20 rounded-xl p-5 text-center space-y-3">
              <p className="text-sm text-gray-400">
                {config.label} requires an account. Sign in or create a free account — your first report credit is included.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 border border-primary/30 text-gray-300 text-sm rounded-full hover:border-primary hover:text-white transition-colors"
                >
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
              {submitting ? 'Generating report…' : `Generate ${config.label}`}
            </button>
          )}

          <div className="text-center space-y-1">
            <CreditsDisplay />
            <p className="text-xs text-gray-600">
              {isGuest && config.frictionless
                ? 'Free for new users — no account needed. Report delivered by email in 2–3 minutes.'
                : 'Report delivered to your email in 2–3 minutes. Saved to your dashboard.'}
            </p>
          </div>
        </motion.form>

      </div>
    </div>
  )
}
