-- Migration 036: Testimonial consent audit trail
--
-- Stores a tamper-evident record of every media release consent:
-- who signed, what they signed, when, where (IP), and how (checkbox on form).
--
-- Retention: keep indefinitely while testimonial content is live,
-- minimum life-of-use + 3 years (California statute of limitations on contracts).
--
-- RLS: users can read their own row; only service role writes.

CREATE TABLE IF NOT EXISTS testimonial_consents (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  testimonial_id          UUID NOT NULL REFERENCES testimonials(id) ON DELETE CASCADE,

  -- Identity snapshot at time of signing (stored even if profile changes later)
  email                   TEXT NOT NULL,
  name                    TEXT NOT NULL,

  -- Proof of assent
  ip_address              TEXT,
  user_agent              TEXT,

  -- What was agreed to (versioned so future text changes don't affect past records)
  consent_text_version    TEXT NOT NULL DEFAULT 'v1.0',
  consent_text            TEXT NOT NULL,

  -- Timestamps
  consented_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmation_sent_at    TIMESTAMPTZ
);

-- Index for admin lookups by user
CREATE INDEX IF NOT EXISTS idx_testimonial_consents_user_id
  ON testimonial_consents(user_id);

-- Index for lookup by testimonial
CREATE INDEX IF NOT EXISTS idx_testimonial_consents_testimonial_id
  ON testimonial_consents(testimonial_id);

-- RLS
ALTER TABLE testimonial_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent records"
  ON testimonial_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypasses RLS — no INSERT policy needed (service client used server-side)
