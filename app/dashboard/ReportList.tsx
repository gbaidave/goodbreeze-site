'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  input_data: Record<string, unknown> | null
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
  business_presence_report: 'Business Presence Report',
}

const REPORT_TYPE_URLS: Record<string, string> = {
  landing_page:      '/reports/landing-page-optimizer',
  seo_audit:         '/reports/seo-audit',
  seo_comprehensive: '/reports/seo-comprehensive',
  ai_seo:            '/reports/ai-seo',
  keyword_research:  '/reports/keyword-research',
  h2h:               '/reports/competitive-analyzer',
  t3c:               '/reports/competitive-analyzer',
  cp:                '/reports/competitive-analyzer',
  business_presence_report: '/reports/business-presence',
}

const STATUS_STYLES: Record<string, string> = {
  pending:             'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  processing:          'bg-blue-900/40 text-blue-400 border-blue-800',
  complete:            'bg-green-900/40 text-green-400 border-green-800',
  failed:              'bg-red-900/40 text-red-400 border-red-800',
  failed_site_blocked: 'bg-red-900/40 text-red-400 border-red-800',
}

function getReportSubtitle(reportType: string, inputData: Record<string, unknown> | null): string | null {
  if (!inputData) return null
  function domain(u: string | undefined) {
    if (!u) return ''
    try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u }
  }
  const url = inputData.url as string | undefined
  const targetWebsite = inputData.targetWebsite as string | undefined
  const competitor1Website = inputData.competitor1Website as string | undefined
  const competitor1 = inputData.competitor1 as string | undefined
  const company = inputData.company as string | undefined
  const focusKeyword = inputData.focusKeyword as string | undefined
  switch (reportType) {
    case 'RPT-H2H': {
      const target = domain(targetWebsite) || company
      const comp = competitor1 || domain(competitor1Website)
      return target && comp ? `${target} vs ${comp}` : target || null
    }
    case 'RPT-T3C':
    case 'RPT-CP':
      return domain(targetWebsite) || company || null
    case 'RPT-KR':
      return focusKeyword || domain(url) || null
    default:
      return domain(url) || company || null
  }
}

const POLL_INTERVAL_MS = 5000
const TIMEOUT_THRESHOLD_MS = 10 * 60 * 1000 // 10 minutes

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
  const [deleteError, setDeleteError] = useState('')
  const [timeLabel, setTimeLabel] = useState(() =>
    new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  )
  useEffect(() => {
    setTimeLabel(new Date(report.created_at).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }))
  }, [report.created_at])

  const days = daysRemaining(report.expires_at)
  const isExpiringSoon = days !== null && days <= 7 && days > 0
  const isExpired = days !== null && days === 0
  const isActive = report.status === 'pending' || report.status === 'processing'
  const isFailed = report.status === 'failed' || report.status === 'failed_site_blocked'

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/reports/${report.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete(report.id)
        window.dispatchEvent(new Event('credits-changed'))
      } else {
        const data = await res.json().catch(() => ({}))
        setDeleteError(data.error ?? 'Delete failed. Try again.')
        setConfirming(false)
      }
    } catch {
      setDeleteError('Network error. Try again.')
      setConfirming(false)
    } finally {
      setDeleting(false)
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
            {(() => {
              const sub = getReportSubtitle(report.report_type, report.input_data)
              return sub ? <p className="text-gray-500 text-xs">{sub}</p> : null
            })()}
            {days !== null && days > 7 && (
              <span suppressHydrationWarning className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                Available {days} more days
              </span>
            )}
            {isExpiringSoon && !isExpired && (
              <span suppressHydrationWarning className="text-xs px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-400 border border-orange-800">
                Available {days} more day{days !== 1 ? 's' : ''}
              </span>
            )}
            {isExpired && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                Expired
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{timeLabel}</p>
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
        {report.status === 'failed_site_blocked' && !confirming && REPORT_TYPE_URLS[report.report_type] && (
          <a
            href={REPORT_TYPE_URLS[report.report_type]}
            className="text-xs text-primary hover:text-primary/80 underline transition-colors whitespace-nowrap"
          >
            Try a different URL →
          </a>
        )}
        {report.status === 'failed' && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
          >
            Cancel for Credit Refund?
          </button>
        )}

        <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${STATUS_STYLES[report.status] ?? STATUS_STYLES.pending}`}>
          {report.status === 'pending' ? 'processing' : report.status === 'failed_site_blocked' ? 'site blocked' : report.status}
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
                href={`/api/reports/${report.id}/download`}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                Download PDF
              </a>
            )}
          </>
        )}

        {/* Delete error */}
        {deleteError && (
          <span className="text-xs text-red-400">{deleteError}</span>
        )}

        {/* Delete control */}
        {confirming ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{report.status === 'failed' ? 'Cancel for Credit Refund?' : 'Delete this report?'}</span>
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
// Status grouping helpers
// ============================================================================

type StatusGroup = 'all' | 'processing' | 'complete' | 'failed'

function getStatusGroup(status: string): StatusGroup {
  if (status === 'pending' || status === 'processing') return 'processing'
  if (status === 'complete') return 'complete'
  if (status === 'failed' || status === 'failed_site_blocked') return 'failed'
  return 'processing' // fallback
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

// ============================================================================
// ReportList — polls for pending/processing reports + filter/paginate
// ============================================================================

export default function ReportList({ initialReports }: ReportListProps) {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [statusFilter, setStatusFilter] = useState<StatusGroup>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [perPage, setPerPage] = useState(10)
  const [perPageOpen, setPerPageOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const perPageRef = useRef<HTMLDivElement>(null)
  // Track IDs we've already called PATCH /timeout on to avoid duplicate calls
  const timedOutIds = useRef<Set<string>>(new Set())

  // Close per-page dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (perPageRef.current && !perPageRef.current.contains(e.target as Node)) {
        setPerPageOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Polling ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'processing')
    const pendingIds = pendingReports.map(r => r.id)

    if (pendingIds.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const poll = async () => {
      // Fire timeout PATCH for any reports that have exceeded 10 minutes
      const now = Date.now()
      for (const report of pendingReports) {
        if (
          !timedOutIds.current.has(report.id) &&
          now - new Date(report.created_at).getTime() > TIMEOUT_THRESHOLD_MS
        ) {
          timedOutIds.current.add(report.id)
          fetch(`/api/reports/${report.id}`, { method: 'PATCH' }).catch(() => {
            timedOutIds.current.delete(report.id)
          })
        }
      }

      const updates = await Promise.allSettled(
        pendingIds.map(id =>
          fetch(`/api/reports/${id}/status`).then(r => r.json())
        )
      )

      setReports(prev => {
        let changed = false
        const next = prev.map((report) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports.filter(r => r.status === 'pending' || r.status === 'processing').map(r => r.id).join(',')])

  // ── Counts for tabs ────────────────────────────────────────────────────────
  const counts: Record<StatusGroup, number> = {
    all: reports.length,
    processing: reports.filter(r => getStatusGroup(r.status) === 'processing').length,
    complete: reports.filter(r => r.status === 'complete').length,
    failed: reports.filter(r => getStatusGroup(r.status) === 'failed').length,
  }

  // Unique report types present in the full list
  const availableTypes = Array.from(new Set(reports.map(r => r.report_type))).sort()

  // ── Filtering + pagination ─────────────────────────────────────────────────
  const filtered = reports.filter(r => {
    const statusMatch = statusFilter === 'all' || getStatusGroup(r.status) === statusFilter
    const typeMatch = typeFilter === 'all' || r.report_type === typeFilter
    return statusMatch && typeMatch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const pageReports = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  function handleStatusFilter(s: StatusGroup) {
    setStatusFilter(s)
    setPage(1)
  }

  function handleTypeFilter(t: string) {
    setTypeFilter(t)
    setPage(1)
  }

  // ── Deletion ───────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    setReports(prev => prev.filter(r => r.id !== id))
    router.refresh()
  }

  async function handleDeleteAll() {
    setDeletingAll(true)
    try {
      const res = await fetch('/api/reports/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        setReports([])
        window.dispatchEvent(new Event('credits-changed'))
      }
    } finally {
      setDeletingAll(false)
      setConfirmDeleteAll(false)
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (reports.length === 0) {
    return (
      <div className="bg-dark-700 border border-primary/20 rounded-2xl p-12 text-center">
        <p className="text-gray-400 mb-4">No reports yet. Run your first one free.</p>
        <a
          href="/reports"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          Get started
        </a>
      </div>
    )
  }

  const TABS: { key: StatusGroup; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' },
    { key: 'failed', label: 'Failed' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map(tab => {
            const active = statusFilter === tab.key
            const count = counts[tab.key]
            if (tab.key !== 'all' && count === 0) return null
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-gray-400 hover:text-gray-200 border border-transparent hover:border-gray-700'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-primary/30 text-primary' : 'bg-zinc-800 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right-side controls: type filter + per-page */}
        <div className="flex items-center gap-2">
          {availableTypes.length > 1 && (
            <select
              value={typeFilter}
              onChange={e => handleTypeFilter(e.target.value)}
              className="text-sm bg-zinc-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 [color-scheme:dark] focus:outline-none focus:border-primary/50"
            >
              <option value="all">All report types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {REPORT_TYPE_LABELS[type] ?? type}
                </option>
              ))}
            </select>
          )}

          {/* Per-page selector — styled like nav Services dropdown */}
          <div ref={perPageRef} className="relative">
            <button
              onClick={() => setPerPageOpen(o => !o)}
              className="flex items-center gap-1.5 text-sm bg-zinc-900 border border-gray-700 text-gray-300 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              {perPage} per page
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {perPageOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-[#2a2a2a] border-2 border-primary/50 rounded-lg shadow-2xl shadow-primary/30 overflow-hidden z-20">
                {PAGE_SIZE_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => { setPerPage(n); setPage(1); setPerPageOpen(false) }}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      n === perPage
                        ? 'bg-primary/30 text-white'
                        : 'text-white hover:bg-primary/30 hover:text-white'
                    }`}
                  >
                    {n} per page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report cards */}
      {filtered.length === 0 ? (
        <div className="bg-dark-700 border border-primary/20 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm">No reports match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageReports.map((report) => (
            <ReportCard key={report.id} report={report} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination + delete all */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-600">
            {filtered.length === 1
              ? '1 report'
              : `${(safePage - 1) * perPage + 1}–${Math.min(safePage * perPage, filtered.length)} of ${filtered.length} reports`}
          </p>

          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-xs text-gray-600">{safePage} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}

            {confirmDeleteAll ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Delete all {reports.length}?</span>
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                >
                  {deletingAll ? 'Deleting…' : 'Yes'}
                </button>
                <span className="text-gray-600">/</span>
                <button onClick={() => setConfirmDeleteAll(false)} className="text-gray-400 hover:text-gray-300">
                  No
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                className="text-xs text-gray-700 hover:text-red-400 transition-colors"
              >
                Delete all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
