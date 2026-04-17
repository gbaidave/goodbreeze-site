-- ============================================================================
-- Migration 069-REVERSE: Rollback SKU rename (new UPPERCASE-dashes → legacy lowercase_snake_case)
--
-- Rollback counterpart to 069_sku_rename.sql. Run ONLY if Sprint 5 needs to
-- be reverted after partial deployment. Same structure as forward migration
-- with mappings inverted.
--
-- Before running: also run the REVERSE Stripe metadata script
-- (scripts/rename-stripe-sku-metadata.ts with direction=reverse env flag)
-- so Stripe metadata matches the DB.
--
-- DO NOT run this migration during normal operation. This exists only as
-- tested rollback insurance.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. plan_type ENUM reverse
-- ============================================================================

ALTER TYPE public.plan_type RENAME VALUE 'PLN-STARTER' TO 'starter';
ALTER TYPE public.plan_type RENAME VALUE 'PLN-GROWTH'  TO 'growth';
ALTER TYPE public.plan_type RENAME VALUE 'PLN-PRO'     TO 'pro';

-- ============================================================================
-- 2. report_type ENUM reverse
-- ============================================================================

ALTER TYPE public.report_type RENAME VALUE 'RPT-BPR'   TO 'business_presence_report';
ALTER TYPE public.report_type RENAME VALUE 'RPT-H2H'   TO 'h2h';
ALTER TYPE public.report_type RENAME VALUE 'RPT-T3C'   TO 't3c';
ALTER TYPE public.report_type RENAME VALUE 'RPT-CP'    TO 'cp';
ALTER TYPE public.report_type RENAME VALUE 'RPT-AUDIT' TO 'seo_audit';
ALTER TYPE public.report_type RENAME VALUE 'RPT-COMP'  TO 'seo_comprehensive';
ALTER TYPE public.report_type RENAME VALUE 'RPT-KR'    TO 'keyword_research';
ALTER TYPE public.report_type RENAME VALUE 'RPT-LP'    TO 'landing_page';
ALTER TYPE public.report_type RENAME VALUE 'RPT-AISEO' TO 'ai_seo';

-- ============================================================================
-- 3. TEXT column reverse — products.sku
-- ============================================================================

UPDATE public.products SET sku = 'starter'                  WHERE sku = 'PLN-STARTER';
UPDATE public.products SET sku = 'growth'                   WHERE sku = 'PLN-GROWTH';
UPDATE public.products SET sku = 'pro'                      WHERE sku = 'PLN-PRO';
UPDATE public.products SET sku = 'spark_pack'               WHERE sku = 'PCK-SPARK';
UPDATE public.products SET sku = 'boost_pack'               WHERE sku = 'PCK-BOOST';
UPDATE public.products SET sku = 'business_presence_report' WHERE sku = 'RPT-BPR';
UPDATE public.products SET sku = 'h2h'                      WHERE sku = 'RPT-H2H';
UPDATE public.products SET sku = 't3c'                      WHERE sku = 'RPT-T3C';
UPDATE public.products SET sku = 'cp'                       WHERE sku = 'RPT-CP';
UPDATE public.products SET sku = 'seo_audit'                WHERE sku = 'RPT-AUDIT';
UPDATE public.products SET sku = 'seo_comprehensive'        WHERE sku = 'RPT-COMP';
UPDATE public.products SET sku = 'keyword_research'         WHERE sku = 'RPT-KR';
UPDATE public.products SET sku = 'landing_page'             WHERE sku = 'RPT-LP';
UPDATE public.products SET sku = 'ai_seo'                   WHERE sku = 'RPT-AISEO';

-- ============================================================================
-- 4. TEXT column reverse — plan_report_allowances.plan
-- ============================================================================

UPDATE public.plan_report_allowances SET plan = 'starter' WHERE plan = 'PLN-STARTER';
UPDATE public.plan_report_allowances SET plan = 'growth'  WHERE plan = 'PLN-GROWTH';
UPDATE public.plan_report_allowances SET plan = 'pro'     WHERE plan = 'PLN-PRO';

-- ============================================================================
-- 5. TEXT column reverse — subscription_acknowledgments.plan
-- ============================================================================

UPDATE public.subscription_acknowledgments SET plan = 'starter' WHERE plan = 'PLN-STARTER';
UPDATE public.subscription_acknowledgments SET plan = 'growth'  WHERE plan = 'PLN-GROWTH';
UPDATE public.subscription_acknowledgments SET plan = 'pro'     WHERE plan = 'PLN-PRO';

-- ============================================================================
-- 6. TEXT column reverse — reports.report_type
-- ============================================================================

UPDATE public.reports SET report_type = 'business_presence_report' WHERE report_type = 'RPT-BPR';
UPDATE public.reports SET report_type = 'h2h'                      WHERE report_type = 'RPT-H2H';
UPDATE public.reports SET report_type = 't3c'                      WHERE report_type = 'RPT-T3C';
UPDATE public.reports SET report_type = 'cp'                       WHERE report_type = 'RPT-CP';
UPDATE public.reports SET report_type = 'seo_audit'                WHERE report_type = 'RPT-AUDIT';
UPDATE public.reports SET report_type = 'seo_comprehensive'        WHERE report_type = 'RPT-COMP';
UPDATE public.reports SET report_type = 'keyword_research'         WHERE report_type = 'RPT-KR';
UPDATE public.reports SET report_type = 'landing_page'             WHERE report_type = 'RPT-LP';
UPDATE public.reports SET report_type = 'ai_seo'                   WHERE report_type = 'RPT-AISEO';

-- ============================================================================
-- 7. TEXT column reverse — reports.product
-- ============================================================================

UPDATE public.reports SET product = 'starter'                  WHERE product = 'PLN-STARTER';
UPDATE public.reports SET product = 'growth'                   WHERE product = 'PLN-GROWTH';
UPDATE public.reports SET product = 'pro'                      WHERE product = 'PLN-PRO';
UPDATE public.reports SET product = 'spark_pack'               WHERE product = 'PCK-SPARK';
UPDATE public.reports SET product = 'boost_pack'               WHERE product = 'PCK-BOOST';
UPDATE public.reports SET product = 'business_presence_report' WHERE product = 'RPT-BPR';
UPDATE public.reports SET product = 'h2h'                      WHERE product = 'RPT-H2H';
UPDATE public.reports SET product = 't3c'                      WHERE product = 'RPT-T3C';
UPDATE public.reports SET product = 'cp'                       WHERE product = 'RPT-CP';
UPDATE public.reports SET product = 'seo_audit'                WHERE product = 'RPT-AUDIT';
UPDATE public.reports SET product = 'seo_comprehensive'        WHERE product = 'RPT-COMP';
UPDATE public.reports SET product = 'keyword_research'         WHERE product = 'RPT-KR';
UPDATE public.reports SET product = 'landing_page'             WHERE product = 'RPT-LP';
UPDATE public.reports SET product = 'ai_seo'                   WHERE product = 'RPT-AISEO';

-- ============================================================================
-- 8. TEXT column reverse — credits.product
-- ============================================================================

UPDATE public.credits SET product = 'starter'                  WHERE product = 'PLN-STARTER';
UPDATE public.credits SET product = 'growth'                   WHERE product = 'PLN-GROWTH';
UPDATE public.credits SET product = 'pro'                      WHERE product = 'PLN-PRO';
UPDATE public.credits SET product = 'spark_pack'               WHERE product = 'PCK-SPARK';
UPDATE public.credits SET product = 'boost_pack'               WHERE product = 'PCK-BOOST';
UPDATE public.credits SET product = 'business_presence_report' WHERE product = 'RPT-BPR';
UPDATE public.credits SET product = 'h2h'                      WHERE product = 'RPT-H2H';
UPDATE public.credits SET product = 't3c'                      WHERE product = 'RPT-T3C';
UPDATE public.credits SET product = 'cp'                       WHERE product = 'RPT-CP';
UPDATE public.credits SET product = 'seo_audit'                WHERE product = 'RPT-AUDIT';
UPDATE public.credits SET product = 'seo_comprehensive'        WHERE product = 'RPT-COMP';
UPDATE public.credits SET product = 'keyword_research'         WHERE product = 'RPT-KR';
UPDATE public.credits SET product = 'landing_page'             WHERE product = 'RPT-LP';
UPDATE public.credits SET product = 'ai_seo'                   WHERE product = 'RPT-AISEO';

-- ============================================================================
-- 9. Function body reverse — restore 'business_presence_report' literal
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

  IF NEW.usage_type = 'credits' AND NEW.credit_row_id IS NOT NULL THEN
    v_refund_amount := COALESCE(NEW.credit_amount, 1);
    UPDATE credits
    SET balance = balance + v_refund_amount
    WHERE id = NEW.credit_row_id;
  END IF;

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

COMMIT;
