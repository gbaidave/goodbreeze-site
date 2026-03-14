'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

interface AdminUser {
  id: string
  name: string
  email?: string
}

interface Props {
  requestId: string
  userEmail: string
  status: string
  category?: string
  messages: Message[]
  assignedTo?: string | null
  assigneeId?: string | null
  adminUsers?: AdminUser[]
  actorRole?: string
  actorUserId?: string
}

const CATEGORY_OPTIONS = [
  { value: 'help', label: 'General Help' },
  { value: 'report_issue', label: 'Report Issue' },
  { value: 'billing', label: 'Billing' },
  { value: 'refund', label: 'Refund Request' },
  { value: 'dispute', label: 'Dispute' },
  { value: 'account_access', label: 'Account Access' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug_report', label: 'Bug Report' },
]

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminReplyPanel({
  requestId, userEmail, status, category, messages, assignedTo,
  assigneeId, adminUsers = [], actorRole = 'admin', actorUserId = '',
}: Props) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState('')
  const [ticketStatus, setTicketStatus] = useState(status)
  const [currentAssigneeId, setCurrentAssigneeId] = useState(assigneeId ?? '')
  const [savingAssignee, setSavingAssignee] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(category ?? 'help')
  const [savingCategory, setSavingCategory] = useState(false)

  const isDone = ticketStatus === 'resolved' || ticketStatus === 'closed'

  // All roles (support, admin, superadmin) can assign to any eligible user
  const assignableUsers = adminUsers

  async function handleCategoryChange(newCategory: string) {
    setCurrentCategory(newCategory)
    setSavingCategory(true)
    try {
      await fetch(`/api/admin/support/${requestId}/category`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      })
      router.refresh()
    } finally {
      setSavingCategory(false)
    }
  }

  async function handleAssigneeChange(newAssigneeId: string) {
    setCurrentAssigneeId(newAssigneeId)
    setSavingAssignee(true)
    try {
      await fetch(`/api/admin/support/${requestId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee_id: newAssigneeId || null }),
      })
      router.refresh()
    } finally {
      setSavingAssignee(false)
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/support/${requestId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send reply.'); return }
      setReply('')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResolve() {
    if (!confirm('Mark this ticket as resolved?')) return
    setResolving(true)
    setError('')
    try {
      const res = await fetch(`/api/support/${requestId}/resolve`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to resolve.'); return }
      setTicketStatus('resolved')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setResolving(false)
    }
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault()
    if (closeReason.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters).')
      return
    }
    setClosing(true)
    setError('')
    try {
      const res = await fetch(`/api/support/${requestId}/admin-close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: closeReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to close ticket.'); return }
      setTicketStatus('closed')
      setShowCloseForm(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Assignee */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 whitespace-nowrap">Assigned to:</label>
        <div className="relative">
          <button
            type="button"
            disabled={savingAssignee}
            onClick={() => setAssigneeOpen((v) => !v)}
            className="flex items-center gap-1 max-w-[200px] px-2 py-1 bg-dark border border-gray-700 text-white text-xs rounded-lg hover:border-primary/60 transition-colors disabled:opacity-50"
          >
            <span className="truncate">
              {currentAssigneeId
                ? assignableUsers.find((u) => u.id === currentAssigneeId)?.name
                  || assignableUsers.find((u) => u.id === currentAssigneeId)?.email
                  || 'Assigned'
                : 'Unassigned'}
            </span>
            <svg className="w-3 h-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {assigneeOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#2a2a2a] border border-primary/40 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => { handleAssigneeChange(''); setAssigneeOpen(false) }}
                className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-primary/20 hover:text-white transition-colors"
              >
                Unassigned
              </button>
              {assignableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { handleAssigneeChange(u.id); setAssigneeOpen(false) }}
                  className="block w-full text-left px-3 py-2 text-xs text-white hover:bg-primary/20 transition-colors"
                >
                  {u.name ? `${u.name} (${u.email ?? u.id})` : (u.email ?? u.id)}
                </button>
              ))}
            </div>
          )}
        </div>
        {!assignableUsers.find((u) => u.id === actorUserId) && actorUserId && (
          <button
            type="button"
            onClick={() => handleAssigneeChange(actorUserId)}
            disabled={savingAssignee}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            Assign to me
          </button>
        )}
        {savingAssignee && <span className="text-xs text-gray-500">Saving…</span>}
      </div>

      {/* Category */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 whitespace-nowrap">Category:</label>
        <select
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={savingCategory}
          className="px-2 py-1 bg-dark border border-gray-700 text-white text-xs rounded-lg focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {savingCategory && <span className="text-xs text-gray-500">Saving…</span>}
      </div>

      {/* Thread */}
      {messages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Thread</p>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl p-3 text-sm ${
                msg.sender_role === 'admin'
                  ? 'bg-primary/10 border border-primary/20 text-white ml-8'
                  : 'bg-dark border border-gray-800 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${msg.sender_role === 'admin' ? 'text-primary' : 'text-gray-400'}`}>
                  {msg.sender_role === 'admin' ? 'You (Admin)' : userEmail}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(msg.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.message}</p>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.attachments.map((att) => (
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
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Reply + action forms — only if ticket is still active */}
      {!isDone && (
        <>
          <form onSubmit={handleReply} className="space-y-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Write a reply to the user…"
              className="w-full px-3 py-2 bg-dark border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="submit"
                disabled={submitting || !reply.trim()}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Send Reply'}
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={resolving}
                className="px-4 py-2 bg-green-700/40 text-green-400 border border-green-700 text-sm font-medium rounded-lg hover:bg-green-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resolving ? 'Resolving…' : 'Mark Resolved'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCloseForm((v) => !v); setError('') }}
                className="px-4 py-2 bg-gray-800 text-gray-400 border border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close Ticket
              </button>
            </div>
          </form>

          {/* Inline close form */}
          {showCloseForm && (
            <form
              onSubmit={handleClose}
              className="bg-dark border border-gray-700 rounded-xl p-4 space-y-3"
            >
              <p className="text-xs text-gray-400 font-medium">
                Provide a reason — the user will see this in a notification and email.
              </p>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                rows={3}
                required
                minLength={10}
                placeholder="e.g. This looks like a duplicate of another request. Please submit a new one if you still need help."
                className="w-full px-3 py-2 bg-dark-700 border border-gray-600 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
              />
              <p className="text-xs text-gray-600 text-right">{closeReason.length} / 500</p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={closing || closeReason.trim().length < 10}
                  className="px-4 py-2 bg-red-900/40 text-red-400 border border-red-800 text-sm font-medium rounded-lg hover:bg-red-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {closing ? 'Closing…' : 'Close & Notify User'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCloseForm(false); setCloseReason(''); setError('') }}
                  className="px-4 py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Status indicator when done */}
      {isDone && (
        <p className={`text-xs font-medium ${ticketStatus === 'resolved' ? 'text-green-400' : 'text-gray-400'}`}>
          {ticketStatus === 'resolved' ? 'Resolved' : 'Closed'}
        </p>
      )}
    </div>
  )
}
