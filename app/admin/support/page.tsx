import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'
import { AdminReplyPanel } from './AdminReplyPanel'

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
}

interface SearchParams { status?: string }

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'open'

  const supabase = createServiceClient()

  let query = supabase
    .from('support_requests')
    .select('id, user_id, email, plan_at_time, message, status, created_at')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
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
  const messagesByRequest: Record<string, typeof allMessages> = {}
  for (const msg of allMessages ?? []) {
    if (!messagesByRequest[msg.request_id]) messagesByRequest[msg.request_id] = []
    messagesByRequest[msg.request_id]!.push(msg)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Requests</h1>
        <p className="text-gray-400 text-sm mt-1">{requests?.length ?? 0} shown</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => (
          <Link
            key={s}
            href={`/admin/support${s !== 'open' ? `?status=${s}` : ''}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${statusFilter === s
                ? 'bg-primary text-white'
                : 'border border-primary/20 text-gray-400 hover:text-white'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* List */}
      {!requests?.length ? (
        <p className="text-gray-500 text-sm">No requests with status: {statusFilter}.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-white font-medium">{r.email}</p>
                  {r.plan_at_time && (
                    <p className="text-gray-500 text-xs mt-0.5">Plan at time: {r.plan_at_time}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
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

              {/* Reply panel with thread + reply form */}
              <AdminReplyPanel
                requestId={r.id}
                userEmail={r.email}
                status={r.status}
                messages={(messagesByRequest[r.id] ?? []) as any}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
