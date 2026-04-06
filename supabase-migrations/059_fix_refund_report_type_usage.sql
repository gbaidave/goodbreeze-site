-- ============================================================================
-- Migration 059: Fix refund_on_report_failure to decrement report_type_usage
--
-- The trigger currently handles credit pack refunds and subscription usage
-- refunds, but does NOT decrement report_type_usage for plan users.
-- This means failed BPR reports still count against the monthly plan limit.
--
-- Also adds report_type_usage decrement to handle all usage types.
--
-- HOW TO RUN:
--   Paste into Supabase SQL Editor and click Run.
--   Run on BOTH staging and production.
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

  -- Subscription monthly cap refund (legacy usage table)
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
  -- Applies to ALL usage types — the monthly count should be decremented
  -- so the failed report doesn't count against the plan limit.
  IF NEW.report_type IS NOT NULL THEN
    v_usage_month := to_char(NEW.created_at, 'YYYY-MM');
    UPDATE report_type_usage
    SET count = GREATEST(0, count - 1)
    WHERE user_id = NEW.user_id
      AND report_type = NEW.report_type::text
      AND usage_month = v_usage_month;
  END IF;

  RETURN NEW;
END;
$$;
