import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'
import { RefundActionPanel } from './RefundActionPanel'
import { RefundThreadPanel } from './RefundThreadPanel'

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  approved: 'bg-blue-900/40 text-blue-400 border-blue-800',
  refunded: 'bg-green-900/40 text-green-400 border-green-800',
  denied:   'bg-gray-800 text-gray-400 border-gray-700',
}

interface SearchParams { status?: string }

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'pending'

  const supabase = createServiceClient()

  let query = supabase
    .from('refund_requests')
    .select(`
      id, user_id, stripe_payment_id, product_type, product_label,
      amount_paid_cents, credits_used_at_request, purchase_date,
      status, stripe_refund_id, refund_amount_cents, admin_notes,
      reviewed_at, created_at, support_request_id,
      profiles!refund_requests_user_id_fkey(name, email),
      support_requests(id, subject, category, status,
        support_messages(id, sender_role, message, created_at)
      )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: requests } = await query.limit(100)

  const counts = await Promise.all([
    supabase.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'refunded'),
    supabase.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'denied'),
  ])
  const [pendingCount, approvedCount, refundedCount, deniedCount] = counts.map(c => c.count ?? 0)

  const tabs = [
    { key: 'pending',  label: 'Pending',  count: pendingCount },
    { key: 'approved', label: 'Approved', count: approvedCount },
    { key: 'refunded', label: 'Refunded', count: refundedCount },
    { key: 'denied',   label: 'Denied',   count: deniedCount },
    { key: 'all',      label: 'All',      count: null },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Refund Requests</h1>
        <p className="text-gray-400 text-sm mt-1">{requests?.length ?? 0} shown</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/refunds?status=${tab.key}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? 'bg-primary text-zinc-950'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}{tab.count !== null ? ` (${tab.count})` : ''}
          </Link>
        ))}
      </div>

      {/* Request list */}
      {!requests?.length ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-gray-500">
          No {statusFilter === 'all' ? '' : statusFilter} refund requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const profile = (req as any).profiles
            const name = profile?.name || profile?.email || 'Unknown'
            const email = profile?.email || '—'
            const amountFormatted = req.amount_paid_cents
              ? `$${(req.amount_paid_cents / 100).toFixed(2)}`
              : '—'
            const purchasedOn = req.purchase_date
              ? new Date(req.purchase_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'
            const requestedOn = new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

            const supportReq = (req as any).support_requests
            const supportSubject = supportReq?.subject
            const supportMessages = (supportReq?.support_messages ?? []).sort(
              (a: { created_at: string }, b: { created_at: string }) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )

            return (
              <div key={req.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[req.status] ?? STATUS_STYLES.pending}`}>
                        {req.status}
                      </span>
                      <span className="text-white font-medium">{name}</span>
                      <span className="text-gray-500 text-sm">{email}</span>
                    </div>
                    {supportSubject && (
                      <p className="text-sm text-white font-medium">&ldquo;{supportSubject}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {req.product_label?.includes('Payment method') ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-900/60 text-orange-300 border-orange-700">Payment method</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-900/60 text-blue-300 border-blue-700">Credits</span>
                      )}
                      <span className="text-sm text-gray-400">
                        <span className="text-white">{req.product_label?.split(' — ')[0] ?? req.product_label}</span>
                        {' · '}{amountFormatted}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500 shrink-0">
                    <p>Purchased: {purchasedOn}</p>
                    <p>Requested: {requestedOn}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <p className="text-gray-500 text-xs mb-0.5">Credits used</p>
                    <p className={`font-semibold ${req.credits_used_at_request > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {req.credits_used_at_request}
                    </p>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <p className="text-gray-500 text-xs mb-0.5">Eligible</p>
                    <p className={`font-semibold ${req.credits_used_at_request === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {req.credits_used_at_request === 0 ? 'Yes' : 'No — credits used'}
                    </p>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <p className="text-gray-500 text-xs mb-0.5">Stripe payment</p>
                    <p className="font-mono text-xs text-white truncate">{req.stripe_payment_id || '—'}</p>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <p className="text-gray-500 text-xs mb-0.5">Stripe refund ID</p>
                    <p className="font-mono text-xs text-white truncate">{req.stripe_refund_id || '—'}</p>
                  </div>
                </div>

                {req.admin_notes && (
                  <p className="text-sm text-gray-400 italic border-l-2 border-zinc-700 pl-3">{req.admin_notes}</p>
                )}

                {/* Action panel — client component */}
                {req.status === 'pending' && (
                  <RefundActionPanel
                    requestId={req.id}
                    stripePaymentId={req.stripe_payment_id}
                    amountPaidCents={req.amount_paid_cents ?? 0}
                    creditsUsed={req.credits_used_at_request}
                    userId={req.user_id}
                  />
                )}

                {req.status === 'refunded' && req.refund_amount_cents && (
                  <p className="text-sm text-green-400 font-medium">
                    Refunded ${(req.refund_amount_cents / 100).toFixed(2)} via Stripe
                    {req.reviewed_at && ` · ${new Date(req.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                )}

                {/* Support thread — expandable */}
                {supportReq && (
                  <RefundThreadPanel
                    supportRequestId={supportReq.id}
                    userEmail={email}
                    messages={supportMessages}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
