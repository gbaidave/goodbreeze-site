-- Migration 051: Fix priority column on support_requests
--
-- ROOT CAUSE: Migration 029 added the priority column as:
--   TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high'))
-- Migration 048 tried to fix this with ADD COLUMN IF NOT EXISTS, but the
-- IF NOT EXISTS clause silently skipped the entire statement (column already
-- existed). The 029 constraint was never replaced.
--
-- Result: every admin attempt to set priority to 'medium', 'low', or 'critical'
-- failed at the DB level (CHECK constraint violation), causing the API to return
-- 500 and the inline dropdown to immediately roll back.
--
-- This migration:
--   1. Drops the old CHECK constraint from 029 (allows only 'normal', 'high')
--   2. Drops the NOT NULL constraint
--   3. Removes the DEFAULT 'normal'
--   4. Adds the correct CHECK constraint (null + low/medium/high/critical)
--   5. Cleans up existing 'normal' rows → NULL
--
-- Safe to run on production even if 048 was already run there (048 was a no-op).
-- ============================================================

-- Step 1: Drop old CHECK constraint from migration 029
ALTER TABLE public.support_requests
  DROP CONSTRAINT IF EXISTS support_requests_priority_check;

-- Step 2: Drop NOT NULL
ALTER TABLE public.support_requests
  ALTER COLUMN priority DROP NOT NULL;

-- Step 3: Remove the 'normal' default
ALTER TABLE public.support_requests
  ALTER COLUMN priority SET DEFAULT NULL;

-- Step 4: Clean up existing 'normal' rows BEFORE adding new constraint
UPDATE public.support_requests
  SET priority = NULL
  WHERE priority = 'normal';

-- Step 5: Add correct CHECK constraint (now safe — no 'normal' rows remain)
ALTER TABLE public.support_requests
  ADD CONSTRAINT support_requests_priority_check
  CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical'));

-- ============================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================
--
-- Check constraint:
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'support_requests'::regclass AND conname = 'support_requests_priority_check';
--
-- Check no 'normal' rows remain:
-- SELECT COUNT(*) FROM support_requests WHERE priority = 'normal';
--
-- Check column is nullable with no default:
-- SELECT column_name, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'support_requests' AND column_name = 'priority';
