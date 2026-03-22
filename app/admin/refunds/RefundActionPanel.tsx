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

const DENY_REASONS = [
  'Credits already used',
  'Outside 14-day window',
  'Policy violation',
  'Duplicate request',
  'Other',
]

export function RefundActionPanel({ requestId, stripePaymentId, amountPaidCents, creditsUsed }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentIdInput, setPaymentIdInput] = useState('')
  const [savingPaymentId, setSavingPaymentId] = useState(false)
  const [paymentIdError, setPaymentIdError] = useState('')
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [denyReason, setDenyReason] = useState(DENY_REASONS[0]!)
  const [denyReasonDetail, setDenyReasonDetail] = useState('')
  const [denyDropdownOpen, setDenyDropdownOpen] = useState(false)

  const hasPaymentId = !!stripePaymentId && stripePaymentId.trim() !== ''
  // Refund can be issued if no credits used — PI is resolved at processing time for subscriptions
  const canRefund = creditsUsed === 0

  async function handleRefund() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/refunds/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', notes }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Action failed. Try again.'); return }
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeny() {
    if (denyReason === 'Other' && !denyReasonDetail.trim()) {
      setError('Please explain the denial reason.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/refunds/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deny',
          notes,
          denyReason,
          denyReasonDetail: denyReason === 'Other' ? denyReasonDetail.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Action failed. Try again.'); return }
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function savePaymentId() {
    const id = paymentIdInput.trim()
    if (!id) { setPaymentIdError('Enter a payment intent ID.'); return }
    if (!id.startsWith('pi_')) { setPaymentIdError('Must start with pi_ (Stripe payment intent ID).'); return }
    setSavingPaymentId(true)
    setPaymentIdError('')
    try {
      const res = await fetch(`/api/admin/refunds/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_payment_id', stripePaymentId: id }),
      })
      const data = await res.json()
      if (!res.ok) { setPaymentIdError(data.error || 'Failed to save.'); return }
      router.refresh()
    } catch {
      setPaymentIdError('Something went wrong. Try again.')
    } finally {
      setSavingPaymentId(false)
    }
  }

  return (
    <div className="border-t border-zinc-800 pt-4 space-y-3">
      {/* Stripe payment ID entry — shown when no ID on file (manual fallback) */}
      {!hasPaymentId && (
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-3 space-y-2">
          <p className="text-xs text-amber-400 font-medium">No Stripe payment ID on file</p>
          <p className="text-xs text-gray-500">
            For subscriptions this is resolved automatically at refund time. For credit packs,
            look up the PI in your{' '}
            <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
              Stripe dashboard
            </a>{' '}
            if needed.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={paymentIdInput}
              onChange={(e) => { setPaymentIdInput(e.target.value); setPaymentIdError('') }}
              placeholder="pi_3..."
              className="flex-1 px-2 py-1.5 bg-zinc-900 border border-zinc-600 text-white text-xs font-mono rounded-lg focus:outline-none focus:border-primary transition-colors placeholder-zinc-600"
            />
            <button
              onClick={savePaymentId}
              disabled={savingPaymentId || !paymentIdInput.trim()}
              className="px-3 py-1.5 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {savingPaymentId ? 'Saving…' : 'Save'}
            </button>
          </div>
          {paymentIdError && <p className="text-xs text-red-400">{paymentIdError}</p>}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Admin notes (optional)…"
        rows={2}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:outline-none focus:border-primary transition-colors resize-none placeholder-zinc-600"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Deny form */}
      {showDenyForm && (
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-3 space-y-2">
          <p className="text-xs text-gray-400 font-medium">Reason for denial</p>

          {/* Custom dropdown — never use native select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDenyDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary transition-colors"
            >
              <span>{denyReason}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${denyDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {denyDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-zinc-900 border border-zinc-600 rounded-lg shadow-xl overflow-hidden">
                {DENY_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setDenyReason(r); setDenyDropdownOpen(false); setDenyReasonDetail('') }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${r === denyReason ? 'bg-primary/20 text-white' : 'text-gray-300 hover:bg-zinc-800 hover:text-white'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail field — required when reason is Other */}
          {denyReason === 'Other' && (
            <div>
              <textarea
                value={denyReasonDetail}
                onChange={(e) => setDenyReasonDetail(e.target.value)}
                placeholder="Explain the reason shown to the user…"
                rows={2}
                className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary transition-colors resize-none placeholder-zinc-600"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDeny}
              disabled={loading}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Confirm Deny'}
            </button>
            <button
              type="button"
              onClick={() => { setShowDenyForm(false); setDenyDropdownOpen(false) }}
              className="px-3 py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleRefund}
          disabled={loading || !canRefund}
          title={!canRefund ? 'Credits have been used — not eligible for refund' : undefined}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : 'Issue Stripe Refund'}
        </button>
        {!showDenyForm && (
          <button
            onClick={() => setShowDenyForm(true)}
            disabled={loading}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Deny
          </button>
        )}
      </div>
      {creditsUsed > 0 && (
        <p className="text-xs text-amber-400">Credits have been used — not eligible for automated refund per policy. You can still deny or add notes.</p>
      )}
    </div>
  )
}
