-- Migration 066 — Backfill stripe_price_id on STAGING products
--
-- Why: Migration 064 added the backfill statements but left them commented out,
-- intended to be filled in at run time per environment. Staging migration was
-- run with the block skipped, so every product row has stripe_price_id = NULL.
-- Result: every customer.subscription.created/updated webhook returns 500
-- (catalog mismatch), DB subscription row is never updated, Stripe Customer
-- Portal cancel has no effect on our UI.
--
-- Values below are STAGING / Stripe test-mode Price IDs (same values as in
-- goodbreeze-site/.env.local on staging). DO NOT run on production — production
-- uses Stripe live-mode Price IDs; apply migration 066-prod with live IDs there.
--
-- Idempotent: re-running does nothing (stripe_price_id already set).
-- Safe on staging only.

UPDATE products SET stripe_price_id = 'price_1T2FiZIlkTC3VEz5NA3fdSL6' WHERE sku = 'starter';
UPDATE products SET stripe_price_id = 'price_1T33AuIlkTC3VEz5pObIZXFD' WHERE sku = 'growth';
UPDATE products SET stripe_price_id = 'price_1T33BlIlkTC3VEz5CmeVkF4t' WHERE sku = 'pro';
UPDATE products SET stripe_price_id = 'price_1T3399IlkTC3VEz5mLd7Dg4g' WHERE sku = 'spark_pack';
UPDATE products SET stripe_price_id = 'price_1T2FjnIlkTC3VEz5leDfyYrW' WHERE sku = 'boost_pack';

-- Verification query — should return 5 rows with non-null stripe_price_id:
-- SELECT sku, product_type, stripe_price_id FROM products
-- WHERE product_type IN ('subscription_plan','credit_pack') ORDER BY product_type, sku;
