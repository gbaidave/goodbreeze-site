/**
 * POST /api/auth/forgot-by-phone
 *
 * Looks up a user by phone number and sends a password reset link
 * to the associated email address.
 *
 * Always returns { success: true } regardless of whether the phone is found
 * to prevent phone number enumeration.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizePhone } from '@/lib/phone'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone?.trim()) {
      return NextResponse.json({ success: true })
    }

    const normalized = normalizePhone(phone.trim())
    const supabase = getServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('phone', normalized)
      .single()

    if (profile?.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goodbreeze.ai'
      await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${siteUrl}/reset-password`,
      })
    }
  } catch {
    // Swallow errors — always return success to prevent enumeration
  }

  return NextResponse.json({ success: true })
}
