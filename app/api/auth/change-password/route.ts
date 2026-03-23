/**
 * POST /api/auth/change-password
 *
 * In-app password change for authenticated email/password users.
 * User is already authenticated — no current password re-verification needed.
 * Updates password_last_changed_at on success to reset the 90-day rotation clock.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function POST(request: NextRequest) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required.' }, { status: 400 })
    }
    if (newPassword.length < 12) {
      return NextResponse.json({ error: 'New password must be at least 12 characters.' }, { status: 400 })
    }

    // Update password — user is already authenticated, no re-auth needed
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Reset 90-day rotation clock
    const svc = createServiceClient()
    await svc.from('profiles')
      .update({ password_last_changed_at: new Date().toISOString() })
      .eq('id', user.id)

    const response = NextResponse.json({ success: true })
    response.cookies.set('pw_expired', '', { maxAge: 0, path: '/' })
    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
