import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canDo } from '@/lib/permissions'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/account', '/api/reports', '/admin', '/api/admin', '/expired-password']
// Routes that redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // Guard: if Supabase env vars are missing, pass through without crashing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session — IMPORTANT: do not remove
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Redirect authenticated users away from auth pages
    if (user && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users away from protected routes
    if (!user && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin routes: require view_admin_panel permission (superadmin, admin, support)
    if (user && (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const isBugReportsOnly = pathname.startsWith('/admin/bug-reports')
      if (!canDo(profile?.role, 'view_admin_panel') && !(isBugReportsOnly && canDo(profile?.role, 'view_bug_reports'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Password rotation: block ALL routes for authenticated email users with expired password.
    // Exceptions: /expired-password (the fix page), /auth/ (Supabase flows), /api/auth/ (change-password API).
    // Cookie pw_expired=1 caches the expired state for 5 min to avoid repeated DB hits.
    const hasPasswordProvider = (user?.app_metadata?.providers as string[] | undefined)?.includes('email')
    const shouldCheckExpiry = user && hasPasswordProvider &&
      !pathname.startsWith('/expired-password') &&
      !pathname.startsWith('/auth/') &&
      !pathname.startsWith('/api/auth/')

    if (shouldCheckExpiry) {
      const pwExpiredCookie = request.cookies.get('pw_expired')?.value

      if (pwExpiredCookie === '1') {
        return NextResponse.redirect(new URL('/expired-password', request.url))
      }

      const { data: pwProfile } = await supabase
        .from('profiles')
        .select('password_last_changed_at')
        .eq('id', user.id)
        .single()

      if (pwProfile?.password_last_changed_at) {
        const daysSince = (Date.now() - new Date(pwProfile.password_last_changed_at).getTime()) / 86400000
        if (daysSince >= 90) {
          const redirectRes = NextResponse.redirect(new URL('/expired-password', request.url))
          redirectRes.cookies.set('pw_expired', '1', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 300,
          })
          return redirectRes
        }
      }
    }

    return supabaseResponse
  } catch {
    // If middleware throws for a protected route, redirect to login rather than crash
    const { pathname } = request.nextUrl
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
