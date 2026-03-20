'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminReplyPanel } from '../support/AdminReplyPanel'
import { BugReportButton } from '@/components/tester/BugReportButton'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BugReportRow {
  id: string
  user_id: string | null
  email: string
  status: string
  category: string | null
  assigned_to: string | null
  assignee_id: string | null
  created_at: string
  subject: string | null
  importance: string | null
  priority: string | null
  bug_number: number | null
  bug_category: string | null
  messages: {
    id: string
    request_id: string
    sender_role: string
    message: string
    created_at: string
    attachments: any[]
  }[]
}

export interface AdminUser {
  id: string
  name: string
  email?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
  info_needed: 'bg-purple-900/40 text-purple-400 border-purple-800',
  dupe:        'bg-zinc-700/60 text-zinc-400 border-zinc-600',
  reopened:    'bg-orange-900/40 text-orange-400 border-orange-800',
}

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'info_needed', label: 'Info Needed' },
  { value: 'reopened',    label: 'Reopened' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
  { value: 'dupe',        label: 'Duplicate' },
]

const PRIORITY_STYLES: Record<string, string> = {
  low:      'text-zinc-400',
  medium:   'text-amber-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
}

const PRIORITY_OPTIONS = [
  { value: '',         label: '—' },
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const IMPORTANCE_STYLES: Record<string, string> = {
  low:    'bg-zinc-700/60 text-zinc-300 border-zinc-600',
  medium: 'bg-amber-900/40 text-amber-400 border-amber-800',
  high:   'bg-red-900/40 text-red-400 border-red-800',
}

const CATEGORY_LABELS: Record<string, string> = {
  login_auth:         'Login / Auth',
  account_profile:    'Account / Profile',
  dashboard_reports:  'Dashboard / Reports',
  payments_credits:   'Payments / Credits',
  pdf_report_content: 'PDF / Report Content',
  navigation_ui:      'Navigation / UI',
  other:              'Other',
}

// Column order: Bug # | Status | Priority | Severity | Assigned To | Category | Subject | Reported By | Date | 📎
const GRID = 'grid-cols-[56px_105px_80px_72px_130px_120px_1fr_160px_115px_28px]'

const SORT_KEY = 'bug-reports-sort'
const DEFAULT_SORT = { col: 'created_at', dir: 'desc' as const }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: '2-digit',
    hour: 'numeric', minute: '2-digit',
  })
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-0.5 text-[10px] ${active ? 'text-zinc-300' : 'text-zinc-700'}`}>
      {active ? (dir === 'asc' ? '▲' : '▼') : '▲'}
    </span>
  )
}

// ─── Inline custom dropdowns ──────────────────────────────────────────────────

function InlinePriorityDropdown({
  requestId,
  value,
  onChange,
  canEdit,
  onSaved,
}: {
  requestId: string
  value: string | null
  onChange: (id: string, priority: string | null) => void
  canEdit: boolean
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const label = value ? PRIORITY_OPTIONS.find(o => o.value === value)?.label ?? value : '—'
  const colorClass = value ? PRIORITY_STYLES[value] ?? 'text-zinc-400' : 'text-zinc-600'

  if (!canEdit) {
    return (
      <span className={`text-xs font-medium capitalize ${colorClass}`}>{label}</span>
    )
  }

  async function handleSelect(next: string | null) {
    setOpen(false)
    setSaving(true)
    await fetch(`/api/admin/support/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: next }),
    })
    setSaving(false)
    onChange(requestId, next)
    onSaved()
  }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        disabled={saving}
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-60 ${colorClass} hover:opacity-80`}
      >
        <span>{saving ? '…' : label}</span>
        <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-28 bg-[#2a2a2a] border border-primary/40 rounded-lg shadow-xl z-50 overflow-hidden">
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value || null)}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-primary/20 transition-colors ${
                (value ?? '') === opt.value
                  ? 'text-primary'
                  : opt.value ? PRIORITY_STYLES[opt.value] ?? 'text-white' : 'text-zinc-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InlineStatusDropdown({
  requestId,
  value,
  onChange,
  canEdit,
  onSaved,
}: {
  requestId: string
  value: string
  onChange: (id: string, status: string) => void
  canEdit: boolean
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const label = STATUS_OPTIONS.find(o => o.value === value)?.label ?? value.replace(/_/g, ' ')
  const badgeClass = STATUS_STYLES[value] ?? STATUS_STYLES.open

  const badge = (
    <span className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${badgeClass}`}>
      {label}
    </span>
  )

  if (!canEdit) return badge

  async function handleSelect(next: string) {
    setOpen(false)
    setSaving(true)
    await fetch(`/api/admin/support/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setSaving(false)
    onChange(requestId, next)
    onSaved()
  }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        disabled={saving}
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border capitalize ${badgeClass} hover:opacity-80 transition-opacity disabled:opacity-50`}
      >
        <span>{saving ? '…' : label}</span>
        <svg className="w-2 h-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-[#2a2a2a] border border-primary/40 rounded-lg shadow-xl z-50 overflow-hidden">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-primary/20 transition-colors ${
                value === opt.value ? 'text-primary' : 'text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BugReportsTable({
  initialRows,
  adminUsers,
  actorRole,
  actorUserId,
  statusFilter,
  assigneeFilter,
}: {
  initialRows: BugReportRow[]
  adminUsers: AdminUser[]
  actorRole: string
  actorUserId: string
  statusFilter: string
  assigneeFilter: string
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Sort state — persisted in localStorage
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>(() => {
    if (typeof window === 'undefined') return DEFAULT_SORT
    try {
      const saved = localStorage.getItem(SORT_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_SORT
  })

  const canEdit = ['superadmin', 'admin', 'support'].includes(actorRole)

  // Build assignee name lookup
  const assigneeById: Record<string, string> = {}
  for (const u of adminUsers) {
    assigneeById[u.id] = u.name ?? u.id
  }

  function handleSort(col: string) {
    setSort(prev => {
      const next = prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' as const : 'asc' as const }
        : { col, dir: 'desc' as const }
      try { localStorage.setItem(SORT_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function resetSort() {
    setSort(DEFAULT_SORT)
    try { localStorage.removeItem(SORT_KEY) } catch {}
  }

  function handlePriorityChange(id: string, priority: string | null) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, priority } : r))
  }

  function handleStatusChange(id: string, status: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleSubmitDone = useCallback(() => {
    setModalOpen(false)
    router.refresh()
  }, [router])

  function buildFilter(s: string, a?: string) {
    const p = new URLSearchParams()
    if (s !== 'open') p.set('status', s)
    if (a && a !== 'all') p.set('assignee', a)
    const qs = p.toString()
    return `/admin/bug-reports${qs ? `?${qs}` : ''}`
  }

  // Sort rows
  const sortedRows = useMemo(() => {
    const PRIORITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    const IMPORTANCE_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 }
    return [...rows].sort((a, b) => {
      let va: any, vb: any
      switch (sort.col) {
        case 'bug_number':  va = a.bug_number ?? 0;                        vb = b.bug_number ?? 0;           break
        case 'status':      va = a.status;                                  vb = b.status;                    break
        case 'priority':    va = PRIORITY_ORDER[a.priority ?? ''] ?? 0;    vb = PRIORITY_ORDER[b.priority ?? ''] ?? 0; break
        case 'importance':  va = IMPORTANCE_ORDER[a.importance ?? ''] ?? 0; vb = IMPORTANCE_ORDER[b.importance ?? ''] ?? 0; break
        default:            va = a.created_at;                              vb = b.created_at;                break
      }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, sort])

  const isDefaultSort = sort.col === DEFAULT_SORT.col && sort.dir === DEFAULT_SORT.dir

  // Status filter tab definitions
  const statusTabs = [
    { key: 'open',        label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'info_needed', label: 'Info Needed' },
    { key: 'reopened',    label: 'Reopened' },
    { key: 'resolved',    label: 'Resolved' },
    { key: 'closed',      label: 'Closed' },
    { key: 'dupe',        label: 'Duplicate' },
    { key: 'all',         label: 'All' },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bug Reports</h1>
          <p className="text-gray-400 text-sm mt-1">{rows.length} shown</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Submit Bug Report
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {statusTabs.map(({ key, label }) => (
          <a
            key={key}
            href={buildFilter(key, assigneeFilter !== 'all' ? assigneeFilter : undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${statusFilter === key
                ? 'bg-primary text-white'
                : 'border border-primary/20 text-gray-400 hover:text-white'}`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Assignee filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { key: 'all',        label: 'All Reports' },
          { key: 'mine',       label: 'Mine' },
          { key: 'unassigned', label: 'Unassigned' },
        ].map(({ key, label }) => (
          <a
            key={key}
            href={buildFilter(statusFilter, key !== 'all' ? key : undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${assigneeFilter === key
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'border border-gray-800 text-gray-500 hover:text-white'}`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Sort reset */}
      {!isDefaultSort && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            Sorted by {sort.col.replace('_', ' ')} ({sort.dir})
          </span>
          <button
            onClick={resetSort}
            className="text-xs text-primary hover:underline"
          >
            Reset sort
          </button>
        </div>
      )}

      {/* Table */}
      {!sortedRows.length ? (
        <p className="text-gray-500 text-sm">No bug reports found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <div className="min-w-[900px] overflow-hidden">
          {/* Column headers */}
          <div className={`grid ${GRID} gap-x-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-medium text-zinc-500 uppercase tracking-wide`}>
            {/* Bug # — sortable */}
            <button type="button" onClick={() => handleSort('bug_number')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
              Bug # <SortIcon active={sort.col === 'bug_number'} dir={sort.dir} />
            </button>
            {/* Status — sortable */}
            <button type="button" onClick={() => handleSort('status')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
              Status <SortIcon active={sort.col === 'status'} dir={sort.dir} />
            </button>
            {/* Priority — sortable */}
            <button type="button" onClick={() => handleSort('priority')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
              Priority <SortIcon active={sort.col === 'priority'} dir={sort.dir} />
            </button>
            {/* Severity — sortable */}
            <button type="button" onClick={() => handleSort('importance')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
              Severity <SortIcon active={sort.col === 'importance'} dir={sort.dir} />
            </button>
            <div>Assigned To</div>
            <div>Category</div>
            <div>Subject</div>
            <div>Reported By</div>
            {/* Date — sortable */}
            <button type="button" onClick={() => handleSort('created_at')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
              Date <SortIcon active={sort.col === 'created_at'} dir={sort.dir} />
            </button>
            {/* Attachment indicator */}
            <div />
          </div>

          {/* Rows */}
          {sortedRows.map((r) => {
            const hasAttachments = r.messages.some(m => (m.attachments?.length ?? 0) > 0)
            return (
              <div key={r.id} className="border-b border-zinc-800 last:border-0">
                {/* Main row */}
                <div
                  onClick={() => toggleExpand(r.id)}
                  className={`grid ${GRID} gap-x-3 px-4 py-3 cursor-pointer transition-colors items-center ${
                    expandedId === r.id ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  {/* Bug # */}
                  <div className="text-zinc-400 text-xs font-mono">
                    {r.bug_number ? `#${r.bug_number}` : r.id.slice(0, 6)}
                  </div>

                  {/* Status */}
                  <div>
                    <InlineStatusDropdown
                      requestId={r.id}
                      value={r.status}
                      onChange={handleStatusChange}
                      canEdit={canEdit}
                      onSaved={() => router.refresh()}
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <InlinePriorityDropdown
                      requestId={r.id}
                      value={r.priority}
                      onChange={handlePriorityChange}
                      canEdit={canEdit}
                      onSaved={() => router.refresh()}
                    />
                  </div>

                  {/* Severity (importance) */}
                  <div>
                    {r.importance ? (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${IMPORTANCE_STYLES[r.importance] ?? ''}`}>
                        {r.importance}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="text-zinc-400 text-xs truncate">
                    {r.assignee_id ? assigneeById[r.assignee_id] ?? r.assignee_id : 'Unassigned'}
                  </div>

                  {/* Category */}
                  <div className="text-zinc-400 text-xs truncate">
                    {r.bug_category ? CATEGORY_LABELS[r.bug_category] ?? r.bug_category : '—'}
                  </div>

                  {/* Subject */}
                  <div className="min-w-0">
                    <span className="text-white text-xs truncate block">
                      {r.subject ?? r.messages[0]?.message?.slice(0, 60) ?? '(no subject)'}
                    </span>
                  </div>

                  {/* Reported By */}
                  <div className="min-w-0">
                    {r.user_id ? (
                      <Link
                        href={`/admin/users/${r.user_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-primary text-xs hover:underline truncate block"
                      >
                        {r.email}
                      </Link>
                    ) : (
                      <span className="text-zinc-400 text-xs truncate block">{r.email}</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-zinc-500 text-xs whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </div>

                  {/* Attachment indicator */}
                  <div className="flex justify-center">
                    {hasAttachments && (
                      <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Expanded thread */}
                {expandedId === r.id && (
                  <div className="px-6 pb-6 bg-zinc-800/20 border-t border-zinc-800">
                    <div className="pt-4">
                      <AdminReplyPanel
                        requestId={r.id}
                        userEmail={r.email}
                        status={r.status}
                        category={r.category ?? undefined}
                        messages={r.messages as any}
                        assignedTo={r.assigned_to}
                        assigneeId={r.assignee_id}
                        adminUsers={adminUsers as { id: string; name: string }[]}
                        actorRole={actorRole}
                        actorUserId={actorUserId}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        </div>
      )}

      {/* BugReportButton — floating button stays visible; modal also controlled by Submit button */}
      <BugReportButton
        forceOpen={modalOpen}
        onClose={handleSubmitDone}
      />
    </>
  )
}
