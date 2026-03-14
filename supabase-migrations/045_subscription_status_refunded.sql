-- Migration 045: Add 'refunded' to subscription_status ENUM
--
-- A refund is distinct from a cancellation:
--   cancelled = user chose to stop, no money returned
--   refunded  = admin returned payment and revoked access
--
-- MUST BE RUN AS A SEPARATE PASTE before any code that uses 'refunded'.
-- PostgreSQL cannot use a new ENUM value in the same transaction that creates it.

ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'refunded';
