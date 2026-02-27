'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ============================================================================
// Types
// ============================================================================

interface Report {
  id: string
  report_type: string
  status: string
  created_at: string
  pdf_url: string | null
  expires_at: string | null
}

interface ReportListProps {
  initialReports: Report[]
}

// ============================================================================
// Constants
// ============================================================================

const REPORT_TYPE_LABELS: Record<string, string> = {
  h2h:               'Head to Head Analysis',
  t3c:               'Top 3 Competitors',
  cp:                'Competitive Position',
  ai_seo:            'AI SEO Optimizer',
  landing_page:      'Landing Page Optimizer',
  keyword_research:  'Keyword Research',
  seo_audit:         'SEO Audit',
  seo_comprehensive: 'SEO Comprehensive',
  multi_page:        'Multi-Page Audit',
}

const STATUS_STYLES: Record<string, string> = {
  pending:             'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  processing:          'bg-blue-900/40 text-blue-400 border-blue-800',
  complete:            'bg-green-900/40 text-green-400 border-green-800',
  failed:              'bg-red-900/40 text-red-400 border-red-800',
  failed_site_blocked: 'bg-red-900/40 text-red-400 border-red-800',
}

const POLL_INTERVAL_MS = 5000

// ============================================================================
// Helper: days remaining before expiry
// ============================================================================

function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

// ============================================================================
// ReportCard
// ============================================================================

function ReportCard({ report, onDelete }: { report: Report; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const days = daysRemaining(report.expires_at)
  const isExpiringSoon = days !== null && days <= 7 && days > 0
  const isExpired = days !== null && days === 0
  const isActive = report.status === 'pending' || report.status === 'processing'

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/reports/${report.id}`, { method: 'DELETE' })
      if (res.ok) onDelete(report.id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-dark-700 border border-primary/20 rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-medium">
              {REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}
            </p>
            {days !== null && days > 7 && (
              <span suppressHydrationWarning className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                {days}d left
              </span>
            )}
            {isExpiringSoon && !isExpired && (
              <span suppressHydrationWarning className="text-xs px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-400 border border-orange-800">
                {days}d left
              </span>
            )}
            {isExpired && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                Expired
              </span>
            )}
          </div>
          <p suppressHydrationWarning className="text-gray-500 text-sm">
            {new Date(report.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Spinner for in-progress */}
        {isActive && (
          <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}

        <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${STATUS_STYLES[report.status] ?? STATUS_STYLES.pending}`}>
          {report.status === 'pending' ? 'queued' : report.status === 'failed_site_blocked' ? 'site blocked' : report.status}
        </span>

        {report.status === 'complete' && !isExpired && (
          <>
            <Link
              href={`/reports/${report.id}`}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap"
            >
              View Report →
            </Link>
            {report.pdf_url && (
              <a
                href={report.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                PDF ↓
              </a>
            )}
          </>
        )}

        {report.status === 'failed' && (
          <span className="text-sm text-red-400">Check email or retry</span>
        )}

        {report.status === 'failed_site_blocked' && (
          <span className="text-sm text-red-400">Site blocked — check email</span>
        )}

        {/* Delete control */}
        {confirming ? (
          <span className="flex items-center gap-2 text-sm">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes'}
            </button>
            <span className="text-gray-600">/</span>
            <button
              onClick={() => setConfirming(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              No
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            title="Delete report"
            className="text-gray-600 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ReportList — polls for pending/processing reports
// ============================================================================

export default function ReportList({ initialReports }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const pendingIds = reports
      .filter(r => r.status === 'pending' || r.status === 'processing')
      .map(r => r.id)

    if (pendingIds.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // Poll each pending/processing report
    const poll = async () => {
      const updates = await Promise.allSettled(
        pendingIds.map(id =>
          fetch(`/api/reports/${id}/status`).then(r => r.json())
        )
      )

      setReports(prev => {
        let changed = false
        const next = prev.map((report, i) => {
          const idx = pendingIds.indexOf(report.id)
          if (idx === -1) return report
          const result = updates[idx]
          if (result.status !== 'fulfilled') return report
          const fresh = result.value
          if (fresh.status !== report.status || fresh.pdf_url !== report.pdf_url) {
            changed = true
            return { ...report, status: fresh.status, pdf_url: fresh.pdf_url ?? report.pdf_url }
          }
          return report
        })
        return changed ? next : prev
      })
    }

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  // Re-run when pending IDs change (a report completes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports.filter(r => r.status === 'pending' || r.status === 'processing').map(r => r.id).join(',')])

  function handleDelete(id: string) {
    setReports(prev => prev.filter(r => r.id !== id))
  }

  async function handleDeleteAll() {
    setDeletingAll(true)
    try {
      const res = await fetch('/api/reports/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) setReports([])
    } finally {
      setDeletingAll(false)
      setConfirmDeleteAll(false)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="bg-dark-700 border border-primary/20 rounded-2xl p-12 text-center">
        <p className="text-gray-400 mb-4">No reports yet. Run your first one free.</p>
        <a
          href="/tools"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          Get started
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Delete all row */}
      <div className="flex justify-end">
        {confirmDeleteAll ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Delete all {reports.length} reports?</span>
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
            >
              {deletingAll ? 'Deleting…' : 'Yes, delete all'}
            </button>
            <span className="text-gray-600">/</span>
            <button
              onClick={() => setConfirmDeleteAll(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDeleteAll(true)}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            Delete all reports
          </button>
        )}
      </div>

      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onDelete={handleDelete} />
      ))}
    </div>
  )
}
