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

const GRID = 'grid-cols-[56px_105px_80px_72px_130px_120px_1fr_160px_115px_28px]'
const SORT_KEY      = 'bug-reports-sort'
const FILTERS_KEY   = 'bug-reports-filters'
const PAGE_SIZE_KEY = 'bug-reports-pagesize'
const DEFAULT_SORT  = { col: 'created_at', dir: 'desc' as const }
const DEFAULT_FILTERS = {
  statuses:   [] as string[],
  priorities: [] as string[],
  severities: [] as string[],
  assignees:  [] as string[],
  categories: [] as string[],
  reporters:  [] as string[],
  dateFrom:   '',
  dateTo:     '',
}
const DEFAULT_PAGE_SIZE = 25

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

// ─── MultiSelectDropdown ──────────────────────────────────────────────────────

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value])
  }

  const displayLabel = selected.length === 0 ? label
    : selected.length === 1 ? (options.find(o => o.value === selected[0])?.label ?? selected[0])
    : `${label} (${selected.length})`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
          selected.length > 0
            ? 'border-primary/60 bg-primary/10 text-primary'
            : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-600'
        }`}
      >
        <span>{displayLabel}</span>
        <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[150px] bg-[#2a2a2a] border border-primary/40 rounded-lg shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs hover:bg-primary/20 transition-colors text-white"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                selected.includes(opt.value) ? 'bg-primary border-primary' : 'border-zinc-600'
              }`}>
                {selected.includes(opt.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── InlineAssigneeDropdown ───────────────────────────────────────────────────

function InlineAssigneeDropdown({
  requestId,
  assigneeId,
  adminUsers,
  canEdit,
  onSaved,
}: {
  requestId: string
  assigneeId: string | null
  adminUsers: AdminUser[]
  canEdit: boolean
  onSaved: (id: string, assigneeId: string | null) => void
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

  const label = assigneeId
    ? (adminUsers.find(u => u.id === assigneeId)?.name ?? assigneeId)
    : 'Unassigned'

  if (!canEdit) {
    return <span className="text-zinc-400 text-xs truncate block">{label}</span>
  }

  async function handleSelect(newId: string | null) {
    setOpen(false)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/support/${requestId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee_id: newId }),
      })
      if (res.ok) onSaved(requestId, newId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={saving}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-60 max-w-[120px]"
      >
        <span className="truncate">{saving ? '…' : label}</span>
        <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-[#2a2a2a] border border-primary/40 rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="block w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:bg-primary/20 hover:text-white transition-colors"
          >
            Unassigned
          </button>
          {adminUsers.map(u => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelect(u.id)}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-primary/20 transition-colors ${
                u.id === assigneeId ? 'text-primary' : 'text-white'
              }`}
            >
              {u.name ?? u.email ?? u.id}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── InlinePriorityDropdown ───────────────────────────────────────────────────

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
    return <span className={`text-xs font-medium capitalize ${colorClass}`}>{label}</span>
  }

  async function handleSelect(next: string | null) {
    setOpen(false)
    const prev = value
    setSaving(true)
    onChange(requestId, next)  // optimistic update
    const res = await fetch(`/api/admin/support/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: next }),
    })
    setSaving(false)
    if (!res.ok) {
      onChange(requestId, prev)  // revert on failure
    } else {
      onSaved()
    }
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

// ─── InlineStatusDropdown ─────────────────────────────────────────────────────

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
    const prev = value
    setSaving(true)
    onChange(requestId, next)  // optimistic update
    const res = await fetch(`/api/admin/support/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setSaving(false)
    if (!res.ok) {
      onChange(requestId, prev)  // revert on failure
    } else {
      onSaved()
    }
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
}: {
  initialRows: BugReportRow[]
  adminUsers: AdminUser[]
  actorRole: string
  actorUserId: string
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Sync rows when server re-fetches (after router.refresh())
  useEffect(() => { setRows(initialRows) }, [initialRows])

  // Sort — persisted in localStorage
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>(() => {
    if (typeof window === 'undefined') return DEFAULT_SORT
    try {
      const saved = localStorage.getItem(SORT_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_SORT
  })

  // Filter state — persisted in localStorage
  const [filters, setFilters] = useState<typeof DEFAULT_FILTERS>(() => {
    if (typeof window === 'undefined') return DEFAULT_FILTERS
    try {
      const saved = localStorage.getItem(FILTERS_KEY)
      if (saved) return { ...DEFAULT_FILTERS, ...JSON.parse(saved) }
    } catch {}
    return DEFAULT_FILTERS
  })

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_PAGE_SIZE
    try {
      const saved = localStorage.getItem(PAGE_SIZE_KEY)
      if (saved) return parseInt(saved, 10) || DEFAULT_PAGE_SIZE
    } catch {}
    return DEFAULT_PAGE_SIZE
  })

  const canEdit = ['superadmin', 'admin', 'support'].includes(actorRole)
  // Testers can reassign their own tickets — inline dropdown handles the API-level check
  const canAssignInLine = ['superadmin', 'admin', 'support', 'tester'].includes(actorRole)

  const assigneeById = useMemo(() => {
    const m: Record<string, string> = {}
    for (const u of adminUsers) m[u.id] = u.name ?? u.id
    return m
  }, [adminUsers])

  const reporterOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { value: string; label: string }[] = []
    for (const r of rows) {
      if (!seen.has(r.email)) {
        seen.add(r.email)
        opts.push({ value: r.email, label: r.email })
      }
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label))
  }, [rows])

  function saveFilters(next: typeof DEFAULT_FILTERS) {
    setFilters(next)
    setPage(1)
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify(next)) } catch {}
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

  function handlePriorityChange(id: string, priority: string | null) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, priority } : r))
  }

  function handleStatusChange(id: string, status: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  function handleAssigneeChange(id: string, assigneeId: string | null) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, assignee_id: assigneeId } : r))
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleSubmitDone = useCallback(() => {
    setModalOpen(false)
    router.refresh()
  }, [router])

  // Filter + sort + paginate
  const filteredRows = useMemo(() => {
    const PRIORITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    const IMPORTANCE_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 }
    const needle = searchText.trim().toLowerCase()

    const f = rows.filter(r => {
      if (filters.statuses.length && !filters.statuses.includes(r.status)) return false
      if (filters.priorities.length && !filters.priorities.includes(r.priority ?? '')) return false
      if (filters.severities.length && !filters.severities.includes(r.importance ?? '')) return false
      if (filters.assignees.length && !filters.assignees.includes(r.assignee_id ?? '')) return false
      if (filters.categories.length && !filters.categories.includes(r.bug_category ?? '')) return false
      if (filters.reporters.length && !filters.reporters.includes(r.email)) return false
      if (filters.dateFrom && r.created_at < filters.dateFrom) return false
      if (filters.dateTo && r.created_at > filters.dateTo + 'T23:59:59') return false
      if (needle) {
        const subjectMatch = (r.subject ?? '').toLowerCase().includes(needle)
        const msgMatch = r.messages.some(m => m.message.toLowerCase().includes(needle))
        if (!subjectMatch && !msgMatch) return false
      }
      return true
    })

    return f.sort((a, b) => {
      let va: any, vb: any
      switch (sort.col) {
        case 'bug_number':   va = a.bug_number ?? 0;                           vb = b.bug_number ?? 0;           break
        case 'status':       va = a.status;                                     vb = b.status;                    break
        case 'priority':     va = PRIORITY_ORDER[a.priority ?? ''] ?? 0;       vb = PRIORITY_ORDER[b.priority ?? ''] ?? 0; break
        case 'importance':   va = IMPORTANCE_ORDER[a.importance ?? ''] ?? 0;   vb = IMPORTANCE_ORDER[b.importance ?? ''] ?? 0; break
        case 'assigned_to':  va = assigneeById[a.assignee_id ?? ''] ?? 'zzz';  vb = assigneeById[b.assignee_id ?? ''] ?? 'zzz'; break
        case 'bug_category': va = a.bug_category ?? 'zzz';                     vb = b.bug_category ?? 'zzz';     break
        case 'email':        va = a.email;                                      vb = b.email;                     break
        default:             va = a.created_at;                                 vb = b.created_at;                break
      }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, filters, sort, searchText, assigneeById])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  const hasActiveFilters = filters.statuses.length || filters.priorities.length ||
    filters.severities.length || filters.assignees.length || filters.categories.length ||
    filters.reporters.length || filters.dateFrom || filters.dateTo || searchText.trim()

  function resetAll() {
    setSearchText('')
    saveFilters(DEFAULT_FILTERS)
    setSort(DEFAULT_SORT)
    try { localStorage.removeItem(SORT_KEY) } catch {}
  }

  const assigneeFilterOptions = [
    { value: '', label: 'Unassigned' },
    ...adminUsers.map(u => ({ value: u.id, label: u.name ?? u.email ?? u.id })),
  ]

  const pageSizeOptions = [5, 10, 25, 50, 100]

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bug Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredRows.length !== rows.length
              ? `${filteredRows.length} of ${rows.length} shown`
              : `${rows.length} total`}
          </p>
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

      {/* Search */}
      <div className="mb-3">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPage(1) }}
            placeholder="Search subject or description…"
            className="w-full pl-8 pr-8 py-1.5 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg focus:outline-none focus:border-primary/60 placeholder-zinc-600"
          />
          {searchText && (
            <button
              onClick={() => { setSearchText(''); setPage(1) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <MultiSelectDropdown
          label="Status"
          options={STATUS_OPTIONS}
          selected={filters.statuses}
          onChange={v => saveFilters({ ...filters, statuses: v })}
        />
        <MultiSelectDropdown
          label="Priority"
          options={PRIORITY_OPTIONS.filter(o => o.value)}
          selected={filters.priorities}
          onChange={v => saveFilters({ ...filters, priorities: v })}
        />
        <MultiSelectDropdown
          label="Severity"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          selected={filters.severities}
          onChange={v => saveFilters({ ...filters, severities: v })}
        />
        <MultiSelectDropdown
          label="Assigned To"
          options={assigneeFilterOptions}
          selected={filters.assignees}
          onChange={v => saveFilters({ ...filters, assignees: v })}
        />
        <MultiSelectDropdown
          label="Category"
          options={Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          selected={filters.categories}
          onChange={v => saveFilters({ ...filters, categories: v })}
        />
        <MultiSelectDropdown
          label="Reported By"
          options={reporterOptions}
          selected={filters.reporters}
          onChange={v => saveFilters({ ...filters, reporters: v })}
        />
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => saveFilters({ ...filters, dateFrom: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary/60"
          />
          <span className="text-zinc-600 text-xs">–</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => saveFilters({ ...filters, dateTo: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary/60"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Table */}
      {!filteredRows.length ? (
        <p className="text-gray-500 text-sm">
          {rows.length === 0 ? 'No bug reports yet.' : 'No bug reports match your filters.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <div className="min-w-[900px] overflow-hidden">
              {/* Column headers */}
              <div className={`grid ${GRID} gap-x-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-medium text-zinc-500 uppercase tracking-wide`}>
                <button type="button" onClick={() => handleSort('bug_number')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Bug # <SortIcon active={sort.col === 'bug_number'} dir={sort.dir} />
                </button>
                <button type="button" onClick={() => handleSort('status')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Status <SortIcon active={sort.col === 'status'} dir={sort.dir} />
                </button>
                <button type="button" onClick={() => handleSort('priority')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Priority <SortIcon active={sort.col === 'priority'} dir={sort.dir} />
                </button>
                <button type="button" onClick={() => handleSort('importance')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Severity <SortIcon active={sort.col === 'importance'} dir={sort.dir} />
                </button>
                <button type="button" onClick={() => handleSort('assigned_to')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Assigned To <SortIcon active={sort.col === 'assigned_to'} dir={sort.dir} />
                </button>
                <button type="button" onClick={() => handleSort('bug_category')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Category <SortIcon active={sort.col === 'bug_category'} dir={sort.dir} />
                </button>
                <div>Subject</div>
                <button type="button" onClick={() => handleSort('email')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Reported By <SortIcon active={sort.col === 'email'} dir={sort.dir} />
                </button>
                <button type="button" onClick={() => handleSort('created_at')} className="flex items-center text-left hover:text-zinc-300 transition-colors">
                  Date <SortIcon active={sort.col === 'created_at'} dir={sort.dir} />
                </button>
                <div />
              </div>

              {/* Rows */}
              {pagedRows.map((r) => {
                const hasAttachments = r.messages.some(m => (m.attachments?.length ?? 0) > 0)
                return (
                  <div key={r.id} className="border-b border-zinc-800 last:border-0 overflow-visible relative">
                    <div
                      onClick={() => toggleExpand(r.id)}
                      className={`grid ${GRID} gap-x-3 px-4 py-3 cursor-pointer transition-colors items-center overflow-visible ${
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

                      {/* Severity */}
                      <div>
                        {r.importance ? (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${IMPORTANCE_STYLES[r.importance] ?? ''}`}>
                            {r.importance}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </div>

                      {/* Assigned To — inline dropdown */}
                      <div onClick={e => e.stopPropagation()}>
                        <InlineAssigneeDropdown
                          requestId={r.id}
                          assigneeId={r.assignee_id}
                          adminUsers={adminUsers}
                          canEdit={canAssignInLine}
                          onSaved={handleAssigneeChange}
                        />
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Rows per page:</span>
              <div className="flex gap-1">
                {pageSizeOptions.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setPageSize(n)
                      setPage(1)
                      try { localStorage.setItem(PAGE_SIZE_KEY, String(n)) } catch {}
                    }}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      pageSize === n
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'hover:text-zinc-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >«</button>
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >‹</button>
                <span className="px-2 py-1">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >›</button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >»</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BugReportButton */}
      <BugReportButton
        forceOpen={modalOpen}
        onClose={handleSubmitDone}
      />
    </>
  )
}
