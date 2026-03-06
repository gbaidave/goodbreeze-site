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
  supportRequestId: string
  userEmail: string
  messages: Message[]
}

export function RefundThreadPanel({ supportRequestId, userEmail, messages }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/support/${supportRequestId}/reply`, {
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

  return (
    <div className="border-t border-zinc-800 pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {expanded ? 'Hide' : 'View'} support thread
        {messages.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-zinc-700 text-gray-400">{messages.length}</span>}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Messages */}
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 text-sm ${
                    msg.sender_role === 'admin'
                      ? 'bg-primary/10 border border-primary/20 text-white ml-8'
                      : 'bg-zinc-800 border border-zinc-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${msg.sender_role === 'admin' ? 'text-primary' : 'text-gray-400'}`}>
                      {msg.sender_role === 'admin' ? 'You (Admin)' : userEmail}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(msg.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600 italic">No messages in this thread yet.</p>
          )}

          {/* Reply form */}
          <form onSubmit={handleReply} className="space-y-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              placeholder="Reply to user…"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder-zinc-600"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !reply.trim()}
              className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send Reply'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
