-- Migration 022: Add email_preferences to profiles
-- Created: 2026-02-28
--
-- Adds a JSONB column storing per-user email notification preferences.
-- Three user-controllable flags (all enabled by default):
--   nudge_emails    — credits-exhausted / upgrade nudge emails
--   support_emails  — support ticket replies, resolved, closed
--   referral_credit — credit award notifications
--
-- Mandatory emails that are NEVER suppressed:
--   welcome, plan_changed, magic_link, security_alert
--
-- No enum changes needed — single-step migration.
--
-- HOW TO RUN:
--   Paste into Supabase SQL Editor and click Run.
--
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_preferences JSONB NOT NULL
    DEFAULT '{"nudge_emails":true,"support_emails":true,"referral_credit":true}'::jsonb;

-- Verification:
-- SELECT id, email_preferences FROM profiles LIMIT 5;
-- All rows should show: {"nudge_emails": true, "support_emails": true, "referral_credit": true}
