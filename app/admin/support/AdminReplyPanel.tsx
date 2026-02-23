'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  sender_role: 'user' | 'admin'
  message: string
  created_at: string
}

interface Props {
  requestId: string
  userEmail: string
  status: string
  messages: Message[]
}

export function AdminReplyPanel({ requestId, userEmail, status, messages }: Props) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')
  const [resolved, setResolved] = useState(status === 'resolved')

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
      setResolved(true)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
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
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Reply form (only if not resolved) */}
      {!resolved && (
        <form onSubmit={handleReply} className="space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Write a reply to the user…"
            className="w-full px-3 py-2 bg-dark border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-gray-600"
          />
          <div className="flex gap-2">
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
          </div>
        </form>
      )}

      {resolved && (
        <p className="text-xs text-green-400 font-medium">Resolved</p>
      )}
    </div>
  )
}
