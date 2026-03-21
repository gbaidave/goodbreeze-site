/**
 * Bell notification helpers.
 *
 * insertBellIfAllowed — insert a bell notification only if the user has the
 * relevant preference enabled. Preferences default to true when not set
 * (prefs[prefKey] !== false).
 *
 * Pass prefKey=undefined to always insert (e.g. admin-facing operational bells).
 */

import { SupabaseClient } from '@supabase/supabase-js'

export async function insertBellIfAllowed(
  svc: SupabaseClient,
  userId: string,
  notification: { type: string; message: string },
  prefKey?: string
): Promise<void> {
  if (prefKey) {
    const { data: profile } = await svc
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single()
    const prefs = (profile?.notification_preferences as Record<string, boolean> | null) ?? {}
    if (prefs[prefKey] === false) return
  }
  const { error } = await svc.from('notifications').insert({
    user_id: userId,
    ...notification,
  })
  if (error) console.error(`[bell-notifications] insert error (${notification.type}):`, error)
}
