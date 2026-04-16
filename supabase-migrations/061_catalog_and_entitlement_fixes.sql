-- ============================================================================
-- Migration 061: Product catalog + entitlement fixes
--
-- 1. Extend products table with catalog columns (sku, pricing, etc.)
-- 2. Seed product rows for reports, packs, and plans
-- 3. Fix refund_on_report_failure() — remove free slot restoration, fix ::text cast
-- 4. Null weekly_limit on plan_report_allowances (kept for reversibility)
-- 5. Backfill reports.credit_amount for BPR rows
-- 6. Fix check_and_reserve_free_slot to store timestamp (not report_type string)
-- 7. Backfill existing bad free_reports_used values
--
-- HOW TO RUN:
--   Paste into Supabase SQL Editor and click Run.
--   Run on staging FIRST, then production after verification.
-- ============================================================================


-- ============================================================================
-- 1. Extend products table
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS price_credits INTEGER,
  ADD COLUMN IF NOT EXISTS price_usd_cents INTEGER,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order INTEGER,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_sku_unique'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
  END IF;
END;
$$;


-- ============================================================================
-- 2. Seed product rows
--    ON CONFLICT on sku — safe to re-run
-- ============================================================================

-- Reports
INSERT INTO public.products (name, product_type, sku, price_credits, active, display_order) VALUES
  ('Business Presence Report', 'report', 'business_presence_report', 3, true, 1),
  ('Head to Head Analysis', 'report', 'h2h', 1, true, 10),
  ('Top 3 Competitors', 'report', 't3c', 1, true, 11),
  ('Competitive Position', 'report', 'cp', 1, true, 12),
  ('AI SEO Optimizer', 'report', 'ai_seo', 1, true, 20),
  ('Landing Page Optimizer', 'report', 'landing_page', 1, true, 21),
  ('Keyword Research', 'report', 'keyword_research', 1, true, 22),
  ('SEO Audit', 'report', 'seo_audit', 1, true, 23),
  ('SEO Comprehensive', 'report', 'seo_comprehensive', 1, true, 24)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price_credits = EXCLUDED.price_credits,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Credit packs (stripe_price_id populated later via admin or manual update)
INSERT INTO public.products (name, product_type, sku, price_usd_cents, active, display_order) VALUES
  ('Spark Pack', 'credit_pack', 'spark_pack', 999, true, 100),
  ('Boost Pack', 'credit_pack', 'boost_pack', 2499, true, 101)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd_cents = EXCLUDED.price_usd_cents,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Subscription plans
INSERT INTO public.products (name, product_type, sku, price_usd_cents, active, display_order, metadata) VALUES
  ('Starter Plan', 'subscription_plan', 'starter', 4999, true, 200,
   '{"monthly_credits": 25, "bpr_monthly_limit": 4}'::jsonb),
  ('Growth Plan', 'subscription_plan', 'growth', 9999, true, 201,
   '{"monthly_credits": 40, "bpr_monthly_limit": 8}'::jsonb),
  ('Pro Plan', 'subscription_plan', 'pro', 19999, true, 202,
   '{"monthly_credits": 50, "bpr_monthly_limit": 12}'::jsonb)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd_cents = EXCLUDED.price_usd_cents,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order,
  metadata = EXCLUDED.metadata,
  updated_at = now();


-- ============================================================================
-- 3. Fix refund_on_report_failure()
--    - Remove free slot restoration (free slot is NEVER restored)
--    - Fix ::text cast bug (report_type is enum, not text)
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

  -- FREE SLOT: intentionally NOT restored.
  -- The free slot (profiles.free_reports_used) is consumed once and never returned,
  -- even if the report fails. This is a deliberate business rule.

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
-- 4. Null weekly_limit on plan_report_allowances
--    Column kept for reversibility; logic removed from code.
-- ============================================================================

UPDATE plan_report_allowances SET weekly_limit = NULL WHERE weekly_limit IS NOT NULL;


-- ============================================================================
-- 5. Backfill reports.credit_amount for BPR rows
--    Only touch rows where credit_amount IS NULL (legacy inserts before 058).
-- ============================================================================

UPDATE reports
SET credit_amount = 3
WHERE report_type = 'business_presence_report'
  AND credit_amount IS NULL
  AND usage_type = 'credits';


-- ============================================================================
-- 6. Fix check_and_reserve_free_slot to store ISO timestamp
--    Was: jsonb_build_object(p_free_system, p_report_type) → {"bpr":"bpr"}
--    Now: jsonb_build_object(p_free_system, to_jsonb(now())) → {"bpr":"2026-04-15T..."}
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_and_reserve_free_slot(
  p_user_id     UUID,
  p_free_system TEXT,
  p_report_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current JSONB;
BEGIN
  SELECT free_reports_used INTO v_current
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current ? p_free_system THEN
    RETURN 'already_used';
  END IF;

  UPDATE public.profiles
  SET free_reports_used = COALESCE(free_reports_used, '{}'::jsonb)
                       || jsonb_build_object(p_free_system, to_jsonb(now()::text))
  WHERE id = p_user_id;

  RETURN NULL;
END;
$$;


-- ============================================================================
-- 7. Backfill existing bad free_reports_used values
--    {"business_presence_report":"business_presence_report"} → {"business_presence_report":true}
--    Only touch rows where the value equals the key name (the known bug shape).
-- ============================================================================

UPDATE profiles
SET free_reports_used = jsonb_set(
  free_reports_used,
  '{business_presence_report}',
  'true'::jsonb
)
WHERE free_reports_used ? 'business_presence_report'
  AND free_reports_used->>'business_presence_report' = 'business_presence_report';


-- ============================================================================
-- RLS: products table — service role full, authenticated read
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated read products' AND tablename = 'products'
  ) THEN
    CREATE POLICY "Authenticated read products" ON public.products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role full products' AND tablename = 'products'
  ) THEN
    CREATE POLICY "Service role full products" ON public.products FOR ALL USING (true) WITH CHECK (true);
  END IF;
END;
$$;

GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- 1. Products seeded:
--    SELECT sku, name, product_type, price_credits, price_usd_cents, active
--    FROM products WHERE sku IS NOT NULL ORDER BY display_order;
--
-- 2. Refund trigger no longer restores free slot:
--    SELECT prosrc FROM pg_proc WHERE proname = 'refund_on_report_failure';
--    -- Should NOT contain 'free_reports_used - NEW.free_system'
--
-- 3. Weekly limits nulled:
--    SELECT * FROM plan_report_allowances WHERE weekly_limit IS NOT NULL;
--    -- Should return 0 rows
--
-- 4. Free slot RPC stores timestamp:
--    SELECT prosrc FROM pg_proc WHERE proname = 'check_and_reserve_free_slot';
--    -- Should contain 'to_jsonb(now()::text)'
--
-- 5. Bad free_reports_used values fixed:
--    SELECT id, free_reports_used FROM profiles
--    WHERE free_reports_used->>'business_presence_report' = 'business_presence_report';
--    -- Should return 0 rows
-- ============================================================================
