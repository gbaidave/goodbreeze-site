/**
 * POST /api/auth/login
 *
 * Server-side login with:
 *  - Cloudflare Turnstile CAPTCHA verification (when TURNSTILE_SECRET_KEY is set)
 *  - Rolling 30-min failure window: 3 failures within the window → lockout
 *  - Escalating lockouts: 30min → 60min → contact support (permanent until manually unlocked)
 *  - All counters reset on successful login
 *
 * Sets Supabase session cookies on the response so the client picks up the session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { logSystemError } from '@/lib/log-system-error'

const LOCKOUT_ATTEMPTS = 3
const WINDOW_MINUTES   = 30

/** Returns lockout duration in minutes, or null for permanent (support) lock. */
function getLockoutDuration(lockoutCount: number): number | null {
  if (lockoutCount <= 1) return 30
  if (lockoutCount === 2) return 60
  return null // 3rd+ lockout: contact support
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, captchaToken } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // 1. CAPTCHA presence check.
    // Do NOT verify the token here — Cloudflare tokens are single-use, and Supabase
    // also calls Cloudflare's siteverify when captchaToken is passed to signInWithPassword.
    // Calling verifyTurnstile() here first consumes the token, so Supabase's verification
    // always fails and the error surfaces as "Invalid login credentials."
    // Correct pattern: presence check only here, let Supabase do the one verification.
    if (process.env.TURNSTILE_SECRET_KEY && !captchaToken) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 })
    }

    // 2. Load profile (bypasses RLS to read lockout state by email)
    const svc = createServiceClient()
    const { data: profile } = await svc
      .from('profiles')
      .select('id, failed_login_attempts, lockout_until, lockout_count, window_start_at')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    // 3. Check active lockout
    if (profile?.lockout_until) {
      const lockoutUntil = new Date(profile.lockout_until)
      if (lockoutUntil > new Date()) {
        if ((profile.lockout_count ?? 0) >= 3) {
          return NextResponse.json(
            {
              error: 'Account locked due to repeated failed attempts. Please contact support at support@goodbreeze.ai to unlock your account.',
              locked: true,
              supportLock: true,
            },
            { status: 423 }
          )
        }
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

    // 4. Determine effective failure count (reset if rolling window has expired)
    const windowStart = profile?.window_start_at ? new Date(profile.window_start_at) : null
    const windowExpired = !windowStart || (Date.now() - windowStart.getTime()) > WINDOW_MINUTES * 60 * 1000
    const currentAttempts = windowExpired ? 0 : (profile?.failed_login_attempts ?? 0)

    // 5. Attempt Supabase login (SSR client — sets session cookies on response)
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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    })

    // 6. Update lockout state in DB
    if (authError) {
      // TEMP DEBUG — remove after diagnosis
      await svc.from('system_errors').insert({ type: 'auth', message: authError.message ?? 'unknown', context: { code: (authError as any).code, status: authError.status, name: authError.name }, route: '/api/auth/login' }).then(() => {})
    }
    if (profile) {
      if (authError) {
        const newAttempts = currentAttempts + 1
        const newWindowStart = windowExpired
          ? new Date().toISOString()
          : (profile.window_start_at ?? new Date().toISOString())

        if (newAttempts >= LOCKOUT_ATTEMPTS) {
          // Trigger lockout — increment lockout_count and set duration
          const newLockoutCount = (profile.lockout_count ?? 0) + 1
          const duration = getLockoutDuration(newLockoutCount)
          const lockoutUntil = duration !== null
            ? new Date(Date.now() + duration * 60 * 1000).toISOString()
            : new Date('2099-01-01T00:00:00Z').toISOString() // permanent until support unlocks

          await svc
            .from('profiles')
            .update({
              failed_login_attempts: 0,
              window_start_at: null,
              lockout_until: lockoutUntil,
              lockout_count: newLockoutCount,
            })
            .eq('id', profile.id)

          if (newLockoutCount >= 3) {
            return NextResponse.json(
              {
                error: 'Account locked due to repeated failed attempts. Please contact support at support@goodbreeze.ai to unlock your account.',
                locked: true,
                supportLock: true,
              },
              { status: 423 }
            )
          }
          return NextResponse.json(
            {
              error: `Too many failed attempts. Account locked for ${duration} minutes.`,
              locked: true,
            },
            { status: 423 }
          )
        } else {
          // Increment failure count within the rolling window
          await svc
            .from('profiles')
            .update({
              failed_login_attempts: newAttempts,
              window_start_at: newWindowStart,
            })
            .eq('id', profile.id)
        }
      } else {
        // Success — reset all lockout state including escalation counter
        await svc
          .from('profiles')
          .update({
            failed_login_attempts: 0,
            lockout_until: null,
            lockout_count: 0,
            window_start_at: null,
          })
          .eq('id', profile.id)
      }
    }

    // 7. Return result
    if (authError) {
      const remaining = LOCKOUT_ATTEMPTS - (currentAttempts + 1)
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
    logSystemError('auth', String(error), { stack: (error as Error)?.stack }, '/api/auth/login')
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
