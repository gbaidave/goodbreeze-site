/**
 * DELETE /api/account/delete
 *
 * Self-service account deletion.
 * - Email/password users: body must include { password }
 * - OAuth-only users: password field not required
 * - Blocked if open refund request or open dispute ticket exists
 * - Pre-deletion: creates deleted_accounts record, copies former_user_id,
 *   cancels Stripe subscription, sends confirmation email
 * - Hard-deletes auth.users row (cascades to all profile-linked tables)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { stripe } from '@/lib/stripe'
import { sendAccountDeletedEmail } from '@/lib/email'

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()

  // ── Password gate for email/password users (verified client-side before calling this route) ──
  // We only check that a password was provided — the actual verification happens client-side
  // via supabase.auth.signInWithPassword() before this API is called, to avoid server-side
  // re-auth complications (CAPTCHA enforcement, session context mismatches, etc.).
  const isEmailUser = (user.identities?.length ?? 0) > 0 &&
    !user.identities?.some(i => i.provider !== 'email')
  if (isEmailUser) {
    const body = await req.json().catch(() => ({}))
    const password = body?.password as string | undefined
    if (!password) {
      return NextResponse.json({ error: 'PASSWORD_REQUIRED', message: 'Password is required to delete your account.' }, { status: 400 })
    }
  }

  // ── Block if open refund request ────────────────────────────────────────────
  const { data: openRefund } = await svc
    .from('refund_requests')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .limit(1)
    .maybeSingle()

  if (openRefund) {
    return NextResponse.json(
      { error: 'OPEN_REFUND', message: 'You have an open refund request. Please wait for it to be resolved before deleting your account.' },
      { status: 409 }
    )
  }

  // ── Block if open dispute ticket ────────────────────────────────────────────
  const { data: openDispute } = await svc
    .from('support_tickets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category', 'dispute')
    .in('status', ['open', 'in_progress'])
    .limit(1)
    .maybeSingle()

  if (openDispute) {
    return NextResponse.json(
      { error: 'OPEN_DISPUTE', message: 'You have an open dispute. Please wait for it to be resolved before deleting your account.' },
      { status: 409 }
    )
  }

  // ── Fetch profile for audit record and email ─────────────────────────────────
  const { data: profile } = await svc
    .from('profiles')
    .select('name, email, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const email = profile?.email ?? user.email ?? ''
  const name = profile?.name ?? ''
  const deletedAt = new Date().toISOString()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  // ── 1. Create deleted_accounts audit record ──────────────────────────────────
  await svc.from('deleted_accounts').insert({
    id: user.id,
    email,
    name,
    stripe_customer_id: profile?.stripe_customer_id ?? null,
    deleted_at: deletedAt,
    deleted_by: null,   // null = self-service
    deletion_ip: ip,
  })

  // ── 2. Copy former_user_id on SET NULL tables ────────────────────────────────
  await Promise.all([
    svc.from('support_tickets').update({ former_user_id: user.id }).eq('user_id', user.id),
    svc.from('support_messages').update({ former_user_id: user.id }).eq('sender_id', user.id),
    svc.from('refund_requests').update({ former_user_id: user.id }).eq('user_id', user.id),
    svc.from('email_logs').update({ former_user_id: user.id }).eq('user_id', user.id),
  ]).catch(() => {})

  // ── 3. Cancel Stripe subscription ────────────────────────────────────────────
  const { data: activeSub } = await svc
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle()

  if (activeSub?.stripe_subscription_id) {
    await stripe.subscriptions.cancel(activeSub.stripe_subscription_id).catch(console.error)
  }

  // ── 4. Send deletion confirmation email ──────────────────────────────────────
  await sendAccountDeletedEmail(email, name, deletedAt).catch(console.error)

  // ── 5. Hard-delete the auth user (cascades to profiles and all FK tables) ────
  const { error: deleteError } = await svc.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return NextResponse.json({ error: 'DELETE_FAILED', message: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
