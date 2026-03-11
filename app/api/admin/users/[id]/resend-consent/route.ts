/**
 * POST /api/admin/users/[id]/resend-consent
 *
 * Admin-only endpoint to resend the media release confirmation email to a user.
 * Body: { consent_id: string }
 *
 * Looks up the consent record, re-sends the confirmation email,
 * and updates confirmation_sent_at.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'
import { sendConsentConfirmationEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params

  // Authenticate actor
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const svc = createServiceClient()
  const { data: actorProfile } = await svc.from('profiles').select('role').eq('id', user.id).single()
  if (!canDo(actorProfile?.role, 'approve_testimonials')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json()
  const { consent_id } = body as { consent_id: string }
  if (!consent_id) return NextResponse.json({ error: 'consent_id required' }, { status: 400 })

  // Fetch the consent record (must belong to the target user)
  const { data: consent } = await svc
    .from('testimonial_consents')
    .select('id, user_id, email, name, ip_address, user_agent, consent_text_version, consent_text, consented_at')
    .eq('id', consent_id)
    .eq('user_id', targetUserId)
    .single()

  if (!consent) return NextResponse.json({ error: 'Consent record not found' }, { status: 404 })

  // Re-send the confirmation email
  await sendConsentConfirmationEmail(
    {
      userName: consent.name,
      userEmail: consent.email,
      ipAddress: consent.ip_address ?? '',
      userAgent: consent.user_agent ?? '',
      consentTextVersion: consent.consent_text_version,
      consentText: consent.consent_text,
      consentedAt: consent.consented_at,
    },
    targetUserId
  )

  // Update confirmation_sent_at
  await svc
    .from('testimonial_consents')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('id', consent_id)

  return NextResponse.json({ success: true })
}
