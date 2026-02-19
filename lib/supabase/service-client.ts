/**
 * Supabase service role client — bypasses RLS.
 * Server-only. Never import in Client Components or expose to browser.
 * Use for admin operations and server-to-server actions.
 */
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role configuration')
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
