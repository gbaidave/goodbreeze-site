import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { processReferral } from '@/lib/referral'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  if (code) {
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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Send welcome email + process referral for new users
      // New user = created within 2 hours (email confirmation links expire in 1 hour)
      const { data: { user } } = await supabase.auth.getUser()
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
        }
      }
      return NextResponse.redirect(`${origin}${returnUrl}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
