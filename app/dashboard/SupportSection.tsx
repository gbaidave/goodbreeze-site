'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  tickets: Ticket[]
  userEmail: string
}

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
}

function TicketItem({ ticket, userEmail }: { ticket: Ticket; userEmail: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [ticketStatus, setTicketStatus] = useState(ticket.status)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [closing, setClosing] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [error, setError] = useState('')

  const isClosed = ticketStatus === 'resolved' || ticketStatus === 'closed'
  const lastMsg = ticket.messages[ticket.messages.length - 1]
  const hasUnreadAdminMessage = lastMsg?.sender_role === 'admin'

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/support/${ticket.id}/user-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send.'); return }
      setReply('')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
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
      const res = await fetch(`/api/support/${ticket.id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: closeReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to close.'); return }
      setTicketStatus('closed')
      setShowCloseForm(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setClosing(false)
    }
  }

  async function handleReopen() {
    setReopening(true)
    setError('')
    try {
      const res = await fetch(`/api/support/${ticket.id}/reopen`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to reopen.'); return }
      setTicketStatus('open')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setReopening(false)
    }
  }

  return (
    <div className="bg-dark border border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_STYLES[ticketStatus] ?? STATUS_STYLES.open}`}>
            {ticketStatus.replace('_', ' ')}
          </span>
          {hasUnreadAdminMessage && !isClosed && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="New reply" />
          )}
          <span className="text-gray-300 text-sm truncate">
            {ticket.message.slice(0, 80)}{ticket.message.length > 80 ? '…' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-gray-600 text-xs">
            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-3">
          {/* Thread */}
          {ticket.messages.length === 0 ? (
            <p className="text-gray-600 text-sm">No replies yet.</p>
          ) : (
            <div className="space-y-2">
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 text-sm ${
                    msg.sender_role === 'admin'
                      ? 'bg-primary/10 border border-primary/20 text-white ml-4'
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
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Closed/resolved: show reopen */}
          {isClosed && (
            <p className="text-sm text-gray-500 pt-1">
              This request is {ticketStatus}.{' '}
              <button
                type="button"
                onClick={handleReopen}
                disabled={reopening}
                className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
              >
                {reopening ? 'Reopening…' : 'Reopen to reply'}
              </button>
            </p>
          )}

          {/* Active: reply form + close option */}
          {!isClosed && (
            <>
              <form onSubmit={handleReply} className="space-y-2 pt-1">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Add a follow-up message…"
                  className="w-full px-3 py-2 bg-dark border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </form>

              {!showCloseForm ? (
                <button
                  type="button"
                  onClick={() => { setShowCloseForm(true); setError('') }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Close this request
                </button>
              ) : (
                <form onSubmit={handleClose} className="bg-dark-700 border border-gray-700 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Why are you closing this request?</p>
                  <textarea
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    rows={2}
                    required
                    minLength={10}
                    placeholder="e.g. Resolved — the report came through."
                    className="w-full px-3 py-2 bg-dark border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={closing || closeReason.trim().length < 10}
                      className="px-3 py-1.5 bg-gray-700 text-gray-200 text-xs font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {closing ? 'Closing…' : 'Close Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCloseForm(false); setCloseReason(''); setError('') }}
                      className="px-3 py-1.5 text-gray-500 text-xs hover:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function SupportSection({ tickets, userEmail }: Props) {
  // Show: open/in_progress always.
  // Show resolved/closed only if last message is from admin (user needs to see the response).
  // Once user replies or reopens, it falls off naturally on next refresh.
  const visibleTickets = tickets.filter((ticket) => {
    if (ticket.status === 'open' || ticket.status === 'in_progress') return true
    const lastMsg = ticket.messages[ticket.messages.length - 1]
    return lastMsg?.sender_role === 'admin'
  })

  const hasHiddenTickets = tickets.length > 0 && visibleTickets.length < tickets.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Support requests</h2>
        <a href="/support" className="text-sm text-primary hover:text-primary/80 transition-colors">
          New request →
        </a>
      </div>

      {visibleTickets.length === 0 ? (
        <div className="bg-dark-700 border border-primary/20 rounded-2xl p-8 text-center">
          {tickets.length > 0 ? (
            <>
              <p className="text-gray-400 text-sm mb-3">No open requests.</p>
              <a href="/support" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                View all requests →
              </a>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-3">No support requests yet.</p>
              <a href="/support" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                Submit a request →
              </a>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleTickets.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} userEmail={userEmail} />
          ))}
          {hasHiddenTickets && (
            <a href="/support" className="block text-center text-xs text-gray-600 hover:text-gray-400 transition-colors pt-1">
              View all requests →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
