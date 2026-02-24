'use client'

import { useState } from 'react'

export default function ForgotPasswordByPhonePage() {
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/auth/forgot-by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
    } catch {
      // Swallow — always show success to prevent phone enumeration
    } finally {
      setSubmitting(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-zinc-400">
          If a phone number matches, a password reset link has been sent to the associated email address.
        </p>
        <a href="/login" className="inline-block mt-6 text-cyan-400 hover:text-cyan-300 text-sm">
          Back to login
        </a>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Reset via phone</h1>
      <p className="text-zinc-400 mb-6">
        Enter the phone number on your account — we&apos;ll email you a reset link.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="+1 555 000 0000"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60"
        >
          {submitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="text-center text-sm text-zinc-500 mt-6">
        <a href="/forgot-password" className="text-cyan-400 hover:text-cyan-300">Use email instead</a>
        {' · '}
        <a href="/login" className="text-cyan-400 hover:text-cyan-300">Back to login</a>
      </p>
    </div>
  )
}
