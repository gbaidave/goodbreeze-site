'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { generateFailurePacket } from '@/lib/admin/failure-packet'
import { CustomSelect } from '@/components/ui/CustomSelect'

// ─── System Error types ────────────────────────────────────────────────────────

interface SystemError {
  id: string
  type: string
  message: string
  context: Record<string, unknown> | null
  route: string | null
  resolved: boolean
  resolved_at: string | null
  resolved_notes: string | null
  created_at: string
}

const SYSTEM_ERROR_TYPES = ['auth', 'payment', 'webhook', 'api', 'email']

// ─── Types ────────────────────────────────────────────────────────────────────

interface Failure {
  id: string
  report_type: string
  status: string
  created_at: string
  input_data: Record<string, unknown> | null
  n8n_execution_id: string | null
  admin_failure_status: string
  admin_failure_notes: string | null
  usage_type: string | null
  profiles: { name: string | null; email: string }
}

type AdminStatus = 'unresolved' | 'in_progress' | 'resolved' | 'wont_fix'

const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  unresolved: 'Unresolved',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: "Won't Fix",
}

const ADMIN_STATUS_STYLES: Record<AdminStatus, string> = {
  unresolved: 'bg-red-900/40 text-red-400 border-red-800',
  in_progress: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  resolved: 'bg-green-900/40 text-green-400 border-green-800',
  wont_fix: 'bg-gray-800 text-gray-400 border-gray-700',
}

const REPORT_TYPES: { value: string; label: string }[] = [
  { value: 'RPT-KR',    label: 'Keyword Research' },
  { value: 'RPT-AUDIT', label: 'SEO Audit' },
  { value: 'RPT-LP',    label: 'LP Optimizer' },
  { value: 'RPT-AISEO', label: 'AI SEO' },
  { value: 'RPT-COMP',  label: 'SEO Comprehensive' },
  { value: 'Head to Head',      label: 'Head to Head' },
  { value: 'Top 3 Competitors', label: 'Top 3 Competitors' },
  { value: 'Competitive Position', label: 'Competitive Position' },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminErrorsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const highlightId = searchParams.get('highlight')

  const [activeTab, setActiveTab] = useState<'failures' | 'system'>('failures')

  const [failures, setFailures] = useState<Failure[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    report_type: 'all',
    failure_type: 'all',
    date_range: '30d',
    user_email: '',
    sort: 'created_at',
    order: 'desc',
  })

  const highlightRef = useRef<HTMLTableRowElement | null>(null)

  // System errors state
  const [sysErrors, setSysErrors] = useState<SystemError[]>([])
  const [sysLoading, setSysLoading] = useState(false)
  const [sysFilters, setSysFilters] = useState({
    type: 'all',
    resolved: 'false',
    date_range: '30d',
  })

  const fetchSysErrors = useCallback(async () => {
    setSysLoading(true)
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(sysFilters).filter(([, v]) => v && v !== 'all'))
    ).toString()
    const res = await fetch(`/api/admin/system-errors${qs ? `?${qs}` : ''}`)
    const data = await res.json()
    setSysErrors(data.errors ?? [])
    setSysLoading(false)
  }, [sysFilters])

  useEffect(() => {
    if (activeTab === 'system') fetchSysErrors()
  }, [activeTab, fetchSysErrors])

  async function resolveSysError(id: string, resolved: boolean) {
    setSysErrors(prev => prev.map(e => e.id === id ? { ...e, resolved, resolved_at: resolved ? new Date().toISOString() : null } : e))
    await fetch(`/api/admin/system-errors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    })
  }

  const fetchFailures = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== 'all'))
    ).toString()
    const res = await fetch(`/api/admin/failures${qs ? `?${qs}` : ''}`)
    const data = await res.json()
    setFailures(data.failures ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchFailures() }, [fetchFailures])

  // Scroll to highlighted row after data loads
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightId, failures])

  function setFilter(key: string, value: string) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  function toggleSort(col: string) {
    setFilters(f => ({
      ...f,
      sort: col,
      order: f.sort === col && f.order === 'desc' ? 'asc' : 'desc',
    }))
  }

  const sortIndicator = (col: string) =>
    filters.sort === col ? (filters.order === 'desc' ? ' ↓' : ' ↑') : ''

  async function updateStatus(id: string, admin_failure_status: string) {
    setFailures(prev =>
      prev.map(f => f.id === id ? { ...f, admin_failure_status } : f)
    )
    await fetch(`/api/admin/failures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_failure_status }),
    })
  }

  async function updateNotes(id: string, admin_failure_notes: string) {
    setFailures(prev =>
      prev.map(f => f.id === id ? { ...f, admin_failure_notes } : f)
    )
    await fetch(`/api/admin/failures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_failure_notes }),
    })
  }

  const unresolvedCount = failures.filter(
    f => f.admin_failure_status === 'unresolved'
  ).length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Monitor</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === 'failures'
              ? (loading ? 'Loading…' : `${failures.length} results`)
              : (sysLoading ? 'Loading…' : `${sysErrors.length} results`)}
            {activeTab === 'failures' && !loading && unresolvedCount > 0 && (
              <span className="ml-2 text-red-400 font-medium">
                · {unresolvedCount} unresolved
              </span>
            )}
          </p>
        </div>
        <button
          onClick={activeTab === 'failures' ? fetchFailures : fetchSysErrors}
          className="px-4 py-2 border border-primary/20 text-gray-400 rounded-lg text-sm hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-primary/10 pb-0">
        {(['failures', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-primary text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'failures' ? 'Report Failures' : 'System Errors'}
          </button>
        ))}
      </div>

      {/* ── Report Failures tab ─────────────────────────────────────── */}
      {activeTab === 'failures' && <>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <CustomSelect
          value={filters.status}
          onChange={v => setFilter('status', v)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'unresolved', label: 'Unresolved' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'wont_fix', label: "Won't Fix" },
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />

        <CustomSelect
          value={filters.report_type}
          onChange={v => setFilter('report_type', v)}
          options={[
            { value: 'all', label: 'All report types' },
            ...REPORT_TYPES,
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />

        <CustomSelect
          value={filters.failure_type}
          onChange={v => setFilter('failure_type', v)}
          options={[
            { value: 'all', label: 'All failure types' },
            { value: 'failed', label: 'Failed' },
            { value: 'failed_site_blocked', label: 'Site Blocked' },
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />

        <CustomSelect
          value={filters.date_range}
          onChange={v => setFilter('date_range', v)}
          options={[
            { value: 'today', label: 'Today' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: 'all', label: 'All time' },
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />

        <input
          type="text"
          value={filters.user_email}
          onChange={e => setFilter('user_email', e.target.value)}
          placeholder="Filter by user email…"
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary min-w-48"
        />

        {(filters.status !== 'all' || filters.report_type !== 'all' ||
          filters.failure_type !== 'all' || filters.date_range !== '30d' ||
          filters.user_email) && (
          <button
            onClick={() => setFilters({
              status: 'all', report_type: 'all', failure_type: 'all',
              date_range: '30d', user_email: '', sort: 'created_at', order: 'desc',
            })}
            className="px-4 py-2 border border-primary/20 text-gray-400 rounded-lg text-sm hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10">
              <th
                className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => toggleSort('created_at')}
              >
                Time{sortIndicator('created_at')}
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
              <th
                className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => toggleSort('report_type')}
              >
                Report type{sortIndicator('report_type')}
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Failure</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Input</th>
              <th
                className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => toggleSort('admin_failure_status')}
              >
                Status{sortIndicator('admin_failure_status')}
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : failures.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  No failures found.
                </td>
              </tr>
            ) : (
              failures.map(f => (
                <FailureRow
                  key={f.id}
                  failure={f}
                  isHighlighted={f.id === highlightId}
                  rowRef={f.id === highlightId ? highlightRef : undefined}
                  onStatusChange={updateStatus}
                  onNotesChange={updateNotes}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      </>}

      {/* ── System Errors tab ───────────────────────────────────────── */}
      {activeTab === 'system' && <>

      {/* System error filters */}
      <div className="flex flex-wrap gap-3">
        <CustomSelect
          value={sysFilters.type}
          onChange={v => setSysFilters(f => ({ ...f, type: v }))}
          options={[
            { value: 'all', label: 'All types' },
            ...SYSTEM_ERROR_TYPES.map(t => ({ value: t, label: t })),
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />

        <CustomSelect
          value={sysFilters.resolved}
          onChange={v => setSysFilters(f => ({ ...f, resolved: v }))}
          options={[
            { value: 'all', label: 'All' },
            { value: 'false', label: 'Unresolved' },
            { value: 'true', label: 'Resolved' },
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />

        <CustomSelect
          value={sysFilters.date_range}
          onChange={v => setSysFilters(f => ({ ...f, date_range: v }))}
          options={[
            { value: 'today', label: 'Today' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: 'all', label: 'All time' },
          ]}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      {/* System errors table */}
      <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left px-4 py-3 text-gray-400 font-medium whitespace-nowrap">Time</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Message</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Route</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sysLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">Loading…</td>
              </tr>
            ) : sysErrors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No system errors found.</td>
              </tr>
            ) : (
              sysErrors.map(e => (
                <SystemErrorRow key={e.id} error={e} onResolve={resolveSysError} />
              ))
            )}
          </tbody>
        </table>
      </div>

      </>}
    </div>
  )
}

// ─── System Error Row ──────────────────────────────────────────────────────────

function SystemErrorRow({
  error: e,
  onResolve,
}: {
  error: SystemError
  onResolve: (id: string, resolved: boolean) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className={`border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors ${e.resolved ? 'opacity-50' : ''}`}>
        {/* Time */}
        <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
          {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          <br />
          {new Date(e.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles',
          })} PT
        </td>

        {/* Type */}
        <td className="px-4 py-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-orange-900/40 text-orange-400 border-orange-800">
            {e.type}
          </span>
        </td>

        {/* Message */}
        <td className="px-4 py-3 text-gray-300 text-xs max-w-[300px]">
          <p className="truncate" title={e.message}>{e.message}</p>
        </td>

        {/* Route */}
        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
          {e.route ?? '—'}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
            e.resolved
              ? 'bg-green-900/40 text-green-400 border-green-800'
              : 'bg-red-900/40 text-red-400 border-red-800'
          }`}>
            {e.resolved ? 'Resolved' : 'Unresolved'}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-right whitespace-nowrap">
          {e.context && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 mr-3 transition-colors"
            >
              {expanded ? 'Hide' : 'Context'}
            </button>
          )}
          <button
            onClick={() => onResolve(e.id, !e.resolved)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              e.resolved
                ? 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'
                : 'border-green-800 text-green-400 hover:bg-green-900/30'
            }`}
          >
            {e.resolved ? 'Unresolve' : 'Resolve'}
          </button>
        </td>
      </tr>

      {/* Expanded context */}
      {expanded && e.context && (
        <tr className="border-b border-primary/10">
          <td colSpan={6} className="px-4 pb-3">
            <pre className="bg-dark rounded-lg p-3 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(e.context, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Row component ─────────────────────────────────────────────────────────────

function FailureRow({
  failure: f,
  isHighlighted,
  rowRef,
  onStatusChange,
  onNotesChange,
}: {
  failure: Failure
  isHighlighted: boolean
  rowRef?: React.RefObject<HTMLTableRowElement | null>
  onStatusChange: (id: string, status: string) => Promise<void>
  onNotesChange: (id: string, notes: string) => Promise<void>
}) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(f.admin_failure_notes ?? '')
  const [copied, setCopied] = useState(false)

  const inputSummary = f.input_data
    ? Object.entries(f.input_data)
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
        .join(' · ')
    : '—'

  async function handleNotesSave() {
    setEditingNotes(false)
    await onNotesChange(f.id, notesValue)
  }

  async function copyPacket() {
    const packet = generateFailurePacket({
      id: f.id,
      user_name: f.profiles.name,
      user_email: f.profiles.email,
      report_type: f.report_type,
      created_at: f.created_at,
      status: f.status,
      n8n_execution_id: f.n8n_execution_id,
      input_data: f.input_data,
      admin_failure_notes: f.admin_failure_notes,
    })
    await navigator.clipboard.writeText(packet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const adminStatus = f.admin_failure_status as AdminStatus

  return (
    <tr
      ref={rowRef as React.RefObject<HTMLTableRowElement>}
      className={`border-b border-primary/10 last:border-0 transition-colors ${
        isHighlighted
          ? 'bg-cyan-900/20 animate-pulse-once'
          : 'hover:bg-primary/5'
      }`}
    >
      {/* Time */}
      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
        {new Date(f.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        })}
        <br />
        {new Date(f.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true,
          timeZone: 'America/Los_Angeles',
        })} PT
      </td>

      {/* User */}
      <td className="px-4 py-3">
        <p className="text-white text-xs font-medium">{f.profiles.name ?? '—'}</p>
        <p className="text-gray-400 text-xs">{f.profiles.email}</p>
      </td>

      {/* Report type */}
      <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
        {f.report_type}
      </td>

      {/* Failure type */}
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
          f.status === 'failed_site_blocked'
            ? 'bg-orange-900/40 text-orange-400 border-orange-800'
            : 'bg-red-900/40 text-red-400 border-red-800'
        }`}>
          {f.status === 'failed_site_blocked' ? 'Site Blocked' : 'Failed'}
        </span>
        {f.n8n_execution_id && (
          <a
            href={`https://n8n.goodbreeze.ai/executions/${f.n8n_execution_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-cyan-500 hover:text-cyan-400 mt-1"
          >
            n8n →
          </a>
        )}
      </td>

      {/* Input summary */}
      <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">
        {inputSummary}
      </td>

      {/* Status dropdown */}
      <td className="px-4 py-3">
        <CustomSelect
          value={f.admin_failure_status}
          onChange={v => onStatusChange(f.id, v)}
          options={Object.entries(ADMIN_STATUS_LABELS).map(([val, label]) => ({ value: val, label }))}
          className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer ${
            ADMIN_STATUS_STYLES[adminStatus] ?? ADMIN_STATUS_STYLES.unresolved
          }`}
          dropdownMinWidth="w-36"
        />
      </td>

      {/* Notes */}
      <td className="px-4 py-3 max-w-[160px]">
        {editingNotes ? (
          <div className="space-y-1">
            <textarea
              value={notesValue}
              onChange={e => setNotesValue(e.target.value)}
              className="w-full bg-dark border border-primary/20 rounded px-2 py-1 text-xs text-white resize-none focus:outline-none focus:border-primary"
              rows={2}
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={handleNotesSave}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Save
              </button>
              <button
                onClick={() => { setEditingNotes(false); setNotesValue(f.admin_failure_notes ?? '') }}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            className="text-xs text-left text-gray-500 hover:text-gray-300 transition-colors w-full truncate"
            title={f.admin_failure_notes ?? 'Click to add notes'}
          >
            {f.admin_failure_notes
              ? f.admin_failure_notes.slice(0, 40) + (f.admin_failure_notes.length > 40 ? '…' : '')
              : <span className="italic">Add notes…</span>
            }
          </button>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <button
          onClick={copyPacket}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
            copied
              ? 'border-green-700 text-green-400 bg-green-900/20'
              : 'border-primary/20 text-gray-400 hover:text-white hover:border-primary/40'
          }`}
        >
          {copied ? 'Copied!' : 'Copy packet'}
        </button>
      </td>
    </tr>
  )
}
