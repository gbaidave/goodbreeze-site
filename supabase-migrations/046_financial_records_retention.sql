-- Migration 046: Financial records retention for GDPR/CCPA compliance
--
-- Privacy policy Section 8 states: "Payment and transaction records are kept
-- for tax and financial compliance."
-- Migrations 002 created subscriptions and credits with ON DELETE CASCADE,
-- meaning they would be hard-deleted when an account is deleted. This migration
-- changes those FKs to ON DELETE SET NULL and adds former_user_id so deleted
-- accounts' financial records are preserved (anonymized, not destroyed).
--
-- The /api/account/delete route was also updated to pre-set former_user_id
-- on both tables before the hard delete fires.

-- ── subscriptions ─────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS former_user_id UUID;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ── credits ───────────────────────────────────────────────────────────────────
ALTER TABLE public.credits
  ADD COLUMN IF NOT EXISTS former_user_id UUID;

ALTER TABLE public.credits
  DROP CONSTRAINT IF EXISTS credits_user_id_fkey;

ALTER TABLE public.credits
  ADD CONSTRAINT credits_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
