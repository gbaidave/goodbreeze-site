-- ============================================================================
-- Migration 016: Seed 1 credit on signup
-- Created: 2026-02-23
--
-- New model: credits are the single source of truth for report entitlement.
-- Free slots (free_reports_used JSONB) are no longer used in entitlement logic.
--
-- On signup, every new user receives 1 credit:
--   - balance = 1
--   - product = NULL (universal — works on any report type)
--   - expires_at = NULL (never expires)
--   - source tracked via a note in purchased_at = NOW()
--
-- This replaces the old "2 free reports" system (1 per system via JSONB slots).
-- The free_reports_used column is retained in the schema for historical data
-- but is no longer read or written by entitlement.ts.
-- ============================================================================

-- Update handle_new_user() to INSERT 1 credit row on signup
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

  -- Grant 1 signup credit (universal, no expiry)
  INSERT INTO public.credits (user_id, balance, product, purchased_at, expires_at)
  VALUES (NEW.id, 1, NULL, NOW(), NULL)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;


-- ============================================================================
-- VERIFICATION QUERY (run after applying)
-- ============================================================================
-- Simulate a new signup and verify credit row is created:
--   SELECT id, balance, product, expires_at
--   FROM credits
--   WHERE user_id = '<new-user-id>';
-- Expected: 1 row with balance=1, product=NULL, expires_at=NULL
-- ============================================================================
