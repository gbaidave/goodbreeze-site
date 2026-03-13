/**
 * DELETE /api/admin/users/[id]/delete
 *
 * Admin-initiated hard account deletion (superadmin only).
 * Uses a regular API route instead of a Server Action to avoid the automatic
 * Next.js router refresh that Server Actions trigger — that refresh re-renders
 * /admin/users/[id] after the user is gone and causes "Server Components render error".
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { stripe } from '@/lib/stripe'
import { sendAccountDeletedEmail } from '@/lib/email'
import { logSystemError } from '@/lib/log-system-error'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params

  // Auth: superadmin only
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('profiles').select('role, id').eq('id', user.id).single()
  if (!callerProfile || callerProfile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminId = callerProfile.id
  const svc = createServiceClient()

  // Fetch profile for audit record and optional email
  const { data: profile } = await svc
    .from('profiles')
    .select('email, name, stripe_customer_id')
    .eq('id', targetUserId)
    .single()

  const deletedAt = new Date().toISOString()

  // 1. Create deleted_accounts audit record (best-effort)
  const { error: auditError } = await svc.from('deleted_accounts').insert({
    id: targetUserId,
    email: profile?.email ?? '',
    name: profile?.name ?? null,
    stripe_customer_id: profile?.stripe_customer_id ?? null,
    deleted_at: deletedAt,
    deleted_by: adminId,
    deletion_ip: null,
  })
  if (auditError && auditError.code !== '23505') {
    logSystemError('api', `admin deleteAccount — deleted_accounts insert failed: ${auditError.message}`, { targetUserId }, '/api/admin/users/[id]/delete')
  }

  // 2. Copy former_user_id on SET NULL tables (best-effort)
  await Promise.all([
    svc.from('support_requests').update({ former_user_id: targetUserId }).eq('user_id', targetUserId),
    svc.from('support_messages').update({ former_user_id: targetUserId }).eq('sender_id', targetUserId),
    svc.from('refund_requests').update({ former_user_id: targetUserId }).eq('user_id', targetUserId),
    svc.from('email_logs').update({ former_user_id: targetUserId }).eq('user_id', targetUserId),
  ]).catch(() => {})

  // 3. Cancel Stripe subscription
  const { data: activeSub } = await svc
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', targetUserId)
    .in('status', ['active', 'trialing'])
    .maybeSingle()
  if (activeSub?.stripe_subscription_id) {
    await stripe.subscriptions.cancel(activeSub.stripe_subscription_id).catch(console.error)
  }

  // 4. Optionally send deletion confirmation email
  const body = await req.json().catch(() => ({}))
  const sendEmail = body?.sendEmail === true
  if (sendEmail && profile?.email) {
    await sendAccountDeletedEmail(profile.email, profile.name ?? '', deletedAt).catch(console.error)
  }

  // 5. Hard-delete auth user (cascades to profiles and all FK tables)
  const { error: deleteError } = await svc.auth.admin.deleteUser(targetUserId)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message ?? 'Failed to delete user account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
