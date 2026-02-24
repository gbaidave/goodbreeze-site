-- ============================================================================
-- Good Breeze AI - Credits Remaining + Subscription Acknowledgments
-- Migration: 018_credits_remaining_and_acknowledgments.sql
-- Created: 2026-02-24
--
-- Context: Replaces the usage-table monthly-cap system with a single
-- credits_remaining counter on subscriptions. This counter is the source of
-- truth for how many reports a subscriber has left in the current period.
--
-- Changes:
--   1. subscriptions: Add credits_remaining column
--   2. subscriptions: Initialize credits_remaining for existing subscribers
--   3. New table: subscription_acknowledgments (consent audit trail)
--   4. credits: Add source column for grant traceability
--   5. handle_new_user(): Set source='signup' on signup credit insert
--   6. New function: decrement_subscription_credits() for entitlement.ts
--
-- All ALTER TABLE statements use IF NOT EXISTS — safe to re-run.
-- ============================================================================


-- ============================================================================
-- 1. Add credits_remaining to subscriptions
-- ============================================================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS credits_remaining INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN subscriptions.credits_remaining IS
  'How many report credits the subscriber has left in the current billing period.
   Provisioned on subscription.created (set to plan cap).
   Decremented by entitlement.ts on each report submission.
   Reset to plan cap on renewal. Adjusted on plan upgrade/downgrade.
   Zero for free/impulse/custom plans — those use the credits table only.';


-- ============================================================================
-- 2. Initialize credits_remaining for existing subscription users
--
-- For each active subscriber, set credits_remaining to:
--   max(0, plan_cap - reports_used_this_period)
--
-- Reports used is read from the usage table (analyzer + seo combined).
-- Users with no usage row (or no matching period) get the full plan cap.
-- ============================================================================

UPDATE subscriptions s
SET credits_remaining = GREATEST(0,
  CASE s.plan
    WHEN 'starter' THEN 25
    WHEN 'growth'  THEN 40
    WHEN 'pro'     THEN 50
    ELSE 0
  END
  - COALESCE((
    SELECT u.analyzer_reports_used + u.seo_reports_used
    FROM usage u
    WHERE u.user_id = s.user_id
      AND u.period_start = date_trunc('month',
        COALESCE(s.current_period_start, NOW())
      )::date
  ), 0)
)
WHERE s.plan IN ('starter', 'growth', 'pro')
  AND s.status IN ('active', 'trialing');


-- ============================================================================
-- 3. subscription_acknowledgments
--
-- Stores a record each time a user confirms the pre-checkout consent checkbox
-- before purchasing a subscription plan. This is the audit trail for:
--   "I understand that subscribing resets all my credits to the plan amount
--    at the start of each billing period and unused credits do not roll over."
--
-- Saved by /api/stripe/checkout when acknowledged=true is POSTed.
-- ip_address is recorded from the request for dispute resolution.
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_acknowledgments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan              TEXT NOT NULL,               -- 'starter' | 'growth' | 'pro'
  credits_per_period INT NOT NULL,               -- snapshot of plan cap at time of purchase
  acknowledged_at   TIMESTAMPTZ DEFAULT NOW(),
  ip_address        TEXT                         -- client IP from x-forwarded-for header
);

CREATE INDEX IF NOT EXISTS idx_sub_ack_user_id ON subscription_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_ack_acknowledged_at ON subscription_acknowledgments(acknowledged_at);

COMMENT ON TABLE subscription_acknowledgments IS
  'Audit trail for pre-checkout consent checkbox shown before each subscription purchase.
   Records user, plan, credit amount, timestamp, and IP.
   Admins can reference this when users dispute credit resets.';

ALTER TABLE subscription_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all subscription_acknowledgments"
  ON subscription_acknowledgments FOR SELECT
  USING (is_admin());

CREATE POLICY "Service role full access on subscription_acknowledgments"
  ON subscription_acknowledgments FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- 4. Add source column to credits
--
-- Tracks where each credit row came from. Used for:
--   - Admin grant traceability (why does this user have extra credits?)
--   - Renewal zero-out (zero non-admin credits on subscription renewal)
--   - Future reporting and auditing
--
-- Valid values:
--   'signup'       → 1 credit granted on account creation
--   'pack'         → credit pack purchase (Spark 3cr / Boost 10cr)
--   'referral'     → referral reward
--   'testimonial'  → testimonial reward
--   'admin_grant'  → manually granted by admin (requires note in admin_notes)
--   'subscription' → reserved for future use (subscription-specific grants)
--
-- Existing rows will have NULL source — treated as legacy data.
-- ============================================================================

ALTER TABLE credits
  ADD COLUMN IF NOT EXISTS source TEXT
  CHECK (source IN ('signup', 'pack', 'referral', 'testimonial', 'admin_grant', 'subscription'));

COMMENT ON COLUMN credits.source IS
  'Origin of this credit row.
   signup = signup grant | pack = credit pack purchase | referral = referral reward |
   testimonial = testimonial reward | admin_grant = admin panel grant (see admin_notes) |
   subscription = subscription-specific grant.
   NULL = legacy rows created before migration 018.';

CREATE INDEX IF NOT EXISTS idx_credits_source ON credits(source);


-- ============================================================================
-- 5. Update handle_new_user() to include source='signup' on credit insert
--
-- Full function body included — replaces migration 016 version.
-- Adds source='signup' to the signup credit row.
-- ============================================================================

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

  -- Grant 1 signup credit (universal, no expiry, source tracked)
  INSERT INTO public.credits (user_id, balance, product, source, purchased_at, expires_at)
  VALUES (NEW.id, 1, NULL, 'signup', NOW(), NULL)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger already exists on auth.users from migration 002 — no need to recreate.


-- ============================================================================
-- 6. decrement_subscription_credits()
--
-- Called by entitlement.ts recordUsage() when deductFrom='subscription'.
-- Decrements credits_remaining by 1 with a safety floor of 0.
-- Operates on the user's active/trialing subscription row.
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_subscription_credits(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE subscriptions
  SET credits_remaining = GREATEST(0, credits_remaining - 1),
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing');
END;
$$;

COMMENT ON FUNCTION decrement_subscription_credits IS
  'Decrements credits_remaining by 1 for a subscriber. Called by entitlement.ts.
   Uses GREATEST(0, ...) as a safety floor — never goes negative.';


-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
--
-- 1. Confirm credits_remaining column:
--    SELECT id, user_id, plan, status, credits_remaining
--    FROM subscriptions
--    WHERE plan IN ('starter', 'growth', 'pro')
--    LIMIT 10;
--
-- 2. Confirm subscription_acknowledgments table:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_name = 'subscription_acknowledgments';
--
-- 3. Confirm source column on credits:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'credits' AND column_name = 'source';
--
-- 4. Test decrement function:
--    SELECT decrement_subscription_credits('<active-subscriber-user-id>');
--    SELECT credits_remaining FROM subscriptions WHERE user_id = '<id>';
--    -- Should be plan_cap - 1
--
-- ============================================================================
