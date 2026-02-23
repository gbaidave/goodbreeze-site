-- ============================================================================
-- UTILITY: Hard-Delete a Test Account
-- ============================================================================
-- Use this when you need to reuse a test email address.
-- The Supabase dashboard delete button soft-deletes (sets deleted_at but keeps
-- the auth.users row), which prevents re-registration. This script does a
-- true hard-delete so the email is completely free.
--
-- HOW TO USE:
--   1. Open Supabase SQL Editor
--   2. Replace the email on line 17
--   3. Run both statements
--   4. The email can now re-register normally
-- ============================================================================

DELETE FROM auth.users   WHERE email = 'your-test@email.com';   -- ← CHANGE THIS
DELETE FROM public.profiles WHERE email = 'your-test@email.com'; -- ← CHANGE THIS

-- auth.users DELETE cascades to:
--   auth.identities, auth.sessions, auth.refresh_tokens, auth.mfa_*
-- public.profiles DELETE cascades to:
--   subscriptions, credits, reports, referral_codes, notifications, admin_notes
-- email_logs and support_requests are SET NULL (audit trail preserved)
