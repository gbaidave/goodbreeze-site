-- Migration 065 — Subscription cancel/reactivate notifications
--
-- Adds enum values so the webhook can fire bell notifications + log emails
-- when a user cancels or reactivates a subscription via the Stripe Customer Portal.
--
-- Two enums touched:
--   notification_type — bell notification rows in `notifications`
--   email_type        — log rows in `email_logs`
--
-- Additive only. No backfill, no data dependency.
-- Safe to run on staging + production in a single click each.
--
-- IMPORTANT: PostgreSQL requires `ALTER TYPE ... ADD VALUE` to run OUTSIDE any
-- transaction block that uses the new value. In Supabase SQL Editor, pasting
-- the full file and clicking Run is safe — each statement commits individually.

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'subscription_cancel_scheduled';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'subscription_reactivated';

ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'subscription_cancel_scheduled';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'subscription_reactivated';
