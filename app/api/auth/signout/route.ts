/**
 * POST /api/auth/signout
 *
 * Server-side signout. Clears the Supabase auth cookies via the response so
 * the middleware sees a clean session on the next request.
 *
 * WHY THIS EXISTS:
 * Client-side supabase.auth.signOut() clears local JS state but does not
 * reliably clear the server-side cookie headers used by @supabase/ssr.
 * The middleware reads those cookies — if they're still set, it treats the
 * user as authenticated and redirects /login → /dashboard, creating a loop.
 * This route performs the signout server-side, ensuring cookies are cleared
 * in the response headers before the client redirects.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.signOut()
  } catch {
    // Swallow errors — always succeed so the client redirects to login regardless
  }

  return NextResponse.json({ success: true })
}
