'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Message {
  id: string
  sender_role: 'user' | 'admin'
  message: string
  created_at: string
}

interface Ticket {
  id: string
  message: string
  status: string
  created_at: string
  messages: Message[]
}

interface Props {
  userName: string
  userEmail: string
  plan: string
  lastReportContext: string | null
  tickets?: Ticket[]
}

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400',
  in_progress: 'bg-blue-900/40 text-blue-400',
  resolved:    'bg-green-900/40 text-green-400',
  closed:      'bg-gray-800 text-gray-400',
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

function TicketThread({ ticket, userEmail }: { ticket: Ticket; userEmail: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-dark border border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES.open}`}>
            {ticket.status.replace('_', ' ')}
          </span>
          <span className="text-gray-300 text-sm truncate">
            {ticket.message.slice(0, 80)}{ticket.message.length > 80 ? '…' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-gray-600 text-xs">
            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-2">
          {ticket.messages.length === 0 ? (
            <p className="text-gray-600 text-sm">No messages yet.</p>
          ) : (
            ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl p-3 text-sm ${
                  msg.sender_role === 'admin'
                    ? 'bg-primary/10 border border-primary/20 text-white ml-6'
                    : 'bg-dark-700 border border-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${msg.sender_role === 'admin' ? 'text-primary' : 'text-gray-400'}`}>
                    {msg.sender_role === 'admin' ? 'Good Breeze AI Support' : userEmail}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(msg.created_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function SupportForm({ userName, userEmail, plan, lastReportContext, tickets = [] }: Props) {
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

  const planLabel = plan === 'starter' ? 'Starter' : plan === 'growth' ? 'Growth' : plan === 'pro' ? 'Pro' : 'Free'

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-2xl mx-auto space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link href="/dashboard" className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Get Help</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Describe your issue and we&apos;ll get back to you within 1 business day.
          </p>
        </motion.div>

        {/* Previous tickets */}
        {tickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Your Previous Requests</h2>
            {tickets.map((ticket) => (
              <TicketThread key={ticket.id} ticket={ticket} userEmail={userEmail} />
            ))}
          </motion.div>
        )}

        {/* New request form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-6"
        >
          {tickets.length > 0 && (
            <h2 className="text-lg font-semibold text-white">Submit a New Request</h2>
          )}

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
            <label htmlFor="support-message" className="block text-sm font-medium text-gray-300 mb-1.5">
              How can we help? *
            </label>
            <textarea
              id="support-message"
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
