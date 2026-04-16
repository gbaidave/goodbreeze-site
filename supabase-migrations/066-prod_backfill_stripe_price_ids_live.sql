-- Migration 066-prod — Backfill stripe_price_id on PRODUCTION products
--
-- Production pair of migration 066 (which is staging-only with test-mode IDs).
-- Values below are Stripe LIVE-mode Price IDs. DO NOT run on staging —
-- staging uses test-mode IDs (see 066_backfill_stripe_price_ids_staging.sql).
--
-- Why: Sprint 1 webhook resolves incoming Stripe events by matching Price ID
-- against products.stripe_price_id. Production currently has test-mode IDs
-- (patched in error during staging diagnosis on 2026-04-16). Without this
-- backfill, every real (live-mode) customer.subscription.* webhook will 500
-- at the catalog-mismatch guard once the Sprint 1 code deploys.
--
-- Idempotent: re-running does nothing (values already set).
-- Run on production Supabase (ktvomvlweyqxxewuqubw) BEFORE pushing master.
--
-- Source of truth for IDs: memory/reference_stripe_price_ids.md

UPDATE products SET stripe_price_id = 'price_1TB0sSIMI2iVRBKykCxndkB7' WHERE sku = 'starter';
UPDATE products SET stripe_price_id = 'price_1TB0svIMI2iVRBKyz6jZUvXm' WHERE sku = 'growth';
UPDATE products SET stripe_price_id = 'price_1TB0tEIMI2iVRBKyGfCkSN8L' WHERE sku = 'pro';
UPDATE products SET stripe_price_id = 'price_1TB0piIMI2iVRBKy6Xqq2Il5' WHERE sku = 'spark_pack';
UPDATE products SET stripe_price_id = 'price_1TB0rqIMI2iVRBKy9hynd7fn' WHERE sku = 'boost_pack';

-- Verification query — should return 5 rows with live-mode IDs (price_1TB0...):
-- SELECT sku, product_type, stripe_price_id FROM products
-- WHERE product_type IN ('subscription_plan','credit_pack') ORDER BY product_type, sku;
