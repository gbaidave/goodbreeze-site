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
  category?: string
  subject?: string | null
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

const CATEGORY_OPTIONS = [
  { value: 'help',           label: 'General Help',       placeholder: 'e.g. How do I use the SEO audit report?' },
  { value: 'report_issue',   label: 'Report Issue',        placeholder: 'e.g. My keyword research report failed' },
  { value: 'billing',        label: 'Billing',             placeholder: 'e.g. Question about my subscription' },
  { value: 'refund',         label: 'Refund Request',      placeholder: 'e.g. I\'d like to request a refund' },
  { value: 'dispute',        label: 'Dispute',             placeholder: 'e.g. I was charged incorrectly' },
  { value: 'account_access', label: 'Account Access',      placeholder: 'e.g. I can\'t log in to my account' },
  { value: 'feedback',       label: 'Feedback',            placeholder: 'e.g. Feature request: …' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label])
)

const CATEGORY_BADGES: Record<string, string> = {
  help:           'bg-gray-800 text-gray-400',
  report_issue:   'bg-yellow-900/40 text-yellow-400',
  billing:        'bg-blue-900/40 text-blue-400',
  refund:         'bg-orange-900/40 text-orange-400',
  dispute:        'bg-red-900/40 text-red-400',
  account_access: 'bg-purple-900/40 text-purple-400',
  feedback:       'bg-green-900/40 text-green-400',
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
          We&apos;ve received your request and we&apos;ll be in touch.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          We&apos;ll reply here in your dashboard and via email.
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
  const [ticketStatus, setTicketStatus] = useState(ticket.status)
  const [localMessages, setLocalMessages] = useState<Message[]>(ticket.messages)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [closing, setClosing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const isClosed = ticketStatus === 'resolved' || ticketStatus === 'closed'

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (replyText.trim().length < 1) return
    setReplying(true)
    setReplyError('')
    try {
      const res = await fetch(`/api/support/${ticket.id}/user-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setReplyError(data.error || 'Failed to send.'); return }
      setLocalMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender_role: 'user',
        message: replyText.trim(),
        created_at: new Date().toISOString(),
      }])
      setReplyText('')
    } catch {
      setReplyError('Something went wrong. Please try again.')
    } finally {
      setReplying(false)
    }
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault()
    if (closeReason.trim().length < 10) {
      setActionError('Please provide a reason (at least 10 characters).')
      return
    }
    setClosing(true)
    setActionError('')
    try {
      const res = await fetch(`/api/support/${ticket.id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: closeReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error || 'Failed to close.'); return }
      setTicketStatus('closed')
      setShowCloseForm(false)
    } catch {
      setActionError('Something went wrong. Please try again.')
    } finally {
      setClosing(false)
    }
  }

  const categoryLabel = ticket.category ? (CATEGORY_LABELS[ticket.category] ?? ticket.category) : null
  const categoryBadge = ticket.category ? (CATEGORY_BADGES[ticket.category] ?? CATEGORY_BADGES.help) : null
  const threadTitle = ticket.subject || ticket.message.slice(0, 80) + (ticket.message.length > 80 ? '…' : '')

  return (
    <div className="bg-dark border border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLES[ticketStatus] ?? STATUS_STYLES.open}`}>
            {ticketStatus.replace('_', ' ')}
          </span>
          {categoryLabel && (
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${categoryBadge}`}>
              {categoryLabel}
            </span>
          )}
          <span className="text-gray-300 text-sm truncate">
            {threadTitle}
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
        <div className="border-t border-gray-800 px-4 py-3 space-y-3">
          {/* Thread messages */}
          {localMessages.length === 0 ? (
            <p className="text-gray-600 text-sm">No messages yet.</p>
          ) : (
            localMessages.map((msg) => (
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

          {/* Action error */}
          {actionError && (
            <p className="text-xs text-red-400">{actionError}</p>
          )}

          {/* Reply form — always visible */}
          <form onSubmit={handleReply} className="space-y-2 pt-1">
            {isClosed && (
              <p className="text-xs text-gray-500">Sending a reply will reopen this request.</p>
            )}
            {replyError && <p className="text-xs text-red-400">{replyError}</p>}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder="Add a follow-up message…"
              className="w-full px-3 py-2 bg-dark border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={replying || replyText.trim().length < 1}
              className="px-4 py-1.5 bg-primary text-zinc-950 text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {replying ? 'Sending…' : 'Send'}
            </button>
          </form>

          {/* Active ticket: close option */}
          {!isClosed && (
            <div className="pt-1 space-y-2">
              {!showCloseForm ? (
                <button
                  type="button"
                  onClick={() => { setShowCloseForm(true); setActionError('') }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Close this request
                </button>
              ) : (
                <form onSubmit={handleClose} className="bg-dark-700 border border-gray-700 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-gray-400 font-medium">
                    Why are you closing this request?
                  </p>
                  <textarea
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    rows={3}
                    required
                    minLength={10}
                    placeholder="e.g. I figured it out. The report came through after a few minutes."
                    className="w-full px-3 py-2 bg-dark border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
                  />
                  <p className="text-xs text-gray-600 text-right">{closeReason.length} / 500</p>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={closing || closeReason.trim().length < 10}
                      className="px-3 py-1.5 bg-gray-700 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {closing ? 'Closing…' : 'Close Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCloseForm(false); setCloseReason(''); setActionError('') }}
                      className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SupportForm({ userName, userEmail, plan, lastReportContext, tickets = [] }: Props) {
  const [category, setCategory] = useState('help')
  const [subject, setSubject] = useState('')
  const [productType, setProductType] = useState('subscription')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (submitted) return <SuccessState />

  const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === category)
  const subjectPlaceholder = selectedCategory?.placeholder ?? 'Optional — brief summary of your issue'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, string> = { message, category }
      if (subject.trim()) body.subject = subject.trim()
      if (category === 'refund') body.product_type = productType

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
            Describe your issue and we&apos;ll be in touch.
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

          {/* Category */}
          <div>
            <label htmlFor="support-category" className="block text-sm font-medium text-gray-300 mb-1.5">
              What do you need help with? *
            </label>
            <select
              id="support-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm appearance-none cursor-pointer [color-scheme:dark]"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Refund type — only shown for refund category */}
          {category === 'refund' && (
            <div>
              <label htmlFor="support-product-type" className="block text-sm font-medium text-gray-300 mb-1.5">
                What would you like a refund for? *
              </label>
              <select
                id="support-product-type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm appearance-none cursor-pointer [color-scheme:dark]"
              >
                <option value="subscription">My monthly / annual subscription</option>
                <option value="credit_pack">A credit pack purchase</option>
              </select>
            </div>
          )}

          {/* Subject (optional) */}
          <div>
            <label htmlFor="support-subject" className="block text-sm font-medium text-gray-300 mb-1.5">
              Subject <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <input
              id="support-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              placeholder={subjectPlaceholder}
              className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="support-message" className="block text-sm font-medium text-gray-300 mb-1.5">
              Message *
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
            We&apos;ll be in touch. Reply will be sent to {userEmail} and will appear here.
          </p>
        </motion.form>

      </div>
    </div>
  )
}
