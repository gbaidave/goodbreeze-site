import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { processReferral } from '@/lib/referral'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

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

  // Shared post-auth logic: sync profile email, send welcome, process referral, redirect.
  async function postAuthRedirect() {
    const { data: { user } } = await supabase.auth.getUser()

    // Sync profiles.email to auth.users.email — covers email change confirmations
    // (Supabase auth updates auth.users directly; DB triggers don't fire reliably)
    if (user?.id && user?.email) {
      createServiceClient()
        .from('profiles')
        .update({ email: user.email })
        .eq('id', user.id)
        .then(() => {}) // fire-and-forget, non-blocking
    }
    if (user?.email) {
      const createdAt = new Date(user.created_at).getTime()
      const isNewUser = Date.now() - createdAt < 2 * 60 * 60 * 1000
      if (isNewUser) {
        const name = user.user_metadata?.name || user.email
        sendWelcomeEmail(user.email, name, user.id).catch(console.error)

        // Process referral: check URL param (from signup form) then cookie fallback
        const refCode =
          user.user_metadata?.referred_by_affiliate_code ||
          cookieStore.get('gbai_ref')?.value
        if (refCode) {
          processReferral(user.id, refCode).catch(console.error)
        }

        // Append welcome flag so dashboard can show first-login banner
        const welcomeUrl = returnUrl.includes('?')
          ? `${returnUrl}&welcome=1`
          : `${returnUrl}?welcome=1`
        return NextResponse.redirect(`${origin}${welcomeUrl}`)
      }
    }
    return NextResponse.redirect(`${origin}${returnUrl}`)
  }

  // PKCE code flow — used by OAuth (Google) and some magic link variants
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Password reset — always go to the reset password page.
      // Supabase recovery emails don't include a returnUrl param, so returnUrl
      // would default to /dashboard. Hardcode /auth/reset-password instead.
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      return postAuthRedirect()
    }
  }

  // Token hash flow — used by admin.generateLink magic links (frictionless sign-in)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'email' | 'signup' | 'magiclink' | 'recovery' | 'email_change',
    })
    if (!error) {
      return postAuthRedirect()
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
