'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Props {
  userName: string
  userEmail: string
  plan: string
  lastReportContext: string | null
}

function SuccessState() {
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
        <h2 className="text-2xl font-bold text-white mb-3">Request sent</h2>
        <p className="text-gray-400 mb-2">
          We&apos;ve received your request and will be in touch shortly.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Expect a reply to your email within 1 business day.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}

export default function SupportForm({ userName, userEmail, plan, lastReportContext }: Props) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (submitted) return <SuccessState />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const planLabel = plan === 'starter' ? 'Starter' : plan === 'impulse' ? 'Impulse' : 'Free'

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-2xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/dashboard" className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Get Help</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Describe your issue and we&apos;ll get back to you within 1 business day.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Context — auto-filled */}
          <div className="bg-dark border border-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Your account context</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name: </span>
                <span className="text-gray-300">{userName}</span>
              </div>
              <div>
                <span className="text-gray-500">Email: </span>
                <span className="text-gray-300">{userEmail}</span>
              </div>
              <div>
                <span className="text-gray-500">Plan: </span>
                <span className="text-gray-300">{planLabel}</span>
              </div>
              {lastReportContext && (
                <div>
                  <span className="text-gray-500">Last report: </span>
                  <span className="text-gray-300">{lastReportContext}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">This context is sent with your request to help us respond faster.</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              How can we help? *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              minLength={10}
              maxLength={2000}
              placeholder="Describe your issue or question in as much detail as possible…"
              className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1.5 text-right">
              {message.length} / 2000
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || message.trim().length < 10}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending…' : 'Send Request'}
          </button>

          <p className="text-center text-xs text-gray-600">
            We respond within 1 business day. Reply will be sent to {userEmail}.
          </p>
        </motion.form>

      </div>
    </div>
  )
}
