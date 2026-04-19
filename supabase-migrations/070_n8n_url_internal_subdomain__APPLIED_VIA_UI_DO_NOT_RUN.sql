-- ============================================================================
-- !! ALREADY APPLIED -- DO NOT RUN THIS FILE !!
--
-- Applied manually on 2026-04-18 via the Supabase Dashboard
-- (Database -> Functions -> Edit) on BOTH staging and production, because the
-- SQL editor has a dollar-quote parsing bug that misreads the DECLARE block
-- as a standalone statement and errors with:
--   ERROR: 42P01: relation "v_user_email" does not exist
--
-- If you are replaying migrations from scratch (new environment), SKIP this
-- file. Instead, paste only the DECLARE..END body into the Database > Functions
-- UI for notify_admin_on_report_failure, or use a direct psql connection that
-- respects dollar-quoting.
-- ============================================================================
-- Good Breeze AI - Update n8n URL in admin failure notification trigger
-- Migration: 070_n8n_url_internal_subdomain.sql (renamed to flag as applied)
-- Created: 2026-04-18
--
-- n8n subdomain moved from n8n.goodbreeze.ai to internal.goodbreeze.ai
-- as part of the Google Safe Browsing mitigation + Cloudflare Access SSO gate.
-- The notify_admin_on_report_failure() trigger embeds a direct n8n execution
-- URL in admin error_alert notifications. This migration recreates the function
-- with the new hostname.
--
-- Previous version: migration 034 (enum cast fix) — same body minus URL change.
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_admin_on_report_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email  TEXT;
  v_message     TEXT;
BEGIN
  IF (NEW.status IN ('failed', 'failed_site_blocked'))
     AND (OLD.status IS DISTINCT FROM NEW.status)
     AND (OLD.status NOT IN ('failed', 'failed_site_blocked')) THEN

    SELECT email INTO v_user_email
    FROM profiles
    WHERE id = NEW.user_id;

    IF NEW.n8n_execution_id IS NOT NULL THEN
      v_message :=
        'Report failed: ' || COALESCE(NEW.report_type::text, 'unknown') ||
        ' for ' || COALESCE(v_user_email, NEW.user_id::text) ||
        ' (' || NEW.status || '). ' ||
        'n8n: https://internal.goodbreeze.ai/executions/' || NEW.n8n_execution_id;
    ELSE
      v_message :=
        'Report failed: ' || COALESCE(NEW.report_type::text, 'unknown') ||
        ' for ' || COALESCE(v_user_email, NEW.user_id::text) ||
        ' (' || NEW.status || '). No execution ID.';
    END IF;

    INSERT INTO notifications (user_id, type, message)
    SELECT id, 'error_alert', v_message
    FROM profiles
    WHERE role = 'admin';

  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- VERIFICATION
--   SELECT prosrc FROM pg_proc WHERE proname = 'notify_admin_on_report_failure';
--   -- should contain 'internal.goodbreeze.ai', not 'n8n.goodbreeze.ai'
-- ============================================================================
