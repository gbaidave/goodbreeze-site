import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'

const PAGE_SIZE = 25

interface SearchParams {
  q?: string
  role?: string
  plan?: string
  sort?: string
  page?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const roleFilter = params.role ?? 'all'
  const planFilter = params.plan ?? 'all'
  const sort = params.sort ?? 'newest'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = createServiceClient()

  // Build query — join profiles + latest subscription
  let query = supabase
    .from('profiles')
    .select(`
      id, name, email, role, phone, created_at,
      subscriptions!inner ( plan, status )
    `, { count: 'exact' })

  // Search
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  // Role filter
  if (roleFilter !== 'all') {
    query = query.eq('role', roleFilter)
  }

  // Sort
  query = query.order('created_at', { ascending: sort === 'oldest' })

  // Paginate
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: rawUsers, count } = await query

  // Flatten: pick the latest subscription per user
  const users = (rawUsers ?? []).map((u: any) => {
    const subs: any[] = Array.isArray(u.subscriptions) ? u.subscriptions : [u.subscriptions]
    const activeSub = subs.find((s: any) => s.status === 'active' || s.status === 'trialing') ?? subs[0]
    return { ...u, plan: activeSub?.plan ?? 'free', sub_status: activeSub?.status ?? 'active' }
  })

  // Filter by plan client-side (after join flattening)
  const filtered = planFilter === 'all'
    ? users
    : users.filter((u) => u.plan === planFilter)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Partial<SearchParams>) {
    const p = { q, role: roleFilter, plan: planFilter, sort, page: String(page), ...overrides }
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(p).filter(([, v]) => v && v !== 'all' && v !== '1'))
    ).toString()
    return `/admin/users${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{count ?? 0} total</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/users" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="flex-1 min-w-48 bg-dark-700 border border-primary/20 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
        />
        <select name="role" defaultValue={roleFilter}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="tester">Tester</option>
          <option value="admin">Admin</option>
          <option value="affiliate">Affiliate</option>
        </select>
        <select name="plan" defaultValue={planFilter}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="impulse">Impulse</option>
          <option value="starter">Starter</option>
          <option value="custom">Custom</option>
        </select>
        <select name="sort" defaultValue={sort}
          className="bg-dark-700 border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Filter
        </button>
        {(q || roleFilter !== 'all' || planFilter !== 'all') && (
          <Link href="/admin/users"
            className="px-4 py-2 border border-primary/20 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{u.name ?? <span className="text-gray-500 italic">—</span>}</td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`}
                      className="text-primary text-xs hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })}
              className="px-4 py-2 border border-primary/20 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
              ← Prev
            </Link>
          )}
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })}
              className="px-4 py-2 border border-primary/20 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
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

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    starter: 'bg-green-900/40 text-green-400 border-green-800',
    impulse: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    custom:  'bg-purple-900/40 text-purple-400 border-purple-800',
    free:    'bg-gray-800 text-gray-400 border-gray-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${styles[plan] ?? styles.free}`}>
      {plan}
    </span>
  )
}
