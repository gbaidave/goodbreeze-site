-- ============================================================================
-- Migration: 053_password_rotation.sql
-- T29-A: Password rotation — 90-day expiry for email/password users
-- ============================================================================

-- 1. Add column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password_last_changed_at TIMESTAMPTZ;

-- 2. Backfill existing rows with NOW() so no existing user is immediately expired.
UPDATE profiles SET password_last_changed_at = NOW()
  WHERE password_last_changed_at IS NULL;

-- 3. Update handle_new_user() trigger to include password_last_changed_at on signup.
--    Full function rewrite based on latest version from migration 032.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code TEXT;
  v_referred_by   TEXT;
  v_referrer_id   UUID;
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, marketing_opt_in, password_last_changed_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'marketing_opt_in')::boolean,
      true
    ),
    NOW()
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
