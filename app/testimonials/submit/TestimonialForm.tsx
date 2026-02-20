'use client'

import { useState } from 'react'

interface Props {
  submittedTypes: string[]
}

type TabType = 'written' | 'video'

export function TestimonialForm({ submittedTypes }: Props) {
  const [tab, setTab] = useState<TabType>(
    submittedTypes.includes('written') ? 'video' : 'written'
  )
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [pullQuote, setPullQuote] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ creditsGranted: number } | null>(null)

  const bothSubmitted = submittedTypes.includes('written') && submittedTypes.includes('video')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tab,
          content: tab === 'written' ? content : undefined,
          video_url: tab === 'video' ? videoUrl : undefined,
          pull_quote: pullQuote,
          ca_consent: consent,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSuccess({ creditsGranted: data.creditsGranted })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (bothSubmitted) {
    return (
      <div className="bg-dark-700 border border-primary/20 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">All done — thank you!</h2>
        <p className="text-gray-400 text-sm">You&apos;ve submitted both a written and video testimonial. We really appreciate it.</p>
        <a href="/dashboard" className="inline-block mt-6 text-primary text-sm hover:underline">← Back to dashboard</a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-dark-700 border border-green-800/50 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Thank you!</h2>
        <p className="text-gray-400 text-sm mb-1">Your testimonial has been submitted for review.</p>
        <p className="text-green-400 font-semibold text-sm">
          +{success.creditsGranted} free report credit{success.creditsGranted !== 1 ? 's' : ''} added to your account.
        </p>
        <a href="/dashboard" className="inline-block mt-6 text-primary text-sm hover:underline">← Back to dashboard</a>
      </div>
    )
  }

  const isTabSubmitted = submittedTypes.includes(tab)

  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['written', 'video'] as const).map((t) => {
          const done = submittedTypes.includes(t)
          return (
            <button
              key={t}
              onClick={() => !done && setTab(t)}
              disabled={done}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative
                ${tab === t && !done
                  ? 'text-white bg-dark-700'
                  : done
                    ? 'text-gray-600 bg-dark cursor-not-allowed'
                    : 'text-gray-400 bg-dark hover:text-gray-200'
                }`}
            >
              {t === 'written' ? 'Written testimonial' : 'Video testimonial'}
              {done && <span className="ml-2 text-xs text-green-500">✓ submitted</span>}
              {tab === t && !done && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Already submitted notice */}
      {isTabSubmitted ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          You&apos;ve already submitted a {tab} testimonial. Switch tabs to submit the other type.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Written guidance */}
          {tab === 'written' && (
            <div className="bg-dark rounded-xl p-4 border border-gray-800">
              <p className="text-gray-300 text-sm font-semibold mb-2">The Before/After/Feel framework</p>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                The most useful testimonials describe a real transformation. Use this structure:
              </p>
              <div className="space-y-1.5">
                {[
                  ['Before', 'What were you struggling with before? What was the problem or frustration?'],
                  ['After', 'What specifically changed or improved? What did you achieve?'],
                  ['Feel', 'How do you feel about it now? What difference has it made?'],
                ].map(([label, desc]) => (
                  <div key={label} className="flex gap-2 text-xs">
                    <span className="text-primary font-bold w-12 shrink-0">{label}:</span>
                    <span className="text-gray-400">{desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-gray-500 text-xs italic">
                  Example: &ldquo;Before Good Breeze AI, I was guessing at which keywords to target and watching competitors outrank me. Now I know exactly where my gaps are and what to fix first. I feel like I finally have a clear roadmap instead of throwing things at a wall.&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Video guidance */}
          {tab === 'video' && (
            <div className="bg-dark rounded-xl p-4 border border-gray-800">
              <p className="text-gray-300 text-sm font-semibold mb-2">Recording tips (2-3 minutes is ideal)</p>
              <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
                <li>Introduce yourself briefly (name, what your business does)</li>
                <li>What problem were you trying to solve?</li>
                <li>What did you use Good Breeze AI for specifically?</li>
                <li>What results have you seen?</li>
              </ul>
              <p className="text-gray-500 text-xs mt-3">
                Supported links: Loom, YouTube (unlisted is fine), or Google Drive (with share link)
              </p>
            </div>
          )}

          {/* Written content */}
          {tab === 'written' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your testimonial <span className="text-gray-500 font-normal text-xs">(30–2000 characters)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Before Good Breeze AI, I was..."
                required
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/50 resize-none"
              />
              <p className="text-gray-600 text-xs mt-1 text-right">{content.length}/2000</p>
            </div>
          )}

          {/* Video URL */}
          {tab === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video link <span className="text-gray-500 font-normal text-xs">(Loom, YouTube, or Google Drive)</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://loom.com/share/..."
                required
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          {/* Pull-quote */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your headline <span className="text-gray-500 font-normal text-xs">(2-3 words capturing your result)</span>
            </label>
            <input
              type="text"
              value={pullQuote}
              onChange={(e) => setPullQuote(e.target.value)}
              placeholder={`e.g. "Finally ranked #1" or "Saved 10 hours"`}
              maxLength={80}
              required
              className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* CA Consent */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="ca-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-dark text-primary focus:ring-primary/30"
              />
              <label htmlFor="ca-consent" className="text-gray-400 text-xs leading-relaxed cursor-pointer">
                I authorize Good Breeze AI LLC to use my testimonial, name, and/or video for marketing purposes
                as described in the Media Release Authorization below. I confirm I am 18 or older and that this
                reflects my genuine experience with the product.
              </label>
            </div>

            <details className="text-xs border border-gray-800 rounded-lg">
              <summary className="px-4 py-2 text-gray-600 cursor-pointer hover:text-gray-400 transition-colors select-none">
                Read full Media Release Authorization ↓
              </summary>
              <div className="px-4 py-4 space-y-3 text-gray-500 leading-relaxed border-t border-gray-800">
                <p>
                  <strong className="text-gray-400">Purpose:</strong> By checking the consent box on this form,
                  I hereby provide my electronic consent to authorize GOOD BREEZE AI LLC to use and disclose my
                  written testimonial, pull-quote, name, and/or video submission (including video links I provide)
                  in its marketing, website, social media, and public relations efforts.
                </p>
                <p>
                  <strong className="text-gray-400">Right to Revoke:</strong> I understand I have the right to
                  revoke this authorization at any time by sending written notice to support@goodbreeze.ai.
                  Revocation will not affect any use of my content that occurred before my revocation was received.
                </p>
                <p>
                  <strong className="text-gray-400">Authorization to Release:</strong> I hereby authorize GOOD
                  BREEZE AI LLC and its personnel to use my testimonial, pull-quote, name, and/or video submission
                  in its marketing, public relations, and media efforts, including but not limited to the Good
                  Breeze AI website, social media channels, email marketing, and advertising materials.
                </p>
                <p>
                  I understand that my testimonial content, once published, may exist indefinitely in recorded,
                  printed, or electronic form, and may be further shared by others beyond Good Breeze AI LLC&apos;s
                  direct control.
                </p>
                <p>
                  I am not required to provide this authorization. Good Breeze AI LLC does not condition access
                  to its products, services, or pricing on this authorization. I am not entitled to monetary
                  payment for use of my testimonial; however, Good Breeze AI LLC may, at its discretion, provide
                  report credits or other non-monetary benefits in appreciation for my submission.
                </p>
                <p>
                  I confirm I am 18 years of age or older and have the right to grant this authorization. I
                  waive the right of prior approval and release and hold harmless GOOD BREEZE AI LLC and its
                  affiliates from any and all claims for damages arising from the use of my testimonial, name,
                  or video submission in the Company&apos;s marketing and media efforts.
                </p>
                <p>
                  <strong className="text-gray-400">Electronic Consent:</strong> My electronic consent
                  constitutes a legally binding agreement under the California Uniform Electronic Transactions
                  Act (Cal. Com. Code §§ 1633.1 et seq.) and the federal E-SIGN Act.
                </p>
                <p className="text-gray-600 italic">
                  Contact for revocation requests: support@goodbreeze.ai · goodbreeze.ai
                </p>
              </div>
            </details>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !consent}
            className="w-full py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl
              hover:shadow-lg hover:shadow-primary/30 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Submitting...'
              : tab === 'written'
                ? 'Submit testimonial — earn 1 credit'
                : 'Submit testimonial — earn 5 credits'}
          </button>
        </form>
      )}
    </div>
  )
}
