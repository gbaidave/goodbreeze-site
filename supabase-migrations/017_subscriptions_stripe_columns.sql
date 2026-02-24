-- ============================================================================
-- Good Breeze AI - Add missing Stripe columns to subscriptions table
-- Migration: 017_subscriptions_stripe_columns.sql
-- Created: 2026-02-24
--
-- Context: Migration 002 (saas_tables) was created directly in Supabase
-- before the migrations folder existed. The subscriptions table was created
-- with minimal columns (id, user_id, plan, status, created_at). Stripe
-- webhook columns were never added to the DB, only referenced in app code.
--
-- All statements use ADD COLUMN IF NOT EXISTS — safe to re-run.
-- ============================================================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at              TIMESTAMPTZ DEFAULT NOW();

-- Index for Stripe ID lookups (deleted / past_due webhook handlers)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
  ON subscriptions(stripe_customer_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
--
-- Confirm new columns:
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'subscriptions'
--   ORDER BY ordinal_position;
--
-- Expected columns after this migration:
--   id, user_id, plan, status, created_at (existing)
--   stripe_subscription_id, stripe_customer_id,
--   current_period_start, current_period_end,
--   cancel_at_period_end, updated_at (new)
-- ============================================================================
