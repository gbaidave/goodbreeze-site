'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service-client'
import { createClient } from '@/lib/supabase/server'
import { sendCreditGrantedEmail, sendAccountDeletedEmail } from '@/lib/email'
import { logSystemError } from '@/lib/log-system-error'
import { stripe } from '@/lib/stripe'
import { canDo, assignableRoles } from '@/lib/permissions'

// Guard: caller must have view_users permission (admin or superadmin)
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', user.id).single()
  if (!canDo(profile?.role, 'view_users') || !profile) throw new Error('Forbidden')
  return { adminId: profile.id, callerRole: profile.role as string }
}

// Guard: caller must be superadmin
async function requireSuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', user.id).single()
  if (!profile || profile.role !== 'superadmin') throw new Error('Forbidden')
  return { adminId: profile.id }
}

// ---- Role ---------------------------------------------------------------

export async function setUserRole(userId: string, role: string) {
  const { callerRole } = await requireAdmin()
  // Enforce role cap: admin can only assign roles in their assignable list
  const allowed = assignableRoles(callerRole)
  if (!allowed.includes(role as any)) throw new Error('You do not have permission to assign that role.')
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

// ---- Plan override (superadmin only) ------------------------------------

export async function setPlanOverride(userId: string, overrideType: string | null, overrideUntil: string | null) {
  await requireSuperadmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_override_type: overrideType,
      plan_override_until: overrideUntil,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

// ---- Credits ------------------------------------------------------------

export async function grantCredits(userId: string, amount: number, note: string) {
  const { adminId } = await requireAdmin()
  if (amount <= 0 || amount > 100) throw new Error('Amount must be 1–100')
  if (!note.trim()) throw new Error('Note is required for credit grants')
  const supabase = createServiceClient()

  // Insert the credit row with source tracking
  const { error: creditsError } = await supabase.from('credits').insert({
    user_id: userId,
    balance: amount,
    source: 'admin_grant',
    product: null,      // usable on any product
    expires_at: null,   // no expiry for admin grants
  })
  if (creditsError) throw new Error(creditsError.message)

  // Create an admin_notes entry so there is always a paper trail
  const { error: noteError } = await supabase.from('admin_notes').insert({
    user_id: userId,
    note: `[Credit grant: ${amount} credit${amount !== 1 ? 's' : ''}] ${note.trim()}`,
    created_by: adminId,
  })
  if (noteError) throw new Error(noteError.message)

  // Bell notification for the user
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'referral_credit',
    message: `The Good Breeze AI team added ${amount} free credit${amount !== 1 ? 's' : ''} to your account.`,
  }).then(({ error }) => {
    if (error) console.error('[grantCredits] notification error:', error)
  })

  // Email notification (fire and forget)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .single()
  if (profile?.email) {
    sendCreditGrantedEmail(profile.email, profile.name || profile.email, amount, userId)
      .catch((err) => console.error('[grantCredits] email error:', err))
  }

  revalidatePath(`/admin/users/${userId}`)
}

export async function deductCredits(userId: string, amount: number, note: string) {
  const { adminId } = await requireAdmin()
  if (amount <= 0 || amount > 100) throw new Error('Amount must be 1–100')
  if (!note.trim()) throw new Error('Note is required for credit deductions')
  const supabase = createServiceClient()

  // Deduct from pack/earned credits first (oldest non-expired rows)
  const { data: rows } = await supabase
    .from('credits')
    .select('id, balance')
    .eq('user_id', userId)
    .gt('balance', 0)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('purchased_at', { ascending: true })

  let remaining = amount
  for (const row of rows ?? []) {
    if (remaining <= 0) break
    const take = Math.min(row.balance, remaining)
    await supabase.from('credits').update({ balance: row.balance - take }).eq('id', row.id)
    remaining -= take
  }

  // If pack credits were insufficient, deduct remainder from subscription plan credits
  if (remaining > 0) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, credits_remaining')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (sub && (sub.credits_remaining ?? 0) > 0) {
      const take = Math.min(sub.credits_remaining ?? 0, remaining)
      await supabase
        .from('subscriptions')
        .update({ credits_remaining: (sub.credits_remaining ?? 0) - take })
        .eq('id', sub.id)
      remaining -= take
    }
  }

  // Log to admin_notes for audit trail
  await supabase.from('admin_notes').insert({
    user_id: userId,
    note: `[Credit deduction: ${amount} credit${amount !== 1 ? 's' : ''}] ${note.trim()}`,
    created_by: adminId,
  })

  revalidatePath(`/admin/users/${userId}`)
}

// ---- Admin notes --------------------------------------------------------

export async function addNote(userId: string, note: string) {
  const { adminId } = await requireAdmin()
  if (!note.trim()) throw new Error('Note cannot be empty')
  const supabase = createServiceClient()
  const { error } = await supabase.from('admin_notes').insert({
    user_id: userId,
    note: note.trim(),
    created_by: adminId,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

export async function deleteNote(noteId: string, userId: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from('admin_notes').delete().eq('id', noteId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

// ---- Account management -------------------------------------------------

export async function updateEmail(userId: string, email: string) {
  await requireAdmin()
  if (!email.trim()) throw new Error('Email cannot be empty')
  const supabase = createServiceClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email: email.trim(),
    email_confirm: true,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

export async function updatePhone(userId: string, phone: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ phone: phone.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

export async function suspendAccount(userId: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', // ~100 years
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

export async function unsuspendAccount(userId: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

export async function deleteAccount(userId: string, sendEmail = false) {
  const { adminId } = await requireSuperadmin()
  const svc = createServiceClient()

  try {
    // Fetch profile for audit record and optional email
    const { data: profile } = await svc
      .from('profiles')
      .select('email, name, stripe_customer_id')
      .eq('id', userId)
      .single()

    const deletedAt = new Date().toISOString()

    // 1. Create deleted_accounts audit record (best-effort — ignore duplicate key)
    const { error: auditError } = await svc.from('deleted_accounts').insert({
      id: userId,
      email: profile?.email ?? '',
      name: profile?.name ?? null,
      stripe_customer_id: profile?.stripe_customer_id ?? null,
      deleted_at: deletedAt,
      deleted_by: adminId,
      deletion_ip: null,
    })
    if (auditError && auditError.code !== '23505') {
      // Log non-duplicate errors but don't block deletion
      logSystemError('api', `admin deleteAccount — deleted_accounts insert failed: ${auditError.message}`, { userId }, '/admin/users/[id]')
    }

    // 2. Copy former_user_id on SET NULL tables (best-effort)
    await Promise.all([
      svc.from('support_requests').update({ former_user_id: userId }).eq('user_id', userId),
      svc.from('support_messages').update({ former_user_id: userId }).eq('sender_id', userId),
      svc.from('refund_requests').update({ former_user_id: userId }).eq('user_id', userId),
      svc.from('email_logs').update({ former_user_id: userId }).eq('user_id', userId),
    ]).catch(() => {})

    // 3. Cancel Stripe subscription
    const { data: activeSub } = await svc
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle()
    if (activeSub?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(activeSub.stripe_subscription_id).catch(console.error)
    }

    // 4. Optionally send deletion confirmation email
    if (sendEmail && profile?.email) {
      await sendAccountDeletedEmail(profile.email, profile.name ?? '', deletedAt).catch(console.error)
    }

    // 5. Hard-delete auth user (cascades to profiles and all FK tables)
    const { error: deleteError } = await svc.auth.admin.deleteUser(userId)
    if (deleteError) {
      throw new Error(deleteError.message ?? 'Failed to delete user account')
    }
  } catch (err: unknown) {
    // Normalize any error to a plain string message so Next.js can serialize it
    // back to the client without triggering a Server Components render error
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(msg)
  }
}
