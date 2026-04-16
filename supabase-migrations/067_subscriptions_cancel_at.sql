-- Migration 067 — Add cancel_at timestamp column to subscriptions
--
-- Why: Stripe Customer Portal (current version) sets a `cancel_at` TIMESTAMP
-- on the subscription instead of flipping `cancel_at_period_end` to true.
-- The boolean field stays false when the portal schedules a cancellation.
--
-- Our webhook was only mirroring `cancel_at_period_end`, so Portal-initiated
-- cancels never changed our DB — display stayed on "Renews", bell + email
-- never fired on CANCEL-02.
--
-- Fix: persist Stripe's `cancel_at` separately. Both the webhook transition
-- detection and the UI conditionals read (cancel_at IS NOT NULL OR cancel_at_period_end = TRUE).
--
-- Additive only. No backfill needed (new Stripe events will populate it on next webhook).
-- Safe on staging + production.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ;

COMMENT ON COLUMN subscriptions.cancel_at IS
  'When Stripe will actually cancel this subscription (set by Customer Portal cancel flow). '
  'NULL means not scheduled to cancel. Supersedes/augments the older cancel_at_period_end boolean.';
