import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'
import { AdminReplyPanel } from '../support/AdminReplyPanel'

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/40 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-400 border-gray-700',
}

interface SearchParams { status?: string }

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'open'

  const supabase = createServiceClient()

  let query = supabase
    .from('support_requests')
    .select('id, user_id, email, plan_at_time, message, status, category, subject, priority, created_at')
    .eq('category', 'dispute')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: requests } = await query.limit(100)

  const requestIds = requests?.map((r) => r.id) ?? []
  const { data: allMessages } = requestIds.length
    ? await supabase
        .from('support_messages')
        .select('id, request_id, sender_role, message, created_at')
        .in('request_id', requestIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  const messagesByRequest: Record<string, any[]> = {}
  for (const msg of allMessages ?? []) {
    if (!messagesByRequest[msg.request_id]) messagesByRequest[msg.request_id] = []
    messagesByRequest[msg.request_id]!.push(msg)
  }

  function buildFilter(s: string) {
    const p = new URLSearchParams()
    if (s !== 'open') p.set('status', s)
    const qs = p.toString()
    return `/admin/disputes${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Disputes</h1>
        <p className="text-gray-400 text-sm mt-1">{requests?.length ?? 0} dispute{requests?.length !== 1 ? 's' : ''} shown</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => (
          <Link
            key={s}
            href={buildFilter(s)}
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
        <p className="text-gray-500 text-sm">No disputes found.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-dark-700 border border-red-800/50 rounded-2xl p-6"
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
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[r.status] ?? STATUS_STYLES.open}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mb-3 text-xs">
                {r.user_id && (
                  <Link href={`/admin/users/${r.user_id}`} className="text-primary hover:underline">
                    View user →
                  </Link>
                )}
                <Link href={`/admin/refunds`} className="text-orange-400 hover:underline">
                  View refunds →
                </Link>
                <Link href={`/admin/support`} className="text-gray-500 hover:underline">
                  All support →
                </Link>
              </div>

              <AdminReplyPanel
                requestId={r.id}
                userEmail={r.email}
                status={r.status}
                category={r.category ?? undefined}
                messages={(messagesByRequest[r.id] ?? []) as any}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
