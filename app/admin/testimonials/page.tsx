import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'

interface SearchParams { status?: string; type?: string }

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'all'
  const typeFilter = params.type ?? 'all'

  const supabase = createServiceClient()

  let query = supabase
    .from('testimonials')
    .select(`
      id, type, status, pull_quote, content, video_url, credits_granted, admin_note, created_at,
      user_id,
      profiles ( name, email )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (typeFilter !== 'all') query = query.eq('type', typeFilter)

  const { data: testimonials } = await query

  const rows = testimonials ?? []
  const pendingCount = rows.filter((t) => t.status === 'pending').length

  function buildUrl(overrides: Partial<SearchParams>) {
    const p = { status: statusFilter, type: typeFilter, ...overrides }
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(p).filter(([, v]) => v && v !== 'all'))
    ).toString()
    return `/admin/testimonials${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="text-gray-400 text-sm mt-1">
            {rows.length} total
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-400">{pendingCount} pending review</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s })}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-primary/20 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
        {/* Type filter */}
        <div className="flex gap-2">
          {(['all', 'written', 'video'] as const).map((t) => (
            <Link
              key={t}
              href={buildUrl({ type: t })}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
                typeFilter === t
                  ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/40'
                  : 'border-primary/20 text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="bg-dark-700 border border-primary/20 rounded-2xl p-12 text-center text-gray-500">
          No testimonials found.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((t: any) => {
            const user = t.profiles as { name?: string; email?: string } | null
            return (
              <div key={t.id} className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TypeBadge type={t.type} />
                    <StatusBadge status={t.status} />
                    {t.credits_granted > 0 && (
                      <span className="text-xs text-primary font-medium">+{t.credits_granted} credits</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <Link
                      href={`/admin/users/${t.user_id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {user?.name || user?.email || t.user_id}
                    </Link>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {new Date(t.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Content */}
                {t.pull_quote && (
                  <p className="text-white font-medium">&ldquo;{t.pull_quote}&rdquo;</p>
                )}
                {t.content && (
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">{t.content}</p>
                )}
                {t.video_url && (
                  <a
                    href={t.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    View video
                  </a>
                )}
                {t.admin_note && (
                  <p className="text-gray-500 text-xs italic">Admin note: {t.admin_note}</p>
                )}

                {/* Actions */}
                {t.status === 'pending' && (
                  <div className="flex gap-3 pt-1">
                    <ApproveRejectForm testimonialId={t.id} action="approved" label="Approve" />
                    <ApproveRejectForm testimonialId={t.id} action="rejected" label="Reject" />
                  </div>
                )}
                {t.status !== 'pending' && (
                  <div className="flex gap-3 pt-1">
                    <ApproveRejectForm
                      testimonialId={t.id}
                      action="pending"
                      label="Reset to pending"
                      variant="ghost"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border capitalize bg-dark text-gray-300 border-gray-700">
      {type}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-green-900/40 text-green-400 border-green-800',
    rejected: 'bg-red-900/40 text-red-400 border-red-800',
    pending: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  )
}

function ApproveRejectForm({
  testimonialId,
  action,
  label,
  variant = 'default',
}: {
  testimonialId: string
  action: string
  label: string
  variant?: 'default' | 'ghost'
}) {
  return (
    <form action="/api/admin/testimonials" method="POST">
      <input type="hidden" name="id" value={testimonialId} />
      <input type="hidden" name="status" value={action} />
      <button
        type="submit"
        className={
          variant === 'ghost'
            ? 'text-xs text-gray-500 hover:text-gray-300 transition-colors'
            : action === 'approved'
            ? 'px-4 py-2 text-sm bg-green-900/30 border border-green-800 text-green-400 rounded-xl hover:bg-green-900/50 transition-colors'
            : action === 'rejected'
            ? 'px-4 py-2 text-sm bg-red-900/20 border border-red-900/40 text-red-400 rounded-xl hover:bg-red-900/30 transition-colors'
            : 'px-4 py-2 text-sm border border-primary/30 text-primary rounded-xl hover:bg-primary/10 transition-colors'
        }
      >
        {label}
      </button>
    </form>
  )
}
