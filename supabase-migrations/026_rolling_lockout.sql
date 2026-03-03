-- Migration 026: Rolling window lockout with escalating durations
--
-- Adds two columns to profiles to support:
--   - Rolling 30-min failure window (window_start_at)
--   - Escalating lockout durations: 30min → 60min → contact support (lockout_count)
--
-- lockout_count resets to 0 on successful login.
-- window_start_at tracks when the current failure run started;
--   if older than 30 min, failures are wiped and the window restarts.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lockout_count    integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS window_start_at  timestamptz;

-- Existing rows: lockout_count = 0 (no history), window_start_at = NULL (treated as expired window).
-- This means anyone currently stuck in the old "permanent" failure state
-- will get a clean slate on their next login attempt.
COMMENT ON COLUMN profiles.lockout_count   IS 'Number of lockout events since last successful login. 1=30min, 2=60min, >=3=support lock.';
COMMENT ON COLUMN profiles.window_start_at IS 'Timestamp of first failure in the current rolling 30-min window. NULL = no active window.';
