-- ============================================================================
-- Migration 064: Catalog as source of truth
--
-- Part of the Catalog Full Integration (5-sprint work starting 2026-04-16).
-- See .workspace/PLAN-catalog-full-integration.md and
-- .workspace/ROLLBACK-PLAN-catalog-migration.md.
--
-- 1. Add tenant_id nullable column on products (forward-compat for multi-tenant)
-- 2. Backfill stripe_price_id on plan + pack catalog rows from environment-
--    appropriate Stripe IDs. Each Supabase instance (staging vs production)
--    gets its own Stripe IDs seeded separately via a manual UPDATE block at
--    the bottom of this migration. DO NOT commit Stripe IDs to git — they are
--    filled in by Dave at run time per environment.
-- 3. Verify price_credits + credits_granted parity with hardcoded constants
--    that are about to be deleted from code (PLAN_MONTHLY_CAPS, PLAN_CAPS,
--    PLAN_CREDITS_PER_PERIOD, packMap hardcoded credits).
--
-- Idempotent. Safe to re-run. No destructive ALTERs.
-- ============================================================================


-- ============================================================================
-- 1. tenant_id forward-compat column
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tenant_id UUID;

COMMENT ON COLUMN public.products.tenant_id IS
  'Reserved for future multi-tenant deployment (Module 4.20). NULL means default tenant (GBAI). No RLS or routing logic uses this column yet.';


-- ============================================================================
-- 2. Verify parity (read-only checks — informational)
-- ============================================================================

-- Sanity check: show current state of plan + pack rows that code depends on.
-- Run these SELECTs manually and verify before running the UPDATE block below.
--
--   SELECT sku, name, product_type, price_credits, price_usd_cents, credits_granted, stripe_price_id
--   FROM products WHERE sku IN ('starter', 'growth', 'pro', 'spark_pack', 'boost_pack')
--   ORDER BY display_order;
--
-- Expected (as of pre-migration state):
--   starter:    price_credits=25  price_usd_cents=2000  credits_granted=25
--   growth:     price_credits=40  price_usd_cents=3000  credits_granted=40
--   pro:        price_credits=50  price_usd_cents=4000  credits_granted=50
--   spark_pack: price_credits=3   price_usd_cents=500   credits_granted=3
--   boost_pack: price_credits=10  price_usd_cents=1000  credits_granted=10


-- ============================================================================
-- 3. stripe_price_id backfill — ENVIRONMENT-SPECIFIC
--
-- After running this migration, run the appropriate UPDATE block below
-- based on which environment you're in. DO NOT run both blocks.
--
-- The Stripe Price IDs below are placeholders. Dave will replace with the
-- actual IDs from the Stripe dashboard (or from Vercel env vars) per
-- environment before running.
-- ============================================================================

-- ─── STAGING ──────────────────────────────────────────────────────────────
-- Run on staging Supabase only. Uses Stripe test-mode price IDs.
--
-- UPDATE public.products SET stripe_price_id = 'price_XXXXX_starter_test', updated_at = now() WHERE sku = 'starter';
-- UPDATE public.products SET stripe_price_id = 'price_XXXXX_growth_test',  updated_at = now() WHERE sku = 'growth';
-- UPDATE public.products SET stripe_price_id = 'price_XXXXX_pro_test',     updated_at = now() WHERE sku = 'pro';
-- UPDATE public.products SET stripe_price_id = 'price_XXXXX_spark_test',   updated_at = now() WHERE sku = 'spark_pack';
-- UPDATE public.products SET stripe_price_id = 'price_XXXXX_boost_test',   updated_at = now() WHERE sku = 'boost_pack';


-- ─── PRODUCTION ───────────────────────────────────────────────────────────
-- Run on production Supabase only. Uses Stripe live-mode price IDs.
--
-- UPDATE public.products SET stripe_price_id = 'price_YYYYY_starter_live', updated_at = now() WHERE sku = 'starter';
-- UPDATE public.products SET stripe_price_id = 'price_YYYYY_growth_live',  updated_at = now() WHERE sku = 'growth';
-- UPDATE public.products SET stripe_price_id = 'price_YYYYY_pro_live',     updated_at = now() WHERE sku = 'pro';
-- UPDATE public.products SET stripe_price_id = 'price_YYYYY_spark_live',   updated_at = now() WHERE sku = 'spark_pack';
-- UPDATE public.products SET stripe_price_id = 'price_YYYYY_boost_live',   updated_at = now() WHERE sku = 'boost_pack';


-- ============================================================================
-- VERIFICATION QUERIES (run after applying + the env-specific UPDATE block)
-- ============================================================================
-- 1. tenant_id column exists:
--    SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'products' AND column_name = 'tenant_id';
--
-- 2. Every active plan/pack has a stripe_price_id:
--    SELECT sku, stripe_price_id FROM products
--    WHERE sku IN ('starter','growth','pro','spark_pack','boost_pack')
--      AND (stripe_price_id IS NULL OR stripe_price_id = '');
--    -- Should return 0 rows after backfill.
--
-- 3. All required catalog fields match code constants (pre-Sprint 1 deletion):
--    SELECT sku, price_credits, credits_granted, price_usd_cents
--    FROM products WHERE sku IN ('starter','growth','pro','spark_pack','boost_pack')
--    ORDER BY display_order;
-- ============================================================================
