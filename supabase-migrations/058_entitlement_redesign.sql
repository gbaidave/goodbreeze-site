-- ============================================================================
-- Good Breeze AI - Entitlement Redesign
-- Migration: 058_entitlement_redesign.sql
-- Created: 2026-04-01
--
-- Changes:
--   1. Remove free signup credit from handle_new_user()
--   2. Add credit_amount column to reports (for accurate refunds)
--   3. Create decrement_credit_amount() RPC (deducts variable amounts)
--   4. Update refund_on_report_failure() to refund actual amount
--
-- The free BPR per account uses the existing free_reports_used JSONB on
-- profiles + check_and_reserve_free_slot RPC (created in migration 008).
-- No new tables needed.
-- ============================================================================


-- ============================================================================
-- 1. Remove free signup credit from handle_new_user()
--    New accounts get 0 credits. The 1 free BPR is tracked via
--    profiles.free_reports_used JSONB (not credits).
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

  -- NO signup credit. Free BPR tracked via free_reports_used JSONB.

  RETURN NEW;
END;
$$;


-- ============================================================================
-- 2. Add credit_amount to reports table
--    Stores the actual number of credits deducted so refunds are accurate.
--    NULL for non-credit usage (free slot, subscription, admin).
-- ============================================================================

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS credit_amount INTEGER;

COMMENT ON COLUMN reports.credit_amount IS
  'Number of credits deducted for this report. Used by refund trigger to
   restore the exact amount on failure. NULL for non-credit usage types.';


-- ============================================================================
-- 3. Create decrement_credit_amount() RPC
--    Like decrement_credit but accepts a variable amount.
--    Floor at 0 to prevent negative balances.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.decrement_credit_amount(
  p_credit_id UUID,
  p_amount    INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.credits
  SET balance = GREATEST(0, balance - p_amount)
  WHERE id = p_credit_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_credit_amount(UUID, INTEGER) TO service_role;

COMMENT ON FUNCTION public.decrement_credit_amount IS
  'Decrements a credit row balance by the specified amount (floored at 0).
   Used by entitlement.ts for reports costing more than 1 credit.';


-- ============================================================================
-- 4. Update refund_on_report_failure() to use credit_amount
--    Refunds the actual amount stored on the report row instead of
--    hardcoded +1. Falls back to +1 if credit_amount is NULL (legacy rows).
-- ============================================================================

CREATE OR REPLACE FUNCTION refund_on_report_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start DATE;
  v_refund_amount INTEGER;
BEGIN
  -- Only process when status actually changes TO a failure state
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('failed', 'failed_site_blocked') THEN RETURN NEW; END IF;

  -- Credit pack refund: restore the exact amount that was deducted
  IF NEW.usage_type = 'credits' AND NEW.credit_row_id IS NOT NULL THEN
    v_refund_amount := COALESCE(NEW.credit_amount, 1);
    UPDATE credits
    SET balance = balance + v_refund_amount
    WHERE id = NEW.credit_row_id;
  END IF;

  -- Free slot refund: remove the JSONB key so the slot is available again
  IF NEW.usage_type = 'free' AND NEW.free_system IS NOT NULL THEN
    UPDATE profiles
    SET free_reports_used = free_reports_used - NEW.free_system
    WHERE id = NEW.user_id;
  END IF;

  -- Subscription monthly cap refund
  IF NEW.usage_type = 'subscription' THEN
    v_period_start := date_trunc('month', NEW.created_at)::date;

    IF NEW.product = 'analyzer' THEN
      UPDATE usage
      SET analyzer_reports_used = GREATEST(0, analyzer_reports_used - 1)
      WHERE user_id = NEW.user_id AND period_start = v_period_start;
    ELSIF NEW.product = 'seo_auditor' THEN
      UPDATE usage
      SET seo_reports_used = GREATEST(0, seo_reports_used - 1)
      WHERE user_id = NEW.user_id AND period_start = v_period_start;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- 1. Confirm handle_new_user no longer grants credit:
--    SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
--    -- Should NOT contain 'INSERT INTO public.credits'
--
-- 2. Confirm credit_amount column exists:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'reports' AND column_name = 'credit_amount';
--
-- 3. Confirm decrement_credit_amount function exists:
--    SELECT routine_name FROM information_schema.routines
--    WHERE routine_name = 'decrement_credit_amount';
--
-- 4. Confirm refund trigger uses credit_amount:
--    SELECT prosrc FROM pg_proc WHERE proname = 'refund_on_report_failure';
--    -- Should contain 'COALESCE(NEW.credit_amount, 1)'
-- ============================================================================
