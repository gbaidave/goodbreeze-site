-- ============================================================================
-- Migration 004: Testimonials table
-- Phase 9 — Testimonial System
-- Run AFTER: 003_phase0_additions.sql
-- ============================================================================

-- Testimonials submitted by users for credit rewards.
-- Written = 1 free report credit. Video (Loom/YouTube/Drive) = 5 free report credits.
-- Credits are granted immediately on submission (status stays 'pending' for admin review).
-- One submission per type per user.

CREATE TABLE IF NOT EXISTS testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type            TEXT NOT NULL CHECK (type IN ('written', 'video')),

  -- Written testimonial
  content         TEXT,

  -- Video link (Loom, YouTube, or Google Drive)
  video_url       TEXT,

  -- 2-3 word pull-quote headline (e.g. "Finally ranked #1", "Saved 10 hours")
  pull_quote      TEXT NOT NULL,

  -- California consent waiver — must be true before submission is accepted
  ca_consent      BOOLEAN NOT NULL DEFAULT false,

  -- Admin review status
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note      TEXT,

  -- Credits granted on submission
  credits_granted INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One submission per type per user (written + video are tracked separately)
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_user_type
  ON testimonials(user_id, type);

CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status   ON testimonials(status);

COMMENT ON TABLE testimonials IS
  'User testimonials submitted for credit rewards.
   Written = 1 credit, Video (Loom/YouTube/Drive) = 5 credits, both granted immediately.
   Status starts pending for admin review. One of each type allowed per user.
   CA consent waiver must be accepted before submission is recorded.';

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own testimonials"
  ON testimonials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Verification
-- ============================================================================
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'testimonials';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'testimonials';
