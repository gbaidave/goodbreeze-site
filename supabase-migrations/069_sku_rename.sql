-- ============================================================================
-- Migration 069: SKU rename — legacy lowercase_snake_case → UPPERCASE-dashes
--
-- Part of Catalog Full Integration Sprint 5.
-- See .workspace/PLAN-sprint5-sku-rename.md for full design + rationale.
--
-- This migration:
--   1. Renames 3 plan_type ENUM values (starter/growth/pro → PLN-*)
--   2. Renames 9 report_type ENUM values (BV + Analyzer + BPR reports)
--   3. UPDATEs TEXT columns holding SKU strings (products.sku, *.plan,
--      *.report_type, *.product)
--   4. CREATE OR REPLACE FUNCTION refund_on_report_failure — update the
--      hardcoded 'business_presence_report' literal to 'RPT-BPR'
--
-- Does NOT touch:
--   - product_type ENUM (orphaned — no column uses it, verified preflight)
--   - plan_type 'free' / 'impulse' / 'custom' values (not SKUs)
--   - report_type 'multi_page' / 'business_scorecard' (dead, verified 0 usage)
--   - profiles.free_reports_used JSONB (verified empty on staging)
--
-- Idempotent: every ALTER TYPE RENAME VALUE targets a value that must exist;
-- this migration fails fast (not silently) if run against a DB that already
-- has the new values, because ENUM RENAME has no IF EXISTS clause. That's
-- acceptable: if already migrated, running again is a no-op via error.
-- Every UPDATE has a WHERE filter so it's a no-op after the first run.
--
-- Atomic within transaction: PostgreSQL allows ALTER TYPE RENAME VALUE inside
-- a transaction (the restriction is only on ADD VALUE). If staging testing
-- reveals otherwise, split into per-statement execution.
--
-- Reverse migration: 069-reverse_sku_rename.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. plan_type ENUM — rename 3 values (leave free/impulse/custom)
-- ============================================================================

ALTER TYPE public.plan_type RENAME VALUE 'starter' TO 'PLN-STARTER';
ALTER TYPE public.plan_type RENAME VALUE 'growth'  TO 'PLN-GROWTH';
ALTER TYPE public.plan_type RENAME VALUE 'pro'     TO 'PLN-PRO';

-- Columns automatically updated via enum rename (no separate UPDATE needed):
--   subscriptions.plan, profiles.plan, profiles.prior_plan,
--   profiles.plan_override_type


-- ============================================================================
-- 2. report_type ENUM — rename 9 values (leave multi_page/business_scorecard as dead)
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

-- Columns automatically updated via enum rename:
--   plan_report_allowances.report_type, report_type_usage.report_type


-- ============================================================================
-- 3. TEXT column UPDATEs — products.sku (all 14 legacy SKUs)
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
-- 4. TEXT column UPDATEs — plan_report_allowances.plan
-- ============================================================================

UPDATE public.plan_report_allowances SET plan = 'PLN-STARTER' WHERE plan = 'starter';
UPDATE public.plan_report_allowances SET plan = 'PLN-GROWTH'  WHERE plan = 'growth';
UPDATE public.plan_report_allowances SET plan = 'PLN-PRO'     WHERE plan = 'pro';
-- 'free' and 'custom' stay unchanged (tier labels, not SKUs)


-- ============================================================================
-- 5. TEXT column UPDATEs — subscription_acknowledgments.plan
-- ============================================================================

UPDATE public.subscription_acknowledgments SET plan = 'PLN-STARTER' WHERE plan = 'starter';
UPDATE public.subscription_acknowledgments SET plan = 'PLN-GROWTH'  WHERE plan = 'growth';
UPDATE public.subscription_acknowledgments SET plan = 'PLN-PRO'     WHERE plan = 'pro';


-- ============================================================================
-- 6. TEXT column UPDATEs — reports.report_type (TEXT, not ENUM)
-- ============================================================================

UPDATE public.reports SET report_type = 'RPT-BPR'   WHERE report_type = 'business_presence_report';
UPDATE public.reports SET report_type = 'RPT-H2H'   WHERE report_type = 'h2h';
UPDATE public.reports SET report_type = 'RPT-T3C'   WHERE report_type = 't3c';
UPDATE public.reports SET report_type = 'RPT-CP'    WHERE report_type = 'cp';
UPDATE public.reports SET report_type = 'RPT-AUDIT' WHERE report_type = 'seo_audit';
UPDATE public.reports SET report_type = 'RPT-COMP'  WHERE report_type = 'seo_comprehensive';
UPDATE public.reports SET report_type = 'RPT-KR'    WHERE report_type = 'keyword_research';
UPDATE public.reports SET report_type = 'RPT-LP'    WHERE report_type = 'landing_page';
UPDATE public.reports SET report_type = 'RPT-AISEO' WHERE report_type = 'ai_seo';


-- ============================================================================
-- 7. TEXT column UPDATEs — reports.product (legacy column, defensive)
-- ============================================================================

UPDATE public.reports SET product = 'PLN-STARTER' WHERE product = 'starter';
UPDATE public.reports SET product = 'PLN-GROWTH'  WHERE product = 'growth';
UPDATE public.reports SET product = 'PLN-PRO'     WHERE product = 'pro';
UPDATE public.reports SET product = 'PCK-SPARK'   WHERE product = 'spark_pack';
UPDATE public.reports SET product = 'PCK-BOOST'   WHERE product = 'boost_pack';
UPDATE public.reports SET product = 'RPT-BPR'     WHERE product = 'business_presence_report';
UPDATE public.reports SET product = 'RPT-H2H'     WHERE product = 'h2h';
UPDATE public.reports SET product = 'RPT-T3C'     WHERE product = 't3c';
UPDATE public.reports SET product = 'RPT-CP'      WHERE product = 'cp';
UPDATE public.reports SET product = 'RPT-AUDIT'   WHERE product = 'seo_audit';
UPDATE public.reports SET product = 'RPT-COMP'    WHERE product = 'seo_comprehensive';
UPDATE public.reports SET product = 'RPT-KR'      WHERE product = 'keyword_research';
UPDATE public.reports SET product = 'RPT-LP'      WHERE product = 'landing_page';
UPDATE public.reports SET product = 'RPT-AISEO'   WHERE product = 'ai_seo';


-- ============================================================================
-- 8. TEXT column UPDATEs — credits.product
-- ============================================================================

UPDATE public.credits SET product = 'PLN-STARTER' WHERE product = 'starter';
UPDATE public.credits SET product = 'PLN-GROWTH'  WHERE product = 'growth';
UPDATE public.credits SET product = 'PLN-PRO'     WHERE product = 'pro';
UPDATE public.credits SET product = 'PCK-SPARK'   WHERE product = 'spark_pack';
UPDATE public.credits SET product = 'PCK-BOOST'   WHERE product = 'boost_pack';
UPDATE public.credits SET product = 'RPT-BPR'     WHERE product = 'business_presence_report';
UPDATE public.credits SET product = 'RPT-H2H'     WHERE product = 'h2h';
UPDATE public.credits SET product = 'RPT-T3C'     WHERE product = 't3c';
UPDATE public.credits SET product = 'RPT-CP'      WHERE product = 'cp';
UPDATE public.credits SET product = 'RPT-AUDIT'   WHERE product = 'seo_audit';
UPDATE public.credits SET product = 'RPT-COMP'    WHERE product = 'seo_comprehensive';
UPDATE public.credits SET product = 'RPT-KR'      WHERE product = 'keyword_research';
UPDATE public.credits SET product = 'RPT-LP'      WHERE product = 'landing_page';
UPDATE public.credits SET product = 'RPT-AISEO'   WHERE product = 'ai_seo';


-- ============================================================================
-- 9. Trigger function body — refund_on_report_failure
--    Preflight audit found ONE live function body with a hardcoded SKU
--    literal. Update the literal 'business_presence_report' to 'RPT-BPR'.
--    CREATE OR REPLACE is safe: same signature, updated body.
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

COMMIT;


-- ============================================================================
-- Verification queries (run after migration, paste into Supabase SQL editor)
-- ============================================================================

-- Confirm ENUM values renamed
--   SELECT enumlabel FROM pg_enum
--   WHERE enumtypid = 'plan_type'::regtype
--   ORDER BY enumsortorder;
--   -- Expected: free, impulse, PLN-STARTER, PLN-GROWTH, PLN-PRO, custom

--   SELECT enumlabel FROM pg_enum
--   WHERE enumtypid = 'report_type'::regtype
--   ORDER BY enumsortorder;
--   -- Expected: RPT-H2H, RPT-T3C, RPT-CP, RPT-AUDIT, RPT-COMP, RPT-KR, RPT-LP, RPT-AISEO, multi_page, business_scorecard, RPT-BPR

-- Confirm catalog updated
--   SELECT sku, name, product_type FROM public.products ORDER BY product_type, display_order;

-- Confirm function body updated
--   SELECT pg_get_functiondef('refund_on_report_failure'::regproc) LIKE '%''RPT-BPR''%' AS has_new_literal;
--   -- Expected: true

-- Confirm no legacy SKU left anywhere
--   SELECT 'products.sku' AS loc, COUNT(*) FROM public.products
--     WHERE sku IN ('starter','growth','pro','spark_pack','boost_pack','business_presence_report',
--                   'h2h','t3c','cp','seo_audit','seo_comprehensive','keyword_research','landing_page','ai_seo')
--   UNION ALL SELECT 'credits.product', COUNT(*) FROM public.credits
--     WHERE product IN ('starter','growth','pro','spark_pack','boost_pack','business_presence_report',
--                       'h2h','t3c','cp','seo_audit','seo_comprehensive','keyword_research','landing_page','ai_seo')
--   UNION ALL SELECT 'plan_report_allowances.plan', COUNT(*) FROM public.plan_report_allowances
--     WHERE plan IN ('starter','growth','pro');
--   -- All counts should be 0.
