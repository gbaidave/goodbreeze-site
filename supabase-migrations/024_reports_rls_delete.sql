-- ============================================================================
-- Migration 024: Add RLS DELETE policy for reports table (R4-T5 fix)
-- Created: 2026-03-01
-- ============================================================================
--
-- Problem: Reports won't delete. The reports table has RLS enabled (from
-- migration 002) with SELECT policies for authenticated users, but NO DELETE
-- policy. When the bulk-delete route uses the anon key + user session to call
-- .delete(), Supabase silently filters out all rows (0 deleted, no error).
-- The single-delete route uses the service role and bypasses RLS, so it works
-- at the DB level, but the bulk-delete path fails silently.
--
-- Fix: Add a DELETE policy so authenticated users can delete their own reports.
-- This mirrors the pattern used for credits in migration 013.
--
-- Safe to re-run: CREATE POLICY IF NOT EXISTS pattern.
-- ============================================================================

DO $$ BEGIN
  CREATE POLICY "Users can delete own reports"
    ON reports FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================================
-- Also ensure users can SELECT their own reports (belt-and-suspenders check).
-- This should already exist from migration 002, but if it was missed it would
-- explain why the ownership check in the single-delete route fails.
-- ============================================================================

DO $$ BEGIN
  CREATE POLICY "Users can read own reports"
    ON reports FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm success)
-- ============================================================================
--
-- 1. Confirm DELETE policy exists:
--    SELECT policyname, cmd FROM pg_policies
--    WHERE tablename = 'reports' AND cmd = 'DELETE';
--    -- Should show: "Users can delete own reports"
--
-- 2. Test manually (substitute a real user UUID and report UUID):
--    -- As the anon key + user JWT, run:
--    -- DELETE FROM reports WHERE id = '<report_id>' AND user_id = '<user_id>';
--    -- Should delete 1 row.
--
-- 3. Test bulk delete in app — "Delete all reports" button should work.
--
