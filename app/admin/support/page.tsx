import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'
import { AdminReplyPanel } from './AdminReplyPanel'

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
}

const CATEGORY_STYLES: Record<string, string> = {
  help:           'bg-gray-800 text-gray-400 border-gray-700',
  report_issue:   'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  billing:        'bg-blue-900/40 text-blue-400 border-blue-800',
  refund:         'bg-orange-900/40 text-orange-400 border-orange-800',
  dispute:        'bg-red-900/40 text-red-400 border-red-800',
  account_access: 'bg-purple-900/40 text-purple-400 border-purple-800',
  feedback:       'bg-green-900/40 text-green-400 border-green-800',
}

const CATEGORY_LABELS: Record<string, string> = {
  account_access: 'Account Access',
  report_issue:   'Report Issue',
  billing:        'Billing',
  refund:         'Refund Request',
  dispute:        'Dispute',
  help:           'General Help',
  feedback:       'Feedback',
}

interface SearchParams { status?: string; category?: string }

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'open'
  const categoryFilter = params.category ?? 'all'

  const supabase = createServiceClient()

  let query = supabase
    .from('support_requests')
    .select('id, user_id, email, plan_at_time, message, status, category, subject, priority, assigned_to, created_at')
    .order('priority', { ascending: false }) // high priority (dispute) first
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }
  if (categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter)
  }

  const { data: requests } = await query.limit(100)

  // Load all messages for the fetched requests in one query
  const requestIds = requests?.map((r) => r.id) ?? []
  const { data: allMessages } = requestIds.length
    ? await supabase
        .from('support_messages')
        .select('id, request_id, sender_role, message, created_at')
        .in('request_id', requestIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Group messages by request_id
  const messagesByRequest: Record<string, any[]> = {}
  for (const msg of allMessages ?? []) {
    if (!messagesByRequest[msg.request_id]) messagesByRequest[msg.request_id] = []
    messagesByRequest[msg.request_id]!.push(msg)
  }

  function buildFilter(s: string, c?: string) {
    const p = new URLSearchParams()
    if (s !== 'open') p.set('status', s)
    if (c && c !== 'all') p.set('category', c)
    const qs = p.toString()
    return `/admin/support${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Requests</h1>
        <p className="text-gray-400 text-sm mt-1">{requests?.length ?? 0} shown</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => (
          <Link
            key={s}
            href={buildFilter(s, categoryFilter !== 'all' ? categoryFilter : undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${statusFilter === s
                ? 'bg-primary text-white'
                : 'border border-primary/20 text-gray-400 hover:text-white'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'help', 'report_issue', 'billing', 'refund', 'dispute', 'account_access', 'feedback'] as const).map((c) => (
          <Link
            key={c}
            href={buildFilter(statusFilter, c !== 'all' ? c : undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${categoryFilter === c
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'border border-gray-800 text-gray-500 hover:text-white'}`}
          >
            {c === 'all' ? 'All Categories' : (CATEGORY_LABELS[c] ?? c)}
          </Link>
        ))}
      </div>

      {/* List */}
      {!requests?.length ? (
        <p className="text-gray-500 text-sm">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className={`bg-dark-700 border rounded-2xl p-6 ${
                r.priority === 'high' ? 'border-red-800/60' : 'border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <p className="text-white font-medium">{r.email}</p>
                  {r.subject && (
                    <p className="text-gray-300 text-sm mt-0.5 font-medium">{r.subject}</p>
                  )}
                  {r.plan_at_time && (
                    <p className="text-gray-500 text-xs mt-0.5">Plan: {r.plan_at_time}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {r.priority === 'high' && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-red-900/40 text-red-400 border-red-800 font-medium">
                      High Priority
                    </span>
                  )}
                  {r.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${CATEGORY_STYLES[r.category] ?? CATEGORY_STYLES.help}`}>
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[r.status] ?? STATUS_STYLES.open}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Refund link for refund category tickets */}
              {r.category === 'refund' && (
                <div className="mb-3">
                  <Link
                    href={`/admin/refunds`}
                    className="text-orange-400 text-xs hover:underline"
                  >
                    View associated refund request in Refunds panel →
                  </Link>
                </div>
              )}

              {r.user_id && (
                <div className="mb-3">
                  <Link href={`/admin/users/${r.user_id}`}
                    className="text-primary text-xs hover:underline">
                    View user →
                  </Link>
                </div>
              )}

              {/* Reply panel with thread + reply form */}
              <AdminReplyPanel
                requestId={r.id}
                userEmail={r.email}
                status={r.status}
                messages={(messagesByRequest[r.id] ?? []) as any}
                assignedTo={(r as any).assigned_to ?? null}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
