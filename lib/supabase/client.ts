/**
 * Supabase browser client — use in Client Components ('use client')
 * Install: npm install @supabase/ssr
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktvomvlweyqxxewuqubw.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7qyb5bsE75AEnNLZaTtk8A_7o4GOO-3'
  return createBrowserClient(url, key)
}
