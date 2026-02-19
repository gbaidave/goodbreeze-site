-- ============================================================================
-- Good Breeze AI - Phase 0: DB Schema Additions
-- Migration: 003_phase0_additions.sql
-- Created: 2026-02-19
-- Run AFTER: 002_saas_tables.sql (profiles, subscriptions, credits, reports, etc.)
-- ============================================================================
-- Adds:
--
-- Profiles additions:
--   - phone                  (user identification + future SMS; NOT OTP auth)
--   - prior_plan             (plan before most recent downgrade/cancellation)
--   - plan_override_type     (admin-set temporary plan, e.g. 'starter' for beta testers)
--   - plan_override_until    (expiry of plan_override_type; NULL = no override)
--   - free_reports_used      (JSONB — tracks which 1-free-per-system reports consumed)
--
-- Note on is_admin / is_tester:
--   These are NOT separate columns. The existing role ENUM from 002 handles this:
--     role = 'admin'                  → has admin access
--     role IN ('tester', 'admin')     → bypasses all entitlement checks
--   The is_admin() and is_tester() helper functions remain the correct check pattern.
--
-- New tables:
--   - admin_notes            (internal notes on users, written by admins)
--   - email_logs             (every Resend send attempt, success + fail)
--   - support_requests       (user "Get Help" submissions)
--   - notifications          (in-app bell notifications)
--   - referral_codes         (one per user, auto-generated on signup)
--   - referral_uses          (each signup that came via a referral link)
-- ============================================================================


-- ============================================================================
-- ENUMS (new — wrapped in DO blocks to be safe on re-run)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE email_type AS ENUM (
    'report_ready',
    'magic_link',
    'nudge_exhausted',
    'support_confirmation',
    'referral_credit',
    'testimonial_credit',
    'welcome',
    'plan_changed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('sent', 'failed', 'bounced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'email_failed',
    'testimonial_credit',
    'referral_credit',
    'report_ready',
    'report_failed',
    'plan_changed',
    'admin_message'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================================
-- PROFILES — new columns
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS prior_plan plan_type,
  ADD COLUMN IF NOT EXISTS plan_override_type plan_type,
  ADD COLUMN IF NOT EXISTS plan_override_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS free_reports_used JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN profiles.phone IS
  'Phone number for user identification + future SMS notifications. NOT used for OTP auth.';

COMMENT ON COLUMN profiles.prior_plan IS
  'Plan before most recent downgrade or cancellation. Shown in admin panel for context.';

COMMENT ON COLUMN profiles.plan_override_type IS
  'Admin-set temporary plan override. e.g. starter granted to beta testers as reward.';

COMMENT ON COLUMN profiles.plan_override_until IS
  'When the plan_override_type expires. NULL = no override currently active.';

COMMENT ON COLUMN profiles.free_reports_used IS
  'Tracks consumed 1-free-per-system entitlements. Keys = system name, values = report_type used.
   e.g. {"analyzer": "h2h", "brand_visibility": "seo_audit"}
   Free allowed: analyzer (h2h or t3c), brand_visibility (seo_audit or landing_page).';

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_override_until ON profiles(plan_override_until);


-- ============================================================================
-- ADMIN_NOTES
-- ============================================================================
-- Internal notes on users. Written by admins in the admin panel.
-- Not visible to users. Soft audit trail for manual actions.
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_notes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note          TEXT NOT NULL,
  created_by    UUID NOT NULL REFERENCES profiles(id),   -- admin who wrote the note
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id    ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_by ON admin_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at);

COMMENT ON TABLE admin_notes IS
  'Internal admin notes on users. Written in /admin panel. Not visible to users.';

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_notes"
  ON admin_notes FOR ALL
  USING (is_admin());

CREATE POLICY "Service role full access on admin_notes"
  ON admin_notes FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- EMAIL_LOGS
-- ============================================================================
-- Every Resend send attempt logged here (success and failure).
-- Powers the per-user email history in /admin and failed-send notifications.
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL, -- null if user deleted
  to_email    TEXT NOT NULL,
  type        email_type NOT NULL,
  subject     TEXT NOT NULL,
  status      email_status NOT NULL DEFAULT 'sent',
  error       TEXT,                   -- error message if status = 'failed'
  resend_id   TEXT,                   -- Resend message ID for tracking/debugging
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id   ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type      ON email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status    ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

COMMENT ON TABLE email_logs IS
  'Every Resend send attempt. status=failed triggers a user notification (see notifications table).';

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all email_logs"
  ON email_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "Service role full access on email_logs"
  ON email_logs FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- SUPPORT_REQUESTS
-- ============================================================================
-- User-submitted support requests from the "Get Help" form in /dashboard and /account.
-- On submit: emails support@goodbreeze.ai + writes this row.
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_requests (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email                TEXT NOT NULL,
  plan_at_time         TEXT,          -- snapshot of plan at time of submission (for context)
  last_report_context  TEXT,          -- last report type + status at time of submission
  message              TEXT NOT NULL,
  status               support_status NOT NULL DEFAULT 'open',
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_user_id    ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status     ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);

COMMENT ON TABLE support_requests IS
  'User support submissions. Also emailed to support@goodbreeze.ai on submit.
   Status managed by admin in /admin panel.';

CREATE TRIGGER support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit support_requests"
  ON support_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own support_requests"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can update support_requests"
  ON support_requests FOR UPDATE
  USING (is_admin());

CREATE POLICY "Service role full access on support_requests"
  ON support_requests FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
-- In-app notifications surfaced in the nav bell icon + /notifications page.
-- Written by server-side code when key events occur (failed email, credits granted, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read       ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

COMMENT ON TABLE notifications IS
  'In-app notifications shown in nav bell icon dropdown and /notifications page.
   Written on: email_failed, testimonial_credit, referral_credit, report_failed, plan_changed.';

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- REFERRAL_CODES
-- ============================================================================
-- Simple user-to-user referral codes. One per user, auto-generated on signup.
-- Used in /ref/[code] landing pages.
-- Separate from the formal affiliates table (which is commission-based + admin-approved).
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE,   -- e.g. "DAVE1234" — human-readable slug
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code    ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);

COMMENT ON TABLE referral_codes IS
  'One referral code per user. Auto-generated on signup. Used in /ref/[code] landing pages.
   Referrer earns 1 free report credit per signup via their link (see referral_uses).';

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral_code"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on referral_codes"
  ON referral_codes FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- REFERRAL_USES
-- ============================================================================
-- One row per signup that came through a referral link.
-- reward_granted flips to true once the 1 free report credit is auto-granted to referrer.
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_uses (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id  UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  new_user_id       UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- UNIQUE on new_user_id: each user can only be attributed to one referral
  reward_granted    BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_uses_referral_code_id ON referral_uses(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_new_user_id      ON referral_uses(new_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_reward_granted   ON referral_uses(reward_granted);

COMMENT ON TABLE referral_uses IS
  'Tracks each signup attributed to a referral code.
   reward_granted = true once 1 free report credit auto-granted to referrer.
   new_user_id is UNIQUE — each user can only be attributed to one referral.';

ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read referral_uses for their own code"
  ON referral_uses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM referral_codes
      WHERE id = referral_uses.referral_code_id
        AND user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Service role full access on referral_uses"
  ON referral_uses FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- HELPER: Auto-generate referral code on signup
-- ============================================================================
-- Updates handle_new_user() from 002 to also create a referral_codes row.
-- Format: first 6 alpha chars of email prefix (uppercased) + 4-digit random number.
-- e.g. dave@goodbreeze.ai → DAVE1234
-- ============================================================================

-- Step 1: Code generator function
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID, p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code    TEXT;
  v_prefix  TEXT;
  v_attempt INT := 0;
BEGIN
  -- Derive prefix: alpha chars from email local part, max 6, uppercase
  v_prefix := upper(regexp_replace(split_part(p_email, '@', 1), '[^a-zA-Z]', '', 'g'));
  v_prefix := left(v_prefix, 6);

  -- Fallback for very short / non-alpha email prefixes
  IF length(v_prefix) < 2 THEN
    v_prefix := 'USER';
  END IF;

  -- Try prefix + random 4-digit number; retry on collision (max 10 tries)
  LOOP
    v_code := v_prefix || lpad(floor(random() * 9000 + 1000)::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM referral_codes WHERE code = v_code);
    v_attempt := v_attempt + 1;
    IF v_attempt >= 10 THEN
      -- Ultimate fallback: first 8 chars of a UUID (always unique enough)
      v_code := upper(substring(gen_random_uuid()::text FROM 1 FOR 8));
      EXIT;
    END IF;
  END LOOP;

  RETURN v_code;
END;
$$;


-- Step 2: Replace handle_new_user() to include referral code creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Create profile row
  INSERT INTO public.profiles (id, email, name, marketing_opt_in)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'marketing_opt_in')::boolean,
      true
    )
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create free subscription row
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;

  -- Generate and store referral code
  v_referral_code := generate_referral_code(NEW.id, NEW.email);
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, v_referral_code)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger already exists from 002 — no need to recreate


-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm success)
-- ============================================================================
--
-- 1. New profile columns:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'profiles'
--    AND column_name IN ('phone', 'prior_plan', 'plan_override_type', 'plan_override_until', 'free_reports_used');
--
-- 2. New tables:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public'
--    AND table_name IN ('admin_notes','email_logs','support_requests','notifications','referral_codes','referral_uses')
--    ORDER BY table_name;
--
-- 3. Test referral code generation (simulate new signup by checking the function):
--    SELECT generate_referral_code(gen_random_uuid(), 'dave@goodbreeze.ai');
--    -- Expected: something like 'DAVE4729'
--
-- ============================================================================
