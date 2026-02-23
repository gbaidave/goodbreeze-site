/**
 * POST /api/auth/login
 *
 * Server-side login with:
 *  - Account lockout (3 failed attempts → 30min lock)
 *  - Cloudflare Turnstile CAPTCHA verification (when TURNSTILE_SECRET_KEY is set)
 *
 * Sets Supabase session cookies on the response so the client picks up the session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

const LOCKOUT_ATTEMPTS = 3
const LOCKOUT_MINUTES = 30

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // CAPTCHA not configured — skip verification

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  })
  const data = await res.json()
  return data.success === true
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, captchaToken } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // 1. Verify CAPTCHA (if configured)
    if (captchaToken) {
      const valid = await verifyTurnstile(captchaToken)
      if (!valid) {
        return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 })
      }
    }

    // 2. Check lockout via service client (bypasses RLS to read profile by email)
    const svc = createServiceClient()
    const { data: profile } = await svc
      .from('profiles')
      .select('id, failed_login_attempts, lockout_until')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (profile?.lockout_until) {
      const lockoutUntil = new Date(profile.lockout_until)
      if (lockoutUntil > new Date()) {
        const minutesLeft = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000)
        return NextResponse.json(
          {
            error: `Account temporarily locked after too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
            locked: true,
          },
          { status: 423 }
        )
      }
    }

    // 3. Attempt Supabase login (SSR client — sets session cookies on response)
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

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    // 4. Track attempt in DB
    if (profile) {
      if (authError) {
        const newAttempts = (profile.failed_login_attempts ?? 0) + 1
        const lockoutUntil =
          newAttempts >= LOCKOUT_ATTEMPTS
            ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
            : null
        await svc
          .from('profiles')
          .update({
            failed_login_attempts: newAttempts,
            ...(lockoutUntil ? { lockout_until: lockoutUntil } : {}),
          })
          .eq('id', profile.id)
      } else {
        // Success — reset counters
        await svc
          .from('profiles')
          .update({ failed_login_attempts: 0, lockout_until: null })
          .eq('id', profile.id)
      }
    }

    // 5. Return result
    if (authError) {
      const attemptsAfter = (profile?.failed_login_attempts ?? 0) + 1
      const remaining = LOCKOUT_ATTEMPTS - attemptsAfter
      if (remaining <= 0) {
        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
            locked: true,
          },
          { status: 423 }
        )
      }
      return NextResponse.json(
        {
          error: 'Incorrect email or password.',
          attemptsRemaining: remaining > 0 ? remaining : 0,
        },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
