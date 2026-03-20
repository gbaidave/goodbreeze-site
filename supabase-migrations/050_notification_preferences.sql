-- 050_notification_preferences.sql
-- Adds notification_preferences JSONB column to profiles for in-app (push) notification settings.
-- Keys mirror email_preferences keys. Absence of a key = default ON (same !== false pattern).
-- SMS preferences are not stored (always off until SMS is implemented).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_preferences IS
  'In-app push notification preferences. Keys: report_ready, nudge_emails, support_emails, support_confirmation, report_failure, referral_credit, testimonial_approved, bug_updates. Absence or true = enabled.';
