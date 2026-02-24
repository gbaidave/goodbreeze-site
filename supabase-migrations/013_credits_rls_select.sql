-- ============================================================================
-- Migration 013: Add RLS SELECT policy for credits table
-- Created: 2026-02-23
-- Problem: Credits rows exist in DB but dashboard can't read them.
--          Dashboard uses anon key + user session (not service role), so
--          it is blocked by RLS unless a SELECT policy exists.
--          Admin panel uses service role — unaffected by this gap.
-- Fix: Allow authenticated users to SELECT their own credit rows.
-- ============================================================================

CREATE POLICY "Users can read own credits"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);
