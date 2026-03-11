import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'
import { AdminReplyPanel } from '../support/AdminReplyPanel'

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
}

interface SearchParams { status?: string; assignee?: string }

export default async function AdminBugReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'open'
  const assigneeFilter = params.assignee ?? 'all'

  // Get current actor
  const supabaseAuth = await createClient()
  const { data: { user: actor } } = await supabaseAuth.auth.getUser()

  const svc = createServiceClient()

  // Load actor's role + guard
  const { data: actorProfile } = actor
    ? await svc.from('profiles').select('role').eq('id', actor.id).single()
    : { data: null }
  const actorRole = actorProfile?.role ?? 'support'

  if (!canDo(actorRole, 'view_bug_reports')) {
    redirect('/admin')
  }

  // Load admin/support users for assignee dropdown
  const { data: adminUsers } = await svc
    .from('profiles')
    .select('id, name, email')
    .in('role', ['superadmin', 'admin', 'support'])
    .order('name', { ascending: true })

  let query = svc
    .from('support_requests')
    .select('id, user_id, email, plan_at_time, last_report_context, message, status, assigned_to, assignee_id, created_at')
    .eq('category', 'bug_report')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }
  if (assigneeFilter === 'mine' && actor) {
    query = query.eq('assignee_id', actor.id)
  } else if (assigneeFilter === 'unassigned') {
    query = query.is('assignee_id', null)
  }

  const { data: requests } = await query.limit(100)

  // Load all messages for the fetched requests in one query
  const requestIds = requests?.map((r) => r.id) ?? []
  const { data: allMessages } = requestIds.length
    ? await svc
        .from('support_messages')
        .select('id, request_id, sender_role, message, created_at')
        .in('request_id', requestIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Load attachments for all messages
  const messageIds = (allMessages ?? []).map((m) => m.id)
  const { data: allAttachments } = messageIds.length
    ? await svc
        .from('support_attachments')
        .select('id, message_id, file_name, file_size, mime_type')
        .in('message_id', messageIds)
    : { data: [] }

  const attachmentsByMessage: Record<string, any[]> = {}
  for (const att of allAttachments ?? []) {
    if (!attachmentsByMessage[att.message_id]) attachmentsByMessage[att.message_id] = []
    attachmentsByMessage[att.message_id]!.push(att)
  }

  // Group messages by request_id
  const messagesByRequest: Record<string, any[]> = {}
  for (const msg of allMessages ?? []) {
    if (!messagesByRequest[msg.request_id]) messagesByRequest[msg.request_id] = []
    messagesByRequest[msg.request_id]!.push({
      ...msg,
      attachments: attachmentsByMessage[msg.id] ?? [],
    })
  }

  // Build assignee name lookup
  const assigneeById: Record<string, string> = {}
  for (const u of adminUsers ?? []) {
    assigneeById[u.id] = u.name ?? u.id
  }

  function buildFilter(s: string, a?: string) {
    const p = new URLSearchParams()
    if (s !== 'open') p.set('status', s)
    if (a && a !== 'all') p.set('assignee', a)
    const qs = p.toString()
    return `/admin/bug-reports${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bug Reports</h1>
        <p className="text-gray-400 text-sm mt-1">{requests?.length ?? 0} shown</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => (
          <Link
            key={s}
            href={buildFilter(s, assigneeFilter !== 'all' ? assigneeFilter : undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${statusFilter === s
                ? 'bg-primary text-white'
                : 'border border-primary/20 text-gray-400 hover:text-white'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Assignee filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Reports' },
          { key: 'mine', label: 'Mine' },
          { key: 'unassigned', label: 'Unassigned' },
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={buildFilter(statusFilter, key !== 'all' ? key : undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${assigneeFilter === key
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'border border-gray-800 text-gray-500 hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* List */}
      {!requests?.length ? (
        <p className="text-gray-500 text-sm">No bug reports found.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-dark-700 border border-primary/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <p className="text-white font-medium">{r.email}</p>
                  {r.plan_at_time && (
                    <p className="text-gray-500 text-xs mt-0.5">Plan: {r.plan_at_time}</p>
                  )}
                  {r.last_report_context && (
                    <p className="text-gray-500 text-xs mt-0.5">Last report: {r.last_report_context}</p>
                  )}
                  {(r as any).assignee_id && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Assigned: {assigneeById[(r as any).assignee_id] ?? (r as any).assignee_id}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[r.status] ?? STATUS_STYLES.open}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {r.user_id && (
                <div className="mb-3">
                  <Link href={`/admin/users/${r.user_id}`}
                    className="text-primary text-xs hover:underline">
                    View user →
                  </Link>
                </div>
              )}

              <AdminReplyPanel
                requestId={r.id}
                userEmail={r.email}
                status={r.status}
                messages={(messagesByRequest[r.id] ?? []) as any}
                assignedTo={(r as any).assigned_to ?? null}
                assigneeId={(r as any).assignee_id ?? null}
                adminUsers={(adminUsers ?? []) as { id: string; name: string }[]}
                actorRole={actorRole}
                actorUserId={actor?.id ?? ''}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
