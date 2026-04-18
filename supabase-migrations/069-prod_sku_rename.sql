-- ============================================================================
-- Migration 069-PROD: SKU rename — PRODUCTION-specific variant
--
-- Production schema has MORE columns typed as ENUMs than staging (schema drift
-- discovered during staging vs prod preflight). Specifically:
--   - reports.report_type is ENUM public.report_type on prod (TEXT on staging)
--   - reports.product is ENUM public.product_type on prod (TEXT on staging)
--   - credits.product is ENUM public.product_type on prod (TEXT on staging)
--
-- For these ENUM columns, ALTER TYPE RENAME VALUE auto-updates stored values —
-- no UPDATE statement is needed (and an UPDATE with the OLD literal fails
-- because the enum no longer has that label after RENAME).
--
-- This file is derived from 069_sku_rename.sql but adjusted for production:
--   - Adds ALTER TYPE product_type RENAME VALUE (used by prod columns)
--   - Drops UPDATE statements against ENUM columns (ENUM rename handles them)
--   - Adds UPDATE for report_requests.report_type (TEXT, prod-only table)
--
-- Atomic: wrapped in BEGIN/COMMIT. Failure anywhere rolls back the entire
-- migration. Idempotent-safe: every UPDATE has a WHERE filter.
--
-- This should run AFTER the code deploy containing new SKU literals has
-- landed on production Vercel (master branch). Code + DB must match state
-- post-migration.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. plan_type ENUM rename — 3 values
-- Columns on prod using plan_type:
--   subscriptions.plan, profiles.plan_override_type, profiles.prior_plan
-- (profiles.plan does NOT exist on prod — column missing, staging-only)
-- ============================================================================

ALTER TYPE public.plan_type RENAME VALUE 'starter' TO 'PLN-STARTER';
ALTER TYPE public.plan_type RENAME VALUE 'growth'  TO 'PLN-GROWTH';
ALTER TYPE public.plan_type RENAME VALUE 'pro'     TO 'PLN-PRO';


-- ============================================================================
-- 2. report_type ENUM rename — 9 values
-- Columns on prod using report_type:
--   reports.report_type, plan_report_allowances.report_type,
--   report_type_usage.report_type
-- ============================================================================

ALTER TYPE public.report_type RENAME VALUE 'business_presence_report' TO 'RPT-BPR';
ALTER TYPE public.report_type RENAME VALUE 'h2h'                      TO 'RPT-H2H';
ALTER TYPE public.report_type RENAME VALUE 't3c'                      TO 'RPT-T3C';
ALTER TYPE public.report_type RENAME VALUE 'cp'                       TO 'RPT-CP';
ALTER TYPE public.report_type RENAME VALUE 'seo_audit'                TO 'RPT-AUDIT';
ALTER TYPE public.report_type RENAME VALUE 'seo_comprehensive'        TO 'RPT-COMP';
ALTER TYPE public.report_type RENAME VALUE 'keyword_research'         TO 'RPT-KR';
ALTER TYPE public.report_type RENAME VALUE 'landing_page'             TO 'RPT-LP';
ALTER TYPE public.report_type RENAME VALUE 'ai_seo'                   TO 'RPT-AISEO';


-- ============================================================================
-- 3. product_type ENUM rename — PROD-ONLY (staging has no columns using it)
-- Columns on prod using product_type:
--   credits.product, reports.product
-- Only 'business_presence_report' in product_type is a SKU-aligned value.
-- 'analyzer', 'seo_auditor', 'scorecard' are category labels — NOT renamed.
-- ============================================================================

ALTER TYPE public.product_type RENAME VALUE 'business_presence_report' TO 'RPT-BPR';


-- ============================================================================
-- 4. products.sku (TEXT) — 14 legacy SKUs
-- ============================================================================

UPDATE public.products SET sku = 'PLN-STARTER' WHERE sku = 'starter';
UPDATE public.products SET sku = 'PLN-GROWTH'  WHERE sku = 'growth';
UPDATE public.products SET sku = 'PLN-PRO'     WHERE sku = 'pro';
UPDATE public.products SET sku = 'PCK-SPARK'   WHERE sku = 'spark_pack';
UPDATE public.products SET sku = 'PCK-BOOST'   WHERE sku = 'boost_pack';
UPDATE public.products SET sku = 'RPT-BPR'     WHERE sku = 'business_presence_report';
UPDATE public.products SET sku = 'RPT-H2H'     WHERE sku = 'h2h';
UPDATE public.products SET sku = 'RPT-T3C'     WHERE sku = 't3c';
UPDATE public.products SET sku = 'RPT-CP'      WHERE sku = 'cp';
UPDATE public.products SET sku = 'RPT-AUDIT'   WHERE sku = 'seo_audit';
UPDATE public.products SET sku = 'RPT-COMP'    WHERE sku = 'seo_comprehensive';
UPDATE public.products SET sku = 'RPT-KR'      WHERE sku = 'keyword_research';
UPDATE public.products SET sku = 'RPT-LP'      WHERE sku = 'landing_page';
UPDATE public.products SET sku = 'RPT-AISEO'   WHERE sku = 'ai_seo';


-- ============================================================================
-- 5. plan_report_allowances.plan (TEXT)
-- ============================================================================

UPDATE public.plan_report_allowances SET plan = 'PLN-STARTER' WHERE plan = 'starter';
UPDATE public.plan_report_allowances SET plan = 'PLN-GROWTH'  WHERE plan = 'growth';
UPDATE public.plan_report_allowances SET plan = 'PLN-PRO'     WHERE plan = 'pro';


-- ============================================================================
-- 6. subscription_acknowledgments.plan (TEXT) — defensive
-- ============================================================================

UPDATE public.subscription_acknowledgments SET plan = 'PLN-STARTER' WHERE plan = 'starter';
UPDATE public.subscription_acknowledgments SET plan = 'PLN-GROWTH'  WHERE plan = 'growth';
UPDATE public.subscription_acknowledgments SET plan = 'PLN-PRO'     WHERE plan = 'pro';


-- ============================================================================
-- 7. report_requests.report_type (TEXT) — PROD-ONLY table
-- 32 rows with 'seo_audit' per preflight; defensive UPDATE for all legacy
-- report SKUs in case historical data contains others.
-- ============================================================================

UPDATE public.report_requests SET report_type = 'RPT-BPR'   WHERE report_type = 'business_presence_report';
UPDATE public.report_requests SET report_type = 'RPT-H2H'   WHERE report_type = 'h2h';
UPDATE public.report_requests SET report_type = 'RPT-T3C'   WHERE report_type = 't3c';
UPDATE public.report_requests SET report_type = 'RPT-CP'    WHERE report_type = 'cp';
UPDATE public.report_requests SET report_type = 'RPT-AUDIT' WHERE report_type = 'seo_audit';
UPDATE public.report_requests SET report_type = 'RPT-COMP'  WHERE report_type = 'seo_comprehensive';
UPDATE public.report_requests SET report_type = 'RPT-KR'    WHERE report_type = 'keyword_research';
UPDATE public.report_requests SET report_type = 'RPT-LP'    WHERE report_type = 'landing_page';
UPDATE public.report_requests SET report_type = 'RPT-AISEO' WHERE report_type = 'ai_seo';


-- ============================================================================
-- 8. Trigger function body — refund_on_report_failure
-- Hardcoded 'business_presence_report' literal is now invalid (enum renamed).
-- Update the literal to 'RPT-BPR'.
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
  -- Post-Sprint-5: literal updated to 'RPT-BPR' (was 'business_presence_report').
  IF NEW.usage_type = 'subscription'
     AND NEW.report_type = 'RPT-BPR'
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


-- ============================================================================
-- Verification queries — run separately after migration
-- ============================================================================

-- Confirm enums renamed:
--   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'plan_type'::regtype ORDER BY enumsortorder;
--   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'report_type'::regtype ORDER BY enumsortorder;
--   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'product_type'::regtype ORDER BY enumsortorder;

-- Confirm products table renamed:
--   SELECT sku, product_type FROM public.products ORDER BY product_type, sku;

-- Confirm no legacy SKUs remain:
--   SELECT 'products.sku' AS loc, COUNT(*) FROM public.products
--     WHERE sku IN ('starter','growth','pro','spark_pack','boost_pack',
--                   'business_presence_report','h2h','t3c','cp',
--                   'seo_audit','seo_comprehensive','keyword_research',
--                   'landing_page','ai_seo')
--   UNION ALL SELECT 'report_requests.report_type', COUNT(*) FROM public.report_requests
--     WHERE report_type IN ('seo_audit','business_presence_report','h2h','t3c','cp',
--                           'seo_comprehensive','keyword_research','landing_page','ai_seo');
--   -- All counts should be 0.
