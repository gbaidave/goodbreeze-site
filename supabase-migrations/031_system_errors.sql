-- Migration 031: System errors table
-- Tracks server-side errors from key API routes (auth, payments, webhooks, email, etc.)
-- so admins can monitor and resolve backend issues without needing to read server logs.
--
-- HOW TO RUN:
--   Single block — safe to run as-is in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.system_errors (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT        NOT NULL,   -- 'auth' | 'payment' | 'webhook' | 'api' | 'email'
  message        TEXT        NOT NULL,
  context        JSONB,                  -- additional error data (stack, params, etc.)
  route          TEXT,                   -- API route that threw the error (e.g. /api/reports/generate)
  resolved       BOOLEAN     NOT NULL DEFAULT false,
  resolved_at    TIMESTAMPTZ,
  resolved_notes TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_errors_type       ON public.system_errors(type);
CREATE INDEX IF NOT EXISTS idx_system_errors_resolved   ON public.system_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_system_errors_created_at ON public.system_errors(created_at DESC);

-- No RLS needed — only accessed via service role (server-side admin routes only)
