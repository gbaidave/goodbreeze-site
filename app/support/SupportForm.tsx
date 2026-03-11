'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface AttachmentMeta {
  id: string
  file_name: string
  file_size: number | null
  mime_type: string
}

interface Message {
  id: string
  sender_role: 'user' | 'admin'
  message: string
  created_at: string
  attachments?: AttachmentMeta[]
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
  isAuthenticated: boolean
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

const MAX_ATTACH = 3
const MAX_ATTACH_BYTES = 5 * 1024 * 1024

const ALLOWED_ATTACH_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]

async function uploadAttachments(messageId: string, files: File[]): Promise<string | null> {
  if (!files.length) return null
  const fd = new FormData()
  fd.append('messageId', messageId)
  for (const f of files) fd.append('files', f)
  const res = await fetch('/api/support/attachments', { method: 'POST', body: fd })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return data.error || 'Failed to upload attachments.'
  }
  return null
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AttachmentChips({ attachments }: { attachments: AttachmentMeta[] }) {
  if (!attachments.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {attachments.map((att) => (
        <a
          key={att.id}
          href={`/api/support/attachments/${att.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 bg-dark border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white hover:border-primary/50 transition-colors"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="truncate max-w-[140px]">{att.file_name}</span>
          {att.file_size ? <span className="text-gray-500 shrink-0">{formatBytes(att.file_size)}</span> : null}
        </a>
      ))}
    </div>
  )
}

function FilePickerInput({
  files,
  onChange,
  error,
}: {
  files: File[]
  onChange: (files: File[]) => void
  error: string
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const all = [...files, ...selected].slice(0, MAX_ATTACH)
    onChange(all)
    e.target.value = ''
  }
  function remove(idx: number) {
    onChange(files.filter((_, i) => i !== idx))
  }
  return (
    <div className="space-y-1.5">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <div key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-dark border border-gray-700 rounded-lg text-xs text-gray-300">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate max-w-[120px]">{f.name}</span>
              <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors ml-0.5">×</button>
            </div>
          ))}
        </div>
      )}
      {files.length < MAX_ATTACH && (
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Attach file{files.length > 0 ? '' : ' (optional)'}
          <input
            type="file"
            multiple
            accept={ALLOWED_ATTACH_TYPES.join(',')}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-gray-600">Max {MAX_ATTACH} files · 5 MB each · images, PDF, Word, text</p>
    </div>
  )
}

function SuccessState({ isAuthenticated }: { isAuthenticated: boolean }) {
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
          {isAuthenticated
            ? "We'll reply here in your dashboard and via email."
            : "We'll reply to the email address you provided."}
        </p>
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
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
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [replyFileError, setReplyFileError] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const isClosed = ticketStatus === 'resolved' || ticketStatus === 'closed'

  function validateFiles(files: File[]): string {
    for (const f of files) {
      if (f.size > MAX_ATTACH_BYTES) return `"${f.name}" exceeds 5 MB.`
      if (!ALLOWED_ATTACH_TYPES.includes(f.type)) return `"${f.name}" type not allowed.`
    }
    return ''
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (replyText.trim().length < 1) return
    const fileErr = validateFiles(replyFiles)
    if (fileErr) { setReplyFileError(fileErr); return }
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
      // Upload attachments if any
      let attachErr: string | null = null
      if (replyFiles.length && data.messageId) {
        attachErr = await uploadAttachments(data.messageId, replyFiles)
      }
      setLocalMessages(prev => [...prev, {
        id: data.messageId ?? Date.now().toString(),
        sender_role: 'user',
        message: replyText.trim(),
        created_at: new Date().toISOString(),
        attachments: [],
      }])
      setReplyText('')
      setReplyFiles([])
      if (attachErr) setReplyError(`Reply sent, but attachments failed: ${attachErr}`)
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
          {localMessages.length > 0 && (
            <span className="text-xs text-gray-600">
              {localMessages.length} msg{localMessages.length !== 1 ? 's' : ''}
            </span>
          )}
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
                {msg.attachments && msg.attachments.length > 0 && (
                  <AttachmentChips attachments={msg.attachments} />
                )}
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
            <FilePickerInput
              files={replyFiles}
              onChange={(f) => { setReplyFiles(f); setReplyFileError('') }}
              error={replyFileError}
            />
            <button
              type="submit"
              disabled={replying || replyText.trim().length < 1}
              className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

const STATUS_FILTER_TABS = [
  { value: 'all',         label: 'All' },
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
]

function TicketListSection({ tickets, userEmail }: { tickets: Ticket[]; userEmail: string }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Derive available categories from actual tickets
  const availableCategories = Array.from(new Set(tickets.map((t) => t.category).filter(Boolean))) as string[]

  const filtered = tickets
    .filter((t) => filterStatus === 'all' || t.status === filterStatus)
    .filter((t) => filterCategory === 'all' || t.category === filterCategory)
    .sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? -diff : diff
    })

  const visibleTabs = STATUS_FILTER_TABS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Section header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Your Requests
          <span className="ml-2 text-gray-600 font-normal normal-case">
            ({filtered.length}{filtered.length !== tickets.length ? ` of ${tickets.length}` : ''})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {/* Category filter */}
          {availableCategories.length > 1 && (
            <CustomSelect
              value={filterCategory}
              onChange={setFilterCategory}
              options={[
                { value: 'all', label: 'All categories' },
                ...availableCategories.map((cat) => ({ value: cat, label: CATEGORY_LABELS[cat] ?? cat })),
              ]}
              className="text-xs px-2 py-1.5 bg-dark border border-gray-700 text-gray-300 rounded-lg"
              dropdownMinWidth="w-44"
            />
          )}
          {/* Sort */}
          <CustomSelect
            value={sortOrder}
            onChange={(v) => setSortOrder(v as 'newest' | 'oldest')}
            options={[
              { value: 'newest', label: 'Newest first' },
              { value: 'oldest', label: 'Oldest first' },
            ]}
            className="text-xs px-2 py-1.5 bg-dark border border-gray-700 text-gray-300 rounded-lg"
            dropdownMinWidth="w-36"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      {tickets.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {visibleTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filterStatus === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-dark border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Ticket rows */}
      {filtered.length === 0 ? (
        <p className="text-gray-600 text-sm py-4 text-center">No requests match this filter.</p>
      ) : (
        filtered.map((ticket) => (
          <TicketThread key={ticket.id} ticket={ticket} userEmail={userEmail} />
        ))
      )}
    </motion.div>
  )
}

export default function SupportForm({ isAuthenticated, userName, userEmail, plan, lastReportContext, tickets = [] }: Props) {
  const [category, setCategory] = useState('help')
  const [subject, setSubject] = useState('')
  const [productType, setProductType] = useState('subscription')
  const [refundMethod, setRefundMethod] = useState<'credits' | 'payment_method'>('credits')
  const [stripeAttempted, setStripeAttempted] = useState(false)
  const [message, setMessage] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [attachFiles, setAttachFiles] = useState<File[]>([])
  const [attachFileError, setAttachFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (submitted) return <SuccessState isAuthenticated={isAuthenticated} />

  const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === category)
  const subjectPlaceholder = selectedCategory?.placeholder ?? 'Optional — brief summary of your issue'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Guest validation
    if (!isAuthenticated) {
      if (!guestName.trim()) { setError('Please enter your name.'); return }
      if (!guestEmail.trim() || !guestEmail.includes('@')) { setError('Please enter a valid email address.'); return }
    }
    // Validate attachments client-side
    for (const f of attachFiles) {
      if (f.size > MAX_ATTACH_BYTES) { setAttachFileError(`"${f.name}" exceeds 5 MB.`); return }
      if (!ALLOWED_ATTACH_TYPES.includes(f.type)) { setAttachFileError(`"${f.name}" type not allowed.`); return }
    }
    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, string> = { message, category }
      if (subject.trim()) body.subject = subject.trim()
      if (!isAuthenticated) {
        body.guest_name = guestName.trim()
        body.guest_email = guestEmail.trim()
      }
      if (category === 'refund') {
        body.product_type = productType
        body.refund_method = refundMethod
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      // Upload attachments after ticket + message created
      if (attachFiles.length && data.messageId) {
        await uploadAttachments(data.messageId, attachFiles)
      }
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
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Get Help</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Describe your issue and we&apos;ll be in touch.
          </p>
        </motion.div>

        {/* New request form — primary action first */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
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

          {/* Context — auto-filled for authenticated, editable for guests */}
          {isAuthenticated ? (
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
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guest-name" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Your name *
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600"
                />
              </div>
              <div>
                <label htmlFor="guest-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Your email *
                </label>
                <input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600"
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="support-category" className="block text-sm font-medium text-gray-300 mb-1.5">
              What do you need help with? *
            </label>
            <CustomSelect
              id="support-category"
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl text-sm"
              dropdownMinWidth="w-full"
            />
          </div>

          {/* Refund type — only shown for refund category */}
          {category === 'refund' && (
            <>
              <div>
                <label htmlFor="support-product-type" className="block text-sm font-medium text-gray-300 mb-1.5">
                  What would you like a refund for? *
                </label>
                <CustomSelect
                  id="support-product-type"
                  value={productType}
                  onChange={setProductType}
                  options={[
                    { value: 'subscription', label: 'My monthly / annual subscription' },
                    { value: 'credit_pack', label: 'A credit pack purchase' },
                  ]}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl text-sm"
                  dropdownMinWidth="w-full"
                />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-300 mb-2">How would you like to be refunded? *</p>
                <div className="space-y-2">
                  {[
                    { value: 'credits', label: 'Add credits to my account' },
                    { value: 'payment_method', label: 'Refund to my original payment method' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="refund_method"
                        value={opt.value}
                        checked={refundMethod === opt.value}
                        onChange={() => {
                          setRefundMethod(opt.value as 'credits' | 'payment_method')
                          setStripeAttempted(false)
                        }}
                        className="accent-primary"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {refundMethod === 'payment_method' && (
                <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-amber-300 font-medium">Try Stripe first</p>
                  <p className="text-sm text-gray-300">
                    Many payment refunds can be handled directly through your billing settings.{' '}
                    <a
                      href="/account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      Go to your account settings
                    </a>{' '}
                    and look for billing or subscription options. If Stripe allows a self-service refund, that&apos;s the fastest path.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stripeAttempted}
                      onChange={(e) => setStripeAttempted(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span className="text-sm text-gray-300">
                      I tried but Stripe wouldn&apos;t let me do it — I need admin help.
                    </span>
                  </label>
                </div>
              )}
            </>
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

          {/* Attachments */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1.5">Attachments <span className="text-gray-600 font-normal">(optional)</span></p>
            <FilePickerInput
              files={attachFiles}
              onChange={(f) => { setAttachFiles(f); setAttachFileError('') }}
              error={attachFileError}
            />
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              message.trim().length < 10 ||
              (category === 'refund' && refundMethod === 'payment_method' && !stripeAttempted)
            }
            className="w-full py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending…' : 'Send Request'}
          </button>

          <p className="text-center text-xs text-gray-600">
            {isAuthenticated
              ? `We'll be in touch. Reply will be sent to ${userEmail} and will appear here.`
              : "We'll reply to the email address you provided above."}
          </p>
        </motion.form>

        {/* Previous tickets — below the form */}
        {tickets.length > 0 && (
          <TicketListSection tickets={tickets} userEmail={userEmail} />
        )}

      </div>
    </div>
  )
}
