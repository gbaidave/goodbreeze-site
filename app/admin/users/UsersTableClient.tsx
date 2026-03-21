'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  plan: string
  sub_status: string
  created_at: string
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    superadmin: 'bg-red-900/40 text-red-400 border-red-800',
    admin:      'bg-purple-900/40 text-purple-400 border-purple-800',
    support:    'bg-cyan-900/40 text-cyan-400 border-cyan-800',
    tester:     'bg-blue-900/40 text-blue-400 border-blue-800',
    affiliate:  'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    user:       'bg-gray-800 text-gray-400 border-gray-700',
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
    growth:  'bg-emerald-900/40 text-emerald-400 border-emerald-800',
    pro:     'bg-teal-900/40 text-teal-400 border-teal-800',
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

export function UsersTableClient({ users }: { users: UserRow[] }) {
  const router = useRouter()

  if (users.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No users found.</td>
      </tr>
    )
  }

  return (
    <>
      {users.map((u) => (
        <tr
          key={u.id}
          onClick={() => router.push(`/admin/users/${u.id}`)}
          className="border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <td className="px-4 py-3 text-white font-medium">{u.name ?? <span className="text-gray-500 italic">—</span>}</td>
          <td className="px-4 py-3 text-gray-300">{u.email}</td>
          <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
          <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
          <td className="px-4 py-3 text-gray-500">
            {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </td>
          <td className="px-4 py-3 text-right">
            <Link
              href={`/admin/users/${u.id}`}
              onClick={e => e.stopPropagation()}
              className="text-primary text-xs hover:underline"
            >
              View →
            </Link>
          </td>
        </tr>
      ))}
    </>
  )
}
