'use client'

import { useState, useCallback } from 'react'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
}

const IMPORTANCE_STYLES: Record<string, string> = {
  low:    'bg-zinc-700/60 text-zinc-300 border-zinc-600',
  medium: 'bg-amber-900/40 text-amber-400 border-amber-800',
  high:   'bg-red-900/40 text-red-400 border-red-800',
}

const PRIORITY_STYLES: Record<string, string> = {
  low:      'text-zinc-400',
  medium:   'text-amber-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

// ─── Inline select helpers ────────────────────────────────────────────────────

function InlinePrioritySelect({
  requestId,
  value,
  onChange,
  canEdit,
}: {
  requestId: string
  value: string | null
  onChange: (id: string, priority: string | null) => void
  canEdit: boolean
}) {
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value || null
    setSaving(true)
    await fetch(`/api/admin/support/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: next }),
    })
    setSaving(false)
    onChange(requestId, next)
  }

  if (!canEdit) {
    return (
      <span className={`text-xs font-medium capitalize ${value ? PRIORITY_STYLES[value] : 'text-zinc-600'}`}>
        {value ?? '—'}
      </span>
    )
  }

  return (
    <select
      value={value ?? ''}
      onChange={handleChange}
      disabled={saving}
      onClick={e => e.stopPropagation()}
      className={`text-xs bg-transparent border-none outline-none cursor-pointer font-medium capitalize ${
        value ? PRIORITY_STYLES[value] : 'text-zinc-600'
      } disabled:opacity-60`}
    >
      <option value="">—</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>
  )
}

function InlineStatusSelect({
  requestId,
  value,
  onChange,
  canEdit,
}: {
  requestId: string
  value: string
  onChange: (id: string, status: string) => void
  canEdit: boolean
}) {
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setSaving(true)
    await fetch(`/api/admin/support/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setSaving(false)
    onChange(requestId, next)
  }

  const badge = (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[value] ?? STATUS_STYLES.open}`}>
      {value.replace('_', ' ')}
    </span>
  )

  if (!canEdit) return badge

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={saving}
      onClick={e => e.stopPropagation()}
      className={`text-xs px-2 py-0.5 rounded-full border capitalize cursor-pointer bg-transparent outline-none font-medium ${
        STATUS_STYLES[value] ?? STATUS_STYLES.open
      } disabled:opacity-60`}
    >
      <option value="open">Open</option>
      <option value="in_progress">In Progress</option>
      <option value="resolved">Resolved</option>
      <option value="closed">Closed</option>
    </select>
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

  const canEdit = ['superadmin', 'admin', 'support'].includes(actorRole)

  // Build assignee name lookup
  const assigneeById: Record<string, string> = {}
  for (const u of adminUsers) {
    assigneeById[u.id] = u.name ?? u.id
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
        {['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => (
          <a
            key={s}
            href={buildFilter(s, assigneeFilter !== 'all' ? assigneeFilter : undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${statusFilter === s
                ? 'bg-primary text-white'
                : 'border border-primary/20 text-gray-400 hover:text-white'}`}
          >
            {s.replace('_', ' ')}
          </a>
        ))}
      </div>

      {/* Assignee filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { key: 'all', label: 'All Reports' },
          { key: 'mine', label: 'Mine' },
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

      {/* Table */}
      {!rows.length ? (
        <p className="text-gray-500 text-sm">No bug reports found.</p>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[60px_80px_100px_160px_140px_140px_70px_1fr_140px] gap-x-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wide">
            <div>Bug #</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Reported By</div>
            <div>Assigned To</div>
            <div>Category</div>
            <div>Severity</div>
            <div>Subject</div>
            <div>Date</div>
          </div>

          {/* Rows */}
          {rows.map((r) => (
            <div key={r.id} className="border-b border-zinc-800 last:border-0">
              {/* Main row */}
              <div
                onClick={() => toggleExpand(r.id)}
                className={`grid grid-cols-[60px_80px_100px_160px_140px_140px_70px_1fr_140px] gap-x-3 px-4 py-3 cursor-pointer transition-colors items-center ${
                  expandedId === r.id ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'
                }`}
              >
                {/* Bug # */}
                <div className="text-zinc-400 text-sm font-mono">
                  {r.bug_number ? `#${r.bug_number}` : r.id.slice(0, 6)}
                </div>

                {/* Priority */}
                <div onClick={e => canEdit && e.stopPropagation()}>
                  <InlinePrioritySelect
                    requestId={r.id}
                    value={r.priority}
                    onChange={handlePriorityChange}
                    canEdit={canEdit}
                  />
                </div>

                {/* Status */}
                <div onClick={e => canEdit && e.stopPropagation()}>
                  <InlineStatusSelect
                    requestId={r.id}
                    value={r.status}
                    onChange={handleStatusChange}
                    canEdit={canEdit}
                  />
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

                {/* Assigned To */}
                <div className="text-zinc-400 text-xs truncate">
                  {r.assignee_id ? assigneeById[r.assignee_id] ?? r.assignee_id : 'Unassigned'}
                </div>

                {/* Category */}
                <div className="text-zinc-400 text-xs truncate">
                  {r.bug_category ? CATEGORY_LABELS[r.bug_category] ?? r.bug_category : '—'}
                </div>

                {/* Importance */}
                <div>
                  {r.importance ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${IMPORTANCE_STYLES[r.importance] ?? ''}`}>
                      {r.importance}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">—</span>
                  )}
                </div>

                {/* Subject */}
                <div className="min-w-0">
                  <span className="text-white text-sm truncate block">
                    {r.subject ?? r.messages[0]?.message?.slice(0, 60) ?? '(no subject)'}
                  </span>
                </div>

                {/* Date */}
                <div className="text-zinc-500 text-xs whitespace-nowrap">
                  {formatDate(r.created_at)}
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
          ))}
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
