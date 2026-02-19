import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'

interface SearchParams { status?: string; type?: string }

export default async function AdminEmailLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'all'
  const typeFilter = params.type ?? 'all'

  const supabase = createServiceClient()

  let query = supabase
    .from('email_logs')
    .select('id, user_id, to_email, type, subject, status, error, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (typeFilter !== 'all') query = query.eq('type', typeFilter)

  const { data: logs } = await query

  const emailTypes = [
    'report_ready', 'magic_link', 'nudge_exhausted', 'support_confirmation',
    'referral_credit', 'testimonial_credit', 'welcome', 'plan_changed',
  ]

  function buildUrl(overrides: Partial<SearchParams>) {
    const p = { status: statusFilter, type: typeFilter, ...overrides }
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(p).filter(([, v]) => v && v !== 'all'))
    ).toString()
    return `/admin/email-logs${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Logs</h1>
        <p className="text-gray-400 text-sm mt-1">{logs?.length ?? 0} shown (latest 100)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status tabs */}
        <div className="flex gap-2">
          {['all', 'sent', 'failed', 'bounced'].map((s) => (
            <Link key={s} href={buildUrl({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors
                ${statusFilter === s
                  ? 'bg-primary text-white'
                  : 'border border-primary/20 text-gray-400 hover:text-white'}`}>
              {s}
            </Link>
          ))}
        </div>

        {/* Type select */}
        <form method="GET" action="/admin/email-logs" className="flex gap-2">
          <input type="hidden" name="status" value={statusFilter} />
          <select name="type" defaultValue={typeFilter}
            onChange={(e) => (e.currentTarget.form as HTMLFormElement)?.submit()}
            className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
            <option value="all">All types</option>
            {emailTypes.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </form>
      </div>

      {/* Table */}
      <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">To</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Subject</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {!logs?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">No logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white text-xs">{log.to_email}</div>
                    {log.user_id && (
                      <Link href={`/admin/users/${log.user_id}`}
                        className="text-primary text-xs hover:underline">view user</Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs capitalize">{log.type?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-48">{log.subject}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize
                        ${log.status === 'sent' ? 'bg-green-900/40 text-green-400 border-green-800'
                          : log.status === 'failed' ? 'bg-red-900/40 text-red-400 border-red-800'
                          : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                        {log.status}
                      </span>
                      {log.error && (
                        <p className="text-red-400 text-xs">{log.error}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
