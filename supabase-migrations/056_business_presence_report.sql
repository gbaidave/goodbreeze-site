-- Migration 056: Business Presence Report — enum renames + plan allowance system
--
-- This migration:
-- 1. Adds 'business_presence_report' to report_type and product_type enums
-- 2. Updates any existing rows from old enum values to new ones
-- 3. Creates plan_report_allowances table (DB-driven per-plan per-report-type limits)
-- 4. Creates report_type_usage table (monthly usage tracking per user per report type)
-- 5. Seeds initial allowance data for business_presence_report
--
-- IMPORTANT: Run the two ALTER TYPE statements FIRST as SEPARATE queries
-- in Supabase SQL editor. Then run the rest as a single query.
--
-- Step 1 (run alone):
--   ALTER TYPE public.report_type ADD VALUE IF NOT EXISTS 'business_presence_report';
--
-- Step 2 (run alone):
--   ALTER TYPE public.product_type ADD VALUE IF NOT EXISTS 'business_presence_report';
--
-- Step 3 (run the rest below as one query):

-- ============================================================================
-- 2. Update existing rows from old enum values to new
-- ============================================================================

-- Reports table: business_scorecard → business_presence_report
UPDATE public.reports
SET report_type = 'business_presence_report'
WHERE report_type = 'business_scorecard';

-- Credits table: scorecard → business_presence_report
UPDATE public.credits
SET product = 'business_presence_report'
WHERE product = 'scorecard';

-- NOTE: Old enum values ('business_scorecard', 'scorecard') cannot be dropped
-- without recreating the entire type. They remain as dead/unused values.

-- ============================================================================
-- 3. plan_report_allowances — DB-driven per-plan per-report-type limits
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_report_allowances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan TEXT NOT NULL,                    -- plan name (free, starter, growth, pro, custom)
  report_type public.report_type NOT NULL,
  monthly_limit INTEGER NOT NULL DEFAULT 0,   -- 0 = no plan allowance (use credits)
  weekly_limit INTEGER DEFAULT NULL,          -- NULL = no weekly rate limit
  is_additive BOOLEAN NOT NULL DEFAULT true,  -- true = on top of credit balance
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan, report_type)
);

-- RLS: admin-only write, service role read
ALTER TABLE public.plan_report_allowances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on plan_report_allowances"
  ON public.plan_report_allowances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant read to authenticated (entitlement checks read this)
GRANT SELECT ON public.plan_report_allowances TO authenticated;
GRANT ALL ON public.plan_report_allowances TO service_role;

-- ============================================================================
-- 4. report_type_usage — monthly usage tracking per user per report type
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.report_type_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type public.report_type NOT NULL,
  usage_month TEXT NOT NULL,        -- format: 'YYYY-MM' (e.g. '2026-03')
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_type, usage_month)
);

-- RLS: users can read their own, service role full access
ALTER TABLE public.report_type_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own report_type_usage"
  ON public.report_type_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on report_type_usage"
  ON public.report_type_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON public.report_type_usage TO authenticated;
GRANT ALL ON public.report_type_usage TO service_role;

-- Index for fast lookups by user + report type + month
CREATE INDEX IF NOT EXISTS idx_report_type_usage_lookup
  ON public.report_type_usage(user_id, report_type, usage_month);

-- ============================================================================
-- 5. Seed initial allowance data for business_presence_report
-- ============================================================================

-- Free plan: 1 free per account (handled by existing free slot system, not this table)
-- No row needed for free plan — absence means "use credits / free slot"

-- Starter plan: 4/month, additive, 1/week rate limit
INSERT INTO public.plan_report_allowances (plan, report_type, monthly_limit, weekly_limit, is_additive)
VALUES ('starter', 'business_presence_report', 4, 1, true)
ON CONFLICT (plan, report_type) DO UPDATE
SET monthly_limit = EXCLUDED.monthly_limit,
    weekly_limit = EXCLUDED.weekly_limit,
    is_additive = EXCLUDED.is_additive,
    updated_at = now();

-- Growth plan: 8/month, additive, 2/week
INSERT INTO public.plan_report_allowances (plan, report_type, monthly_limit, weekly_limit, is_additive)
VALUES ('growth', 'business_presence_report', 8, 2, true)
ON CONFLICT (plan, report_type) DO UPDATE
SET monthly_limit = EXCLUDED.monthly_limit,
    weekly_limit = EXCLUDED.weekly_limit,
    is_additive = EXCLUDED.is_additive,
    updated_at = now();

-- Pro plan: 12/month, additive, 3/week
INSERT INTO public.plan_report_allowances (plan, report_type, monthly_limit, weekly_limit, is_additive)
VALUES ('pro', 'business_presence_report', 12, 3, true)
ON CONFLICT (plan, report_type) DO UPDATE
SET monthly_limit = EXCLUDED.monthly_limit,
    weekly_limit = EXCLUDED.weekly_limit,
    is_additive = EXCLUDED.is_additive,
    updated_at = now();

-- Custom plan: no row needed — custom plans bypass all limits in entitlement.ts

-- ============================================================================
-- 6. RPC: increment_report_type_usage (atomic upsert + increment)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_report_type_usage(
  p_user_id UUID,
  p_report_type public.report_type,
  p_usage_month TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.report_type_usage (user_id, report_type, usage_month, count, last_used_at)
  VALUES (p_user_id, p_report_type, p_usage_month, 1, now())
  ON CONFLICT (user_id, report_type, usage_month)
  DO UPDATE SET count = report_type_usage.count + 1, last_used_at = now();
END;
$$;
