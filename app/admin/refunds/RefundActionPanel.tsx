'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  requestId: string
  stripePaymentId: string
  amountPaidCents: number
  creditsUsed: number
  userId: string
}

export function RefundActionPanel({ requestId, stripePaymentId, amountPaidCents, creditsUsed }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEligible = creditsUsed === 0

  async function handleAction(action: 'refund' | 'deny') {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/refunds/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Action failed. Try again.')
        return
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-zinc-800 pt-4 space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Admin notes (optional)…"
        rows={2}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:outline-none focus:border-primary transition-colors resize-none placeholder-zinc-600"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => handleAction('refund')}
          disabled={loading || !isEligible}
          title={!isEligible ? 'Not eligible — credits have been used' : undefined}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : `Issue Stripe Refund ($${(amountPaidCents / 100).toFixed(2)})`}
        </button>
        <button
          onClick={() => handleAction('deny')}
          disabled={loading}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Deny
        </button>
      </div>
      {!isEligible && (
        <p className="text-xs text-amber-400">
          Credits have been used — not eligible for refund per policy. You can still deny or add notes.
        </p>
      )}
    </div>
  )
}
