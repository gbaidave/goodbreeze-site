-- ============================================================================
-- Good Breeze AI - Account Lockout (T4-11)
-- Migration: 010_account_lockout.sql
-- Created: 2026-02-25
-- Run AFTER: 003_phase0_additions.sql (profiles table)
-- ============================================================================
--
-- Adds login attempt tracking to profiles table.
-- After 3 failed login attempts, the account is locked for 30 minutes.
-- Enforced server-side via /api/auth/login route.
--
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN profiles.failed_login_attempts IS
  'Number of consecutive failed login attempts since last success. Resets to 0 on successful login.';

COMMENT ON COLUMN profiles.lockout_until IS
  'Account locked until this time after 3 failed attempts. NULL = not locked. Set to NOW() + 30min on 3rd failure.';

CREATE INDEX IF NOT EXISTS idx_profiles_lockout_until ON profiles(lockout_until)
  WHERE lockout_until IS NOT NULL;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
--
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'profiles'
--   AND column_name IN ('failed_login_attempts', 'lockout_until');
--
-- ============================================================================
