-- ============================================================================
-- Migration 068: Catalog Sprint 4 — pre-provision stub columns + LIVE upgrades
--
-- Part of the Catalog Full Integration (Sprint 4).
-- Per locked decision #2 in .workspace/PLAN-sprint4-catalog-design.md §19,
-- this migration pre-provisions EVERY stub column referenced across the
-- planned catalog features (~45 columns) so future sprints can light up
-- tabs without needing their own migrations.
--
-- Columns are added with safe defaults (NULL or FALSE) so existing rows
-- continue to behave exactly as before. No production code reads these
-- stub columns in Sprint 4 — they are purely placeholder storage.
--
-- LIVE upgrades:
--   1. badge column (promoted from metadata.badge to proper column)
--   2. lifecycle_status column backfilled from existing active flag
--
-- STUB columns are grouped below by the design-doc section they support.
--
-- Idempotent. Safe to re-run. Metadata-only ALTERs (no table rewrite).
-- Expected run time: < 1 second.
-- ============================================================================


-- ============================================================================
-- 1. LIVE upgrade: badge column (§5)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS badge TEXT;

COMMENT ON COLUMN public.products.badge IS
  'Product badge shown on pricing surfaces. One of: best-value, most-popular, new, limited-time, sale, beta, coming-soon, almost-gone, flash-sale, recommended, free. NULL = no badge. Auto-badges (new/sale/free) may be computed at read time; stored value is the manually-set override.';

-- Backfill badge from metadata.badge if it was set there previously
UPDATE public.products
SET badge = metadata->>'badge'
WHERE badge IS NULL AND metadata ? 'badge';


-- ============================================================================
-- 2. LIVE upgrade: lifecycle_status (§9)
-- Backward-compat with the `active` boolean: both coexist in Sprint 4.
-- UI still reads/writes `active`; lifecycle_status is backfilled here
-- and will become the primary source in a future sprint.
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'active'
  CHECK (lifecycle_status IN ('draft', 'scheduled', 'active', 'sunset', 'retired', 'archived'));

COMMENT ON COLUMN public.products.lifecycle_status IS
  'Product lifecycle state. In Sprint 4 this is backfilled from the `active` boolean and not yet surfaced in UI. Future sprints will make this the primary source. States: draft, scheduled, active, sunset, retired, archived.';

-- Backfill lifecycle_status from existing `active` flag.
-- Only touch rows that still hold the DEFAULT value (safe on re-run).
UPDATE public.products
SET lifecycle_status = CASE WHEN active = TRUE THEN 'active' ELSE 'retired' END
WHERE lifecycle_status = 'active'
  AND (active = FALSE OR active IS NULL);


-- ============================================================================
-- 3. STUB: Visibility & Lifecycle (§9)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'
  CHECK (visibility IN ('public', 'unlisted', 'hidden', 'admin_preview'));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS grandfather_price_on_change BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.products.visibility IS
  'STUB — not yet read by UI. public (default), unlisted (direct link only), hidden (admin-only), admin_preview (admin role only).';

COMMENT ON COLUMN public.products.scheduled_publish_at IS
  'STUB — not yet read by UI. When set + lifecycle_status=scheduled, product auto-publishes at this timestamp.';

COMMENT ON COLUMN public.products.grandfather_price_on_change IS
  'STUB — not yet read by UI. When TRUE (default), existing subscribers keep old price on price changes (Stripe native behavior). When FALSE, force-migrate on next renewal.';


-- ============================================================================
-- 4. STUB: Copy & Tags (§3, §4)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description_medium TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description_long TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.products.description_medium IS
  'STUB — not yet read by UI. ~500 char expanded copy for directory/listing pages.';

COMMENT ON COLUMN public.products.description_long IS
  'STUB — not yet read by UI. Full rich-text (Markdown) copy for future product detail pages.';

COMMENT ON COLUMN public.products.tags IS
  'STUB — not yet read by UI. Internal admin tags for filtering/grouping. Limited vocabulary.';

COMMENT ON COLUMN public.products.hashtags IS
  'STUB — not yet read by UI. Customer-facing marketing hashtags shown on product/landing pages.';


-- ============================================================================
-- 5. STUB: Sale / Promo pricing (§8.1 – §8.3)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_price_usd_cents INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_price_credits INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_starts_at TIMESTAMPTZ;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_label TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS available_starts_at TIMESTAMPTZ;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS available_ends_at TIMESTAMPTZ;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS flash_sale_countdown BOOLEAN DEFAULT FALSE;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS flash_sale_scarcity_copy TEXT;

COMMENT ON COLUMN public.products.sale_price_usd_cents IS
  'STUB — not yet read by checkout. When set + sale window active, pricing surfaces show struck-through regular price with sale price.';

COMMENT ON COLUMN public.products.sale_label IS
  'STUB — optional sale name (e.g., "Black Friday Sale") shown alongside the sale price.';


-- ============================================================================
-- 6. STUB: Quantity rules & capacity (§8.7, §8.8, §12)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS min_purchase_qty INTEGER DEFAULT 1;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS max_purchase_qty INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_cap INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_sold INTEGER DEFAULT 0;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS max_concurrent_executions INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS daily_execution_cap INTEGER;

COMMENT ON COLUMN public.products.pricing_tiers IS
  'STUB — not yet read by checkout. Tiered pricing array: [{min_qty, max_qty, price_usd_cents}]. Example: buy 5+ save 10%.';

COMMENT ON COLUMN public.products.inventory_cap IS
  'STUB — not yet read. When set + inventory_sold >= cap, product auto-transitions to sold-out state (waitlist opens).';


-- ============================================================================
-- 7. STUB: Payment plans (§8.6)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS payment_plan_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS payment_plan_price_usd_cents INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS payment_plan_installments INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS payment_plan_fee_usd_cents INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS payment_plan_stripe_price_id TEXT;

COMMENT ON COLUMN public.products.payment_plan_price_usd_cents IS
  'STUB — not yet read by checkout. TOTAL price when paid in installments (can be HIGHER than lump-sum price to compensate for cancellation risk).';

COMMENT ON COLUMN public.products.payment_plan_installments IS
  'STUB — number of installments (e.g., 3, 6, 12).';


-- ============================================================================
-- 8. STUB: SEO & Media (§10)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS url_slug TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS canonical_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS card_image_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS icon TEXT;

-- Unique index on url_slug only when non-null (future pretty URLs: /p/{slug})
CREATE UNIQUE INDEX IF NOT EXISTS products_url_slug_key
  ON public.products (url_slug) WHERE url_slug IS NOT NULL;

COMMENT ON COLUMN public.products.url_slug IS
  'STUB — not yet used for routing. Future /p/{slug} pretty URL identifier. Unique per tenant (enforced via partial unique index).';


-- ============================================================================
-- 9. STUB: Ops & Business (§13)
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_usd_cents INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_notes TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS data_retention_days INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS available_countries TEXT[];

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS blocked_countries TEXT[];

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tax_category TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS terms_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS refund_policy TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS refund_window_days INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS trial_days INTEGER;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS trial_requires_card BOOLEAN DEFAULT TRUE;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS affiliate_commission_rate DECIMAL(5,2);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS affiliate_commission_flat_cents INTEGER;

COMMENT ON COLUMN public.products.cost_usd_cents IS
  'STUB — internal COGS (cost of goods sold) per unit. Admin-only; never shown to customers. Used for margin analysis.';

COMMENT ON COLUMN public.products.admin_notes IS
  'STUB — internal admin-only notes (e.g., "phasing out Q3", "high support load"). Never shown to customers.';

COMMENT ON COLUMN public.products.tax_category IS
  'STUB — Stripe Tax category code. Examples: digital_goods, service, subscription.';


-- ============================================================================
-- 10. STUB: sync error tracking (for Stripe Option B human-readable errors)
-- Supports human-readable error recovery per decision confirmed 2026-04-16.
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sync_error_detail TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS last_sync_attempt_at TIMESTAMPTZ;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS last_sync_success_at TIMESTAMPTZ;

COMMENT ON COLUMN public.products.sync_error_detail IS
  'Human-readable Stripe sync error message. NULL when last sync succeeded. Populated when a save-to-Stripe call fails so admin can see + retry.';


-- ============================================================================
-- 11. Verification queries (run after migration, paste into Supabase SQL editor)
-- ============================================================================

-- Column count (should be ~60+ now, up from ~15 pre-068):
--   SELECT COUNT(*) FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'products';

-- Verify every existing row has lifecycle_status set:
--   SELECT sku, active, lifecycle_status FROM public.products ORDER BY display_order;

-- Verify badge column populated from metadata where it existed:
--   SELECT sku, badge, metadata->>'badge' AS metadata_badge FROM public.products
--   WHERE metadata ? 'badge' OR badge IS NOT NULL;

-- Confirm no rows broken:
--   SELECT sku, name, product_type, price_credits, price_usd_cents, credits_granted, active
--   FROM public.products ORDER BY display_order;
