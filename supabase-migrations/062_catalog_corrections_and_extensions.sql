-- ============================================================================
-- Migration 062: Catalog corrections + forward-compat columns + credit_amount backfill
--
-- 1. Correct USD prices on packs and plans (061 had wrong values)
-- 2. Add credits_granted column (how many credits a pack/plan delivers)
-- 3. Add forward-compat columns for future GBAI Commerce Backend v1:
--      description, tagline, features, lifecycle_status, visibility
-- 4. Backfill credit_amount on historical BPR pack-credit rows (code-path safe)
--
-- Safe to re-run. Run on staging and production.
-- ============================================================================


-- ============================================================================
-- 1. Forward-compatible columns
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS credits_granted INTEGER,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

COMMENT ON COLUMN public.products.credits_granted IS
  'Credits delivered to the buyer when this item is purchased/renewed (packs, plans). NULL for reports.';
COMMENT ON COLUMN public.products.description IS
  'Long-form description for customer-facing pages.';
COMMENT ON COLUMN public.products.tagline IS
  'Short marketing tagline.';
COMMENT ON COLUMN public.products.features IS
  'JSONB array of feature strings for customer-facing pages.';
COMMENT ON COLUMN public.products.lifecycle_status IS
  'active | draft | archived | discontinued. Archived items stay referenceable but hidden from storefront.';
COMMENT ON COLUMN public.products.visibility IS
  'public (shown on storefront) | internal (admin-only).';


-- ============================================================================
-- 2. Correct seeded prices + credits_granted on packs and plans
-- ============================================================================

-- Spark Pack: $5, 3 credits
UPDATE public.products
SET price_usd_cents = 500, credits_granted = 3, updated_at = now()
WHERE sku = 'spark_pack';

-- Boost Pack: $10, 10 credits
UPDATE public.products
SET price_usd_cents = 1000, credits_granted = 10, updated_at = now()
WHERE sku = 'boost_pack';

-- Starter Plan: $20/month, 25 credits/month
UPDATE public.products
SET price_usd_cents = 2000, credits_granted = 25, updated_at = now()
WHERE sku = 'starter';

-- Growth Plan: $30/month, 40 credits/month
UPDATE public.products
SET price_usd_cents = 3000, credits_granted = 40, updated_at = now()
WHERE sku = 'growth';

-- Pro Plan: $40/month, 50 credits/month
UPDATE public.products
SET price_usd_cents = 4000, credits_granted = 50, updated_at = now()
WHERE sku = 'pro';


-- ============================================================================
-- 3. Backfill reports.credit_amount for historical BPR rows
--    Only touch rows that consumed pack credits (usage_type='credits') with NULL credit_amount.
--    Subscription-path and free-path rows legitimately have NULL credit_amount.
-- ============================================================================

UPDATE public.reports
SET credit_amount = 3
WHERE report_type = 'business_presence_report'
  AND usage_type = 'credits'
  AND credit_amount IS NULL;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- 1. Catalog state:
--    SELECT sku, name, product_type, price_credits, price_usd_cents,
--           credits_granted, active, lifecycle_status
--    FROM products WHERE sku IS NOT NULL ORDER BY display_order;
--
-- 2. Forward-compat columns exist:
--    SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'products'
--      AND column_name IN ('credits_granted','description','tagline','features','lifecycle_status','visibility');
--
-- 3. Backfilled BPR rows:
--    SELECT COUNT(*) FROM reports
--    WHERE report_type = 'business_presence_report'
--      AND usage_type = 'credits' AND credit_amount IS NULL;
--    -- Should be 0 after this migration.
-- ============================================================================
