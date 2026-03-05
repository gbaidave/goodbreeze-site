-- Migration 029: Support request redesign
-- Adds category, subject, priority, handled_by to support_requests.
-- Adds support_request_id FK + nullable stripe_payment_id to refund_requests.
-- Creates support_attachments table + private Supabase Storage bucket.
--
-- HOW TO RUN:
--   No enum changes — can be run as a single block in Supabase SQL Editor.
--   Run PART 1-3 together (public schema changes).
--   Then run PART 4 separately (storage schema — needs separate execution in some environments).


-- ============================================================================
-- PART 1 — support_requests: new columns
-- ============================================================================

ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'help'
    CHECK (category IN ('account_access', 'report_issue', 'billing', 'refund', 'dispute', 'help', 'feedback')),
  ADD COLUMN IF NOT EXISTS subject  VARCHAR(120),
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'high')),
  ADD COLUMN IF NOT EXISTS handled_by TEXT NOT NULL DEFAULT 'pending'
    CHECK (handled_by IN ('pending', 'ai', 'human'));

CREATE INDEX IF NOT EXISTS idx_support_requests_category
  ON public.support_requests(category);

CREATE INDEX IF NOT EXISTS idx_support_requests_priority_high
  ON public.support_requests(created_at DESC)
  WHERE priority = 'high';


-- ============================================================================
-- PART 2 — refund_requests: add support_request_id + make stripe_payment_id nullable
-- ============================================================================

-- Refund tickets submitted via support form don't have a Stripe ID at submission time
ALTER TABLE public.refund_requests
  ALTER COLUMN stripe_payment_id DROP NOT NULL;

-- Link auto-created refund_request back to the originating support ticket
ALTER TABLE public.refund_requests
  ADD COLUMN IF NOT EXISTS support_request_id UUID
    REFERENCES public.support_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_refund_requests_support_request_id
  ON public.refund_requests(support_request_id);


-- ============================================================================
-- PART 3 — support_attachments table
-- ============================================================================
-- Tracks files attached to support messages.
-- Files stored in the private 'support-attachments' Supabase Storage bucket.
-- Path convention: {user_id}/{message_id}/{filename}
-- 30-day cleanup via /api/cron/cleanup-attachments (reads created_at).

CREATE TABLE IF NOT EXISTS public.support_attachments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID        NOT NULL REFERENCES public.support_messages(id) ON DELETE CASCADE,
  uploaded_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  storage_path TEXT        NOT NULL,   -- path inside 'support-attachments' bucket
  file_name    TEXT        NOT NULL,   -- original filename shown in UI
  file_size    INT,                    -- bytes (for display only)
  mime_type    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_attachments_message_id
  ON public.support_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_support_attachments_uploaded_by
  ON public.support_attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_support_attachments_created_at
  ON public.support_attachments(created_at);

ALTER TABLE public.support_attachments ENABLE ROW LEVEL SECURITY;

-- Users can attach files to messages on their own open/in_progress tickets
DROP POLICY IF EXISTS "Users can insert own support_attachments" ON public.support_attachments;
CREATE POLICY "Users can insert own support_attachments"
  ON public.support_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.support_messages sm
      JOIN public.support_requests sr ON sr.id = sm.request_id
      WHERE sm.id = message_id
        AND sr.user_id = auth.uid()
        AND sr.status IN ('open', 'in_progress')
    )
  );

-- Users can read attachments on their own tickets; admins read all
DROP POLICY IF EXISTS "Users and admins can read support_attachments" ON public.support_attachments;
CREATE POLICY "Users and admins can read support_attachments"
  ON public.support_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_messages sm
      JOIN public.support_requests sr ON sr.id = sm.request_id
      WHERE sm.id = message_id
        AND (sr.user_id = auth.uid() OR is_admin())
    )
  );

-- Service role full access (cron cleanup + server-side ops)
DROP POLICY IF EXISTS "Service role full access on support_attachments" ON public.support_attachments;
CREATE POLICY "Service role full access on support_attachments"
  ON public.support_attachments FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- PART 4 — Supabase Storage bucket + RLS
-- (run this block in Supabase SQL Editor after Parts 1-3)
-- ============================================================================

-- Create private bucket (5MB per file, image/pdf/doc/txt only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage object RLS (idempotent — drop before create)
DROP POLICY IF EXISTS "Users can upload support attachments"   ON storage.objects;
DROP POLICY IF EXISTS "Users can read own support attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all support attachments" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access on support attachments" ON storage.objects;

-- Upload: user can only write into their own {user_id}/... folder
CREATE POLICY "Users can upload support attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'support-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Read: user can read their own files
CREATE POLICY "Users can read own support attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'support-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Read: admin can read all support attachment files
CREATE POLICY "Admins can read all support attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'support-attachments'
    AND is_admin()
  );

-- Full access: service role (cron cleanup uses this)
CREATE POLICY "Service role full access on support attachments"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'support-attachments'
    AND auth.role() = 'service_role'
  );
