import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service-client'
import { UsersTableClient } from './UsersTableClient'

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
    <div className="p-4 md:p-8 space-y-6">
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
      <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
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
            <UsersTableClient users={filtered} />
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

