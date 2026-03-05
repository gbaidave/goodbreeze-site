-- Migration 027: Refund requests table
-- Tracks monetary refund requests (actual Stripe refunds, not credit grants).
-- Admins review and issue Stripe refunds from the admin panel.

CREATE TABLE IF NOT EXISTS public.refund_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Stripe payment intent or subscription ID for the purchase being refunded
  stripe_payment_id       TEXT NOT NULL,
  product_type            TEXT NOT NULL CHECK (product_type IN ('subscription', 'credit_pack')),
  product_label           TEXT NOT NULL,      -- e.g. "Starter Plan", "Spark Pack"
  amount_paid_cents       INT,                -- original charge amount in cents
  credits_used_at_request INT NOT NULL DEFAULT 0, -- credits consumed at time of request
  purchase_date           TIMESTAMPTZ,        -- when the original purchase was made
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'denied', 'refunded')),
  stripe_refund_id        TEXT,               -- populated when refund is issued via Stripe API
  refund_amount_cents     INT,                -- actual amount refunded
  admin_notes             TEXT,
  reviewed_by             UUID REFERENCES public.profiles(id),
  reviewed_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS refund_requests_user_id_idx    ON public.refund_requests(user_id);
CREATE INDEX IF NOT EXISTS refund_requests_status_idx     ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS refund_requests_created_at_idx ON public.refund_requests(created_at DESC);

-- RLS: users can only read their own requests; admins use service client
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own refund requests" ON public.refund_requests;
CREATE POLICY "Users can view own refund requests"
  ON public.refund_requests FOR SELECT
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_refund_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_requests_updated_at ON public.refund_requests;
CREATE TRIGGER trg_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_refund_requests_updated_at();
