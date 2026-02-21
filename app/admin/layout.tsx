import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { href: '/admin',                label: 'Overview' },
  { href: '/admin/users',          label: 'Users' },
  { href: '/admin/testimonials',   label: 'Testimonials' },
  { href: '/admin/support',        label: 'Support' },
  { href: '/admin/email-logs',     label: 'Email Logs' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-primary/20 flex flex-col">
        <div className="px-6 py-6 border-b border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Admin</p>
          <p className="text-white font-semibold mt-1 truncate">{profile?.name ?? profile?.email}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-primary/20">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
