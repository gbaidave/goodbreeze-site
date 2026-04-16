import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canDo } from '@/lib/permissions'

// Full nav — superadmin sees everything
const SUPERADMIN_NAV = [
  { href: '/admin',              label: 'Overview' },
  { href: '/admin/users',        label: 'Users' },
  { href: '/admin/errors',       label: 'Errors' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/support',      label: 'Support' },
  { href: '/admin/disputes',     label: 'Disputes' },
  { href: '/admin/bug-reports',  label: 'Bug Reports' },
  { href: '/admin/refunds',      label: 'Refunds' },
  { href: '/admin/email-logs',   label: 'Email Logs' },
  { href: '/admin/settings',     label: 'Settings' },
  { href: '/admin/catalog',      label: 'Catalog' },
]

// Admin nav — no Refunds or Settings (Stripe + system config = superadmin only)
const ADMIN_NAV = [
  { href: '/admin',              label: 'Overview' },
  { href: '/admin/users',        label: 'Users' },
  { href: '/admin/errors',       label: 'Errors' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/support',      label: 'Support' },
  { href: '/admin/disputes',     label: 'Disputes' },
  { href: '/admin/bug-reports',  label: 'Bug Reports' },
  { href: '/admin/email-logs',   label: 'Email Logs' },
]

// Support nav — tickets, disputes, bug reports only
const SUPPORT_NAV = [
  { href: '/admin/support',     label: 'Support' },
  { href: '/admin/disputes',    label: 'Disputes' },
  { href: '/admin/bug-reports', label: 'Bug Reports' },
]

// Tester nav — bug reports only
const TESTER_NAV = [
  { href: '/admin/bug-reports', label: 'Bug Reports' },
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

  if (!canDo(profile?.role, 'view_admin_panel') && !canDo(profile?.role, 'view_bug_reports')) redirect('/dashboard')

  const NAV_ITEMS =
    profile?.role === 'superadmin' ? SUPERADMIN_NAV :
    profile?.role === 'admin'      ? ADMIN_NAV :
    profile?.role === 'tester'     ? TESTER_NAV :
    SUPPORT_NAV

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-56 flex-shrink-0 border-b border-primary/20 md:border-b-0 md:border-r flex flex-col md:min-h-screen">
        {/* Desktop header */}
        <div className="px-6 py-6 border-b border-primary/20 hidden md:block">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {profile?.role === 'support' ? 'Support Dashboard' : profile?.role === 'tester' ? 'Tester Dashboard' : 'Admin Dashboard'}
          </p>
          <p className="text-white font-semibold mt-1 truncate">{profile?.name ?? profile?.email}</p>
        </div>
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 md:hidden">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {profile?.role === 'support' ? 'Support' : profile?.role === 'tester' ? 'Tester' : 'Admin'}
          </p>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← App</Link>
        </div>
        <nav className="flex overflow-x-auto md:flex-col md:overflow-visible flex-shrink-0 px-2 py-2 md:px-3 md:py-4 gap-0.5 md:gap-0 md:space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-primary/20 hidden md:block">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
