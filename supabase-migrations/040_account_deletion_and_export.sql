-- ============================================================================
-- Migration 040: Account Deletion Audit + Data Export Tracking
-- ============================================================================
-- Supports self-service account deletion (GDPR Art. 17) and data export
-- (GDPR Art. 20 / CCPA right to deletion and portability).
-- ============================================================================

-- ── 1. deleted_accounts — audit record of every hard-deleted account ─────────
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id                  UUID        PRIMARY KEY,  -- original auth.users UUID (no FK — user is gone)
  email               TEXT        NOT NULL,
  name                TEXT,
  stripe_customer_id  TEXT,
  deleted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_by          UUID,                     -- NULL = self-service; admin UUID = admin-initiated
  deletion_ip         TEXT
);

-- Only superadmin/admin/support can read; no direct user access
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.deleted_accounts
  USING (false);  -- all access via service role client only

-- ── 2. former_user_id — preserve identity on SET NULL tables ─────────────────
-- support_tickets.user_id is already SET NULL on profile delete
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS former_user_id UUID;

-- support_messages.sender_id is already SET NULL on profile delete
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS former_user_id UUID;

-- email_logs.user_id is already SET NULL on profile delete (if that column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_logs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.email_logs
      ADD COLUMN IF NOT EXISTS former_user_id UUID;
  END IF;
END $$;

-- ── 3. refund_requests — change CASCADE → SET NULL + add former_user_id ───────
-- Drop the existing FK constraint and re-add as SET NULL
ALTER TABLE public.refund_requests
  DROP CONSTRAINT IF EXISTS refund_requests_user_id_fkey;

ALTER TABLE public.refund_requests
  ADD CONSTRAINT refund_requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.refund_requests
  ADD COLUMN IF NOT EXISTS former_user_id UUID;

-- ── 4. data_export_logs — track every export attempt (abuse + audit) ─────────
CREATE TABLE IF NOT EXISTS public.data_export_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exported_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address   TEXT,
  user_agent   TEXT,
  success      BOOLEAN     NOT NULL DEFAULT true
);

ALTER TABLE public.data_export_logs ENABLE ROW LEVEL SECURITY;
-- Users can read their own logs; service role handles writes
CREATE POLICY "Users read own export logs" ON public.data_export_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ── 5. profiles — data_export_locked flag ────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS data_export_locked BOOLEAN NOT NULL DEFAULT false;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_data_export_logs_user_id ON public.data_export_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_accounts_email ON public.deleted_accounts(email);
