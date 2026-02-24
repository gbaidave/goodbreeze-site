'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service-client'
import { createClient } from '@/lib/supabase/server'

// Guard: caller must be admin
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return { adminId: profile.id }
}

// ---- Role ---------------------------------------------------------------

export async function setUserRole(userId: string, role: string) {
  const { adminId } = await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/users/${userId}`)
}

// ---- Plan override ------------------------------------------------------

export async function setPlanOverride(userId: string, overrideType: string | null, overrideUntil: string | null) {
  await requireAdmin()
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

  revalidatePath(`/admin/users/${userId}`)
}

export async function deductCredits(userId: string, amount: number) {
  await requireAdmin()
  if (amount <= 0 || amount > 100) throw new Error('Amount must be 1–100')
  const supabase = createServiceClient()

  // Deduct from oldest non-expired rows first
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

export async function deleteAccount(userId: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  // Profile/reports cascade-deleted via FK or RLS — no revalidatePath needed
}
