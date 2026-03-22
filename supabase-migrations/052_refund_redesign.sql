-- Migration 052: Refund system redesign
-- Drops and recreates refund_requests with clean schema.
-- Adds 'denied' to support_requests status.
-- Adds 'refund_denied' notification type.
-- Safe: no real records exist in staging or production.

-- ─── 1. Drop old refund_requests table ────────────────────────────────────────
DROP TABLE IF EXISTS public.refund_requests CASCADE;

-- ─── 2. Recreate with clean schema ────────────────────────────────────────────
CREATE TABLE public.refund_requests (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  support_request_id          UUID REFERENCES public.support_requests(id) ON DELETE SET NULL,

  -- What the user selected they want refunded
  user_selected_product_id    TEXT,           -- stripe_subscription_id or stripe_payment_intent_id
  user_selected_product_label TEXT,           -- e.g. "Starter Plan — Mar 1, 2026 — $49.99"

  -- Product info (derived from selection)
  product_type                TEXT CHECK (product_type IN ('subscription', 'credit_pack')),
  product_label               TEXT,           -- e.g. "Starter Plan"
  amount_paid_cents           INT,
  purchase_date               TIMESTAMPTZ,

  -- Eligibility snapshot at time of request
  credits_used_at_request     INT NOT NULL DEFAULT 0,
  is_eligible                 BOOLEAN NOT NULL DEFAULT false,
  ineligibility_reasons       TEXT[],         -- e.g. ARRAY['Credits have been used', 'Outside 14-day window']

  -- Stripe identifiers
  stripe_payment_id           TEXT,           -- payment intent ID (pi_xxx); looked up at processing time for subscriptions
  stripe_refund_id            TEXT,           -- populated after Stripe refund issued

  -- Status lifecycle: pending → approved → refunded | denied
  status                      TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'denied', 'refunded')),
  refund_amount_cents         INT,

  -- Denial fields (populated on deny action)
  deny_reason                 TEXT,           -- predefined: 'Credits already used' | 'Outside 14-day window' | 'Policy violation' | 'Duplicate request' | 'Other'
  deny_reason_detail          TEXT,           -- required when deny_reason = 'Other'

  -- Admin internal fields (never shown to user)
  admin_notes                 TEXT,
  reviewed_by                 UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at                 TIMESTAMPTZ,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX idx_refund_requests_user_id    ON public.refund_requests(user_id);
CREATE INDEX idx_refund_requests_status     ON public.refund_requests(status);
CREATE INDEX idx_refund_requests_created_at ON public.refund_requests(created_at DESC);

-- ─── 4. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refund requests"
  ON public.refund_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Admins use service client — no INSERT/UPDATE policies needed for users.

-- ─── 5. Add 'denied' to support_requests status ENUM ─────────────────────────
-- support_requests.status is a support_status ENUM type (not TEXT CHECK).
-- Must be a separate statement — PostgreSQL requires ADD VALUE outside transactions.
ALTER TYPE support_status ADD VALUE IF NOT EXISTS 'denied';

-- ─── 6. Add 'refund_denied' to notification_type ENUM ─────────────────────────
-- Must run as separate statement (PostgreSQL limitation).
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'refund_denied';

-- ─── 7. Cleanup script (run manually on staging + prod after migration) ───────
-- Uncomment and run separately AFTER this migration to wipe test data:
--
-- DELETE FROM public.credits
--   WHERE source IN ('pack', 'subscription')
--   AND user_id IN (SELECT id FROM public.profiles WHERE email IN ('dave@goodbreeze.ai', 'dave.silverstein58@gmail.com'));
--
-- UPDATE public.subscriptions
--   SET plan = 'free', status = 'active', credits_remaining = 0,
--       stripe_subscription_id = NULL, stripe_customer_id = NULL,
--       current_period_start = NULL, current_period_end = NULL,
--       cancel_at_period_end = false
--   WHERE user_id IN (SELECT id FROM public.profiles WHERE email IN ('dave@goodbreeze.ai', 'dave.silverstein58@gmail.com'));
