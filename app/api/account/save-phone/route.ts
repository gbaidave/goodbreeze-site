/**
 * POST /api/account/save-phone
 *
 * Server-side phone save with deduplication check + password verification (T4-3).
 * Used by AccountClient (account settings) and PhoneGatePrompt (report gate).
 *
 * Checks that no OTHER profile already has this phone number before saving.
 * When currentPassword is provided, verifies it matches the account password.
 * Client-side Supabase can't do cross-user queries (RLS restricts them).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { isValidPhone, normalizePhone } from '@/lib/phone'

export async function POST(request: NextRequest) {
  try {
    const { phone, currentPassword } = await request.json()

    // 1. Authenticate
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

    // 2. Verify current password when provided (T4-3)
    if (currentPassword) {
      const { error: pwError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })
      if (pwError) {
        return NextResponse.json(
          { error: 'Current password is incorrect.', code: 'WRONG_PASSWORD' },
          { status: 401 }
        )
      }
    }

    // 4. Allow clearing phone (empty string = remove)
    if (!phone || !phone.trim()) {
      const svc = createServiceClient()
      await svc.from('profiles').update({ phone: null }).eq('id', user.id)
      return NextResponse.json({ success: true })
    }

    // 5. Validate format
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Enter a valid phone number (e.g. +1 555 000 0000)', code: 'INVALID_PHONE' },
        { status: 400 }
      )
    }

    const normalized = normalizePhone(phone)

    // 6. Dedup check — service client bypasses RLS to check all profiles
    const svc = createServiceClient()
    const { data: existing } = await svc
      .from('profiles')
      .select('id')
      .eq('phone', normalized)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        {
          error: 'This phone number is already linked to another account. Sign in to your existing account or use a different number.',
          code: 'PHONE_DUPLICATE',
        },
        { status: 409 }
      )
    }

    // 7. Save
    const { error: updateError } = await svc
      .from('profiles')
      .update({ phone: normalized })
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('save-phone error:', error)
    return NextResponse.json({ error: 'Failed to save phone number. Please try again.' }, { status: 500 })
  }
}
