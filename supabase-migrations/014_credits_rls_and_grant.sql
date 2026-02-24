-- ============================================================================
-- Migration 014: Fix credits table accessibility for authenticated users
-- Created: 2026-02-24
-- Problem: Dashboard shows "2 free" even when credit rows exist with balance > 0.
--          Root cause: credits table is either missing ENABLE ROW LEVEL SECURITY,
--          or missing GRANT SELECT to the authenticated role (or both).
--          The SELECT policy "Users can read own credits" already exists from
--          migration 002, but policies only filter rows — they don't grant
--          permission. You need BOTH a grant AND a policy for RLS to work.
--          Other tables (profiles, subscriptions, reports) are unaffected
--          because their migration 002 setup was complete. Credits was not.
-- Fix:
--   1. Enable RLS on credits (idempotent — safe if already enabled)
--   2. Re-create SELECT policy if missing (idempotent via DO block)
--   3. Re-create service role policy if missing (idempotent via DO block)
--   4. Grant SELECT on credits to authenticated role
-- ============================================================================


-- Step 1: Enable row-level security on credits
-- Safe to run even if already enabled — PostgreSQL ignores no-op ENABLE.
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;


-- Step 2: SELECT policy for authenticated users (read own rows only)
DO $$ BEGIN
  CREATE POLICY "Users can read own credits"
    ON credits FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- Step 3: Full access for service role (bypasses RLS for server-side operations)
DO $$ BEGIN
  CREATE POLICY "Service role full access on credits"
    ON credits FOR ALL
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- Step 4: Grant SELECT to the authenticated role
-- This is required alongside RLS policies — policies filter rows, but
-- without this GRANT the authenticated role has no access at all.
GRANT SELECT ON credits TO authenticated;


-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm fix)
-- ============================================================================
--
-- 1. Confirm RLS is enabled:
--    SELECT tablename, rowsecurity
--    FROM pg_tables
--    WHERE tablename = 'credits' AND schemaname = 'public';
--    -- Expected: rowsecurity = true
--
-- 2. Confirm policies:
--    SELECT policyname, cmd, qual
--    FROM pg_policies
--    WHERE tablename = 'credits' AND schemaname = 'public';
--    -- Expected: "Users can read own credits" (SELECT) + "Service role full access" (ALL)
--
-- 3. Confirm grant:
--    SELECT grantee, privilege_type
--    FROM information_schema.role_table_grants
--    WHERE table_name = 'credits' AND table_schema = 'public';
--    -- Expected: authenticated role has SELECT
--
-- 4. Confirm credits are now visible (replace UUID with real user_id):
--    -- Log into dashboard — should now show credit count instead of "X free"
--
-- ============================================================================
