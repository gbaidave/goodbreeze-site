-- Migration 043: Make stripe_payment_id nullable on refund_requests
--
-- Root cause fix: the column was NOT NULL but the auto-populate logic in
-- /api/support can return null when Stripe has no PI on the subscription
-- (e.g. trial, pending invoice) or when the user has no pack purchase.
-- A null stripe_payment_id is valid — it just means the admin must enter
-- it manually. The NOT NULL constraint was silently aborting the INSERT
-- and preventing any refund_request row from being created at all.
--
-- Run as a single paste in Supabase SQL Editor.

ALTER TABLE public.refund_requests
  ALTER COLUMN stripe_payment_id DROP NOT NULL;
