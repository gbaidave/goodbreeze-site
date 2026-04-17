'use client'

import { useState } from 'react'
import type { ValidationResult, ValidationIssue } from '@/lib/catalog-validator'

const CHECK_LABELS: Record<string, string> = {
  load: 'Catalog load error',
  duplicate_sku: 'Duplicate SKU',
  sku_format: 'SKU format warning',
  missing_stripe_price_id: 'Missing Stripe Price ID',
  missing_credits_granted: 'Missing credits_granted',
  missing_price: 'Missing price',
  price_mismatch: 'Catalog ≠ Stripe price',
  stripe_price_inactive: 'Stripe Price inactive',
  stripe_price_missing: 'Stripe Price not found',
}

const SYNC_ACTION_CHECKS = new Set([
  'missing_stripe_price_id',
  'price_mismatch',
  'stripe_price_missing',
  'stripe_price_inactive',
])

interface Props {
  result: ValidationResult
  onClose: () => void
  onRerun: () => void
}

export default function ValidatorModal({ result, onClose, onRerun }: Props) {
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<Record<string, string>>({})

  async function handleResync(issue: ValidationIssue) {
    if (!issue.productId) return
    const key = `${issue.productId}-${issue.check}`
    setSyncingId(key)
    const res = await fetch('/api/admin/catalog/sync-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: issue.productId }),
    })
    const data = await res.json()
    setSyncingId(null)
    if (res.ok) {
      setLocalMessages((m) => ({ ...m, [key]: '✓ Synced — re-run validator to confirm' }))
      onRerun()
    } else {
      setLocalMessages((m) => ({ ...m, [key]: `✗ Sync failed: ${data.error ?? 'unknown'}` }))
    }
  }

  function renderIssue(issue: ValidationIssue, idx: number) {
    const key = `${issue.productId ?? idx}-${issue.check}-${idx}`
    const actionKey = `${issue.productId}-${issue.check}`
    const canResync = issue.productId && SYNC_ACTION_CHECKS.has(issue.check)
    return (
      <div
        key={key}
        className={`p-3 rounded border text-sm ${
          issue.severity === 'error'
            ? 'bg-red-900/20 border-red-800/40 text-red-100'
            : 'bg-amber-900/20 border-amber-800/40 text-amber-100'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {CHECK_LABELS[issue.check] ?? issue.check}
              </span>
              {issue.sku && (
                <span className="font-mono text-xs text-zinc-400">{issue.sku}</span>
              )}
            </div>
            <div className="text-zinc-200">{issue.message}</div>
            {localMessages[actionKey] && (
              <div className="mt-1 text-xs text-zinc-400">{localMessages[actionKey]}</div>
            )}
          </div>
          {canResync && (
            <button
              type="button"
              onClick={() => handleResync(issue)}
              disabled={syncingId === actionKey}
              className="shrink-0 px-3 py-1 bg-zinc-800 border border-zinc-600 text-zinc-100 text-xs rounded hover:bg-zinc-700 disabled:opacity-50"
            >
              {syncingId === actionKey ? 'Syncing…' : 'Re-sync'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl my-8 max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-white">Catalog validator — {result.summary}</h2>
            <p className="text-xs text-zinc-500 mt-1">Checked at {new Date(result.checkedAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          {result.errors.length === 0 && result.warnings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-green-400 font-medium">All checks passed</div>
              <div className="text-zinc-500 text-sm mt-1">Catalog is healthy.</div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
                Errors ({result.errors.length})
              </h3>
              <div className="space-y-2">
                {result.errors.map((issue, idx) => renderIssue(issue, idx))}
              </div>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Warnings ({result.warnings.length})
              </h3>
              <div className="space-y-2">
                {result.warnings.map((issue, idx) => renderIssue(issue, idx))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-zinc-700 bg-black/20 flex justify-end gap-2">
          <button
            type="button"
            onClick={onRerun}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-700"
          >
            ↻ Re-run validator
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-cyan-500 text-black font-medium rounded text-sm hover:bg-cyan-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
