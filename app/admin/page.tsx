import { createServiceClient } from '@/lib/supabase/service-client'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const supabase = createServiceClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalUsers },
    { count: reportsToday },
    { count: reportsWeek },
    { count: reportsMonth },
    { count: paidUsers },
    { count: failedReports },
    { count: openSupport },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
    supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      .in('plan', ['starter', 'impulse']).eq('status', 'active'),
    supabase.from('reports').select('*', { count: 'exact', head: true })
      .eq('status', 'failed').gte('created_at', monthStart),
    supabase.from('support_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  // MRR estimate: count active starter subs × $20
  const { count: starterCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'starter')
    .eq('status', 'active')

  const mrrEstimate = (starterCount ?? 0) * 20

  // Recent signups (last 7 days)
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .gte('created_at', weekStart)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Good Breeze AI admin dashboard</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={totalUsers ?? 0} />
        <StatCard label="Active paid users" value={paidUsers ?? 0} />
        <StatCard label="MRR estimate" value={`$${mrrEstimate}`} sub="Starter × $20/mo" />
        <StatCard label="Open support" value={openSupport ?? 0} sub="requests" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reports today" value={reportsToday ?? 0} />
        <StatCard label="Reports this week" value={reportsWeek ?? 0} />
        <StatCard label="Reports this month" value={reportsMonth ?? 0} />
        <StatCard label="Failed this month" value={failedReports ?? 0} sub="reports failed" />
      </div>

      {/* PostHog Analytics */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
        {process.env.NEXT_PUBLIC_POSTHOG_DASHBOARD_URL ? (
          <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
            <iframe
              src={process.env.NEXT_PUBLIC_POSTHOG_DASHBOARD_URL}
              className="w-full border-0"
              style={{ height: '600px' }}
              title="PostHog Analytics"
            />
          </div>
        ) : (
          <div className="bg-dark-700 border border-primary/10 rounded-2xl p-6 text-center">
            <p className="text-gray-400 text-sm">
              PostHog dashboard embed not configured.{' '}
              <span className="text-gray-500">
                Add <code className="bg-dark px-1.5 py-0.5 rounded text-primary text-xs">NEXT_PUBLIC_POSTHOG_DASHBOARD_URL</code> to Vercel env vars
                with your PostHog shared dashboard URL.
              </span>
            </p>
            <p className="text-gray-600 text-xs mt-2">
              PostHog → Dashboards → Share → Copy share link
            </p>
          </div>
        )}
      </div>

      {/* Recent signups */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">New users this week</h2>
        {!recentUsers?.length ? (
          <p className="text-gray-500 text-sm">No new signups this week.</p>
        ) : (
          <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-white">
                      <a href={`/admin/users/${u.id}`} className="hover:text-primary transition-colors">
                        {u.name ?? '—'}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin:     'bg-purple-900/40 text-purple-400 border-purple-800',
    tester:    'bg-blue-900/40 text-blue-400 border-blue-800',
    affiliate: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    user:      'bg-gray-800 text-gray-400 border-gray-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${styles[role] ?? styles.user}`}>
      {role}
    </span>
  )
}
