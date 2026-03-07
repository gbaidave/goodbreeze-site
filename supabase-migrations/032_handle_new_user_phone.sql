-- ============================================================================
-- Good Breeze AI - Fix handle_new_user to save phone at signup
-- Migration: 032_handle_new_user_phone.sql
-- Created: 2026-03-06
--
-- Bug: SignupForm passes phone in options.data (raw_user_meta_data) but
-- handle_new_user() never reads it, so profiles.phone is always NULL after
-- signup even when the user entered a phone number.
--
-- Fix: Add phone to the INSERT in handle_new_user().
-- ============================================================================

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
  -- Create profile row (includes phone from signup form)
  INSERT INTO public.profiles (id, email, name, phone, marketing_opt_in)
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

-- Trigger already exists on auth.users — no need to recreate.
