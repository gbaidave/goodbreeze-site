-- Migration 028: Admin failure tracking
-- Adds admin status/notes columns to failed reports and a settings table
-- for controlling notification preferences.

-- Add admin tracking columns to reports table
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS admin_failure_status TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (admin_failure_status IN ('unresolved', 'in_progress', 'resolved', 'wont_fix')),
  ADD COLUMN IF NOT EXISTS admin_failure_notes TEXT;

-- Index for admin failures dashboard queries
CREATE INDEX IF NOT EXISTS reports_admin_failure_status_idx
  ON public.reports(admin_failure_status, created_at DESC)
  WHERE status IN ('failed', 'failed_site_blocked');

-- Admin settings table (key/value store for notification config)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default notification settings
INSERT INTO public.admin_settings (key, value) VALUES
  ('failure_email_enabled',    'true'),
  ('digest_email_enabled',     'true'),
  ('digest_send_hour_pacific', '18')
ON CONFLICT (key) DO NOTHING;

-- RLS: admin_settings is service-role only — no user-facing policies
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION public.set_admin_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_admin_settings_updated_at();
