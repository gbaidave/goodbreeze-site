-- ============================================================================
-- Migration 063: decrement_subscription_credits_by(user_id, amount) RPC
--
-- Narrow additive fix for BPR. Does NOT alter existing tables, triggers,
-- or the existing decrement_subscription_credits(user_id) RPC (which still
-- decrements by 1 and is used by every non-BPR report path).
--
-- Why: BPR on a paid plan with exhausted monthly allowance should be able to
-- consume subscription.credits_remaining at the catalog cost (currently 3).
-- The existing RPC decrements by 1 only. We need a variable-amount version
-- just for BPR. Existing non-BPR reports keep using the by-1 RPC unchanged.
--
-- Safe to re-run. No schema changes, no data changes, one new function only.
-- Future cleanup: when credits are unified (see PLAN-credits-unification.md),
-- this RPC becomes redundant and gets dropped along with credits_remaining.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.decrement_subscription_credits_by(
  p_user_id UUID,
  p_amount  INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET credits_remaining = GREATEST(0, credits_remaining - p_amount),
      updated_at = now()
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing');
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_subscription_credits_by(UUID, INTEGER) TO service_role;

COMMENT ON FUNCTION public.decrement_subscription_credits_by IS
  'Decrements credits_remaining on the active subscription by a variable amount (floored at 0).
   Used only by BPR entitlement flow (business_presence_report at catalog cost 3+).
   Other report types use decrement_subscription_credits (by 1) — unchanged.
   Scheduled for deprecation when credits unification lands (see PLAN-credits-unification.md).';


-- ============================================================================
-- Refund trigger update: when a BPR that consumed subscription credits fails,
-- restore the deducted amount to subscriptions.credits_remaining.
--
-- Existing trigger branches are preserved exactly. New branch added for
-- report_type = 'business_presence_report' AND usage_type = 'subscription'
-- AND credit_amount IS NOT NULL. Other paths unchanged.
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
  v_usage_month TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('failed', 'failed_site_blocked') THEN RETURN NEW; END IF;

  -- Credit pack refund: restore the exact amount that was deducted
  IF NEW.usage_type = 'credits' AND NEW.credit_row_id IS NOT NULL THEN
    v_refund_amount := COALESCE(NEW.credit_amount, 1);
    UPDATE credits
    SET balance = balance + v_refund_amount
    WHERE id = NEW.credit_row_id;
  END IF;

  -- FREE SLOT: intentionally NOT restored (business rule: one per account, ever)

  -- BPR on subscription credits: restore credit_amount to credits_remaining.
  -- Narrow branch to cover the new BPR-on-subscription path (2026-04-16).
  -- Other subscription-deducted reports fall through to the legacy usage branch below.
  IF NEW.usage_type = 'subscription'
     AND NEW.report_type = 'business_presence_report'
     AND NEW.credit_amount IS NOT NULL
     AND NEW.credit_amount > 0 THEN
    UPDATE subscriptions
    SET credits_remaining = credits_remaining + NEW.credit_amount,
        updated_at = now()
    WHERE user_id = NEW.user_id
      AND status IN ('active', 'trialing');
  END IF;

  -- Subscription monthly cap refund (legacy usage table — other report types)
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

  -- report_type_usage decrement (new entitlement system)
  -- Failed reports should not count against the monthly plan limit.
  IF NEW.report_type IS NOT NULL THEN
    v_usage_month := to_char(NEW.created_at, 'YYYY-MM');
    UPDATE report_type_usage
    SET count = GREATEST(0, count - 1)
    WHERE user_id = NEW.user_id
      AND report_type = NEW.report_type
      AND usage_month = v_usage_month;
  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- 1. New function exists:
--    SELECT routine_name, data_type FROM information_schema.routines
--    WHERE routine_name = 'decrement_subscription_credits_by';
--
-- 2. Old function still exists (unchanged):
--    SELECT routine_name FROM information_schema.routines
--    WHERE routine_name = 'decrement_subscription_credits';
--
-- 3. Test decrement on a test user:
--    SELECT credits_remaining FROM subscriptions WHERE user_id = '<test-uuid>';
--    SELECT decrement_subscription_credits_by('<test-uuid>', 3);
--    SELECT credits_remaining FROM subscriptions WHERE user_id = '<test-uuid>';
--    -- Should be 3 lower than before.
-- ============================================================================
