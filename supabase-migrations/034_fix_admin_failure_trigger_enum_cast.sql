-- ============================================================================
-- Good Breeze AI - Fix: notify_admin_on_report_failure COALESCE enum cast
-- Migration: 034_fix_admin_failure_trigger_enum_cast.sql
-- Created: 2026-03-09
--
-- Problem: notify_admin_on_report_failure() (migration 025) uses:
--   COALESCE(NEW.report_type, 'unknown')
--
-- PostgreSQL resolves the type of COALESCE by checking all arguments.
-- Since NEW.report_type is a custom ENUM (report_type), PostgreSQL tries to
-- cast the string literal 'unknown' to that ENUM at execution time.
-- 'unknown' is not a valid report_type ENUM value → ERROR every time the
-- trigger fires, regardless of whether report_type is NULL or not.
--
-- Result: every PATCH that transitions status to 'failed' or
-- 'failed_site_blocked' fails with:
--   "invalid input value for enum report_type: 'unknown'"
--
-- This breaks:
--   - FAIL-1/2/3: dashboard timeout auto-fail (PATCH /api/reports/[id])
--   - CR1/2/3: credit refund on report failure
--   - R-BV-BLOCKED: n8n LP Optimizer blocked site status update
--   - All other n8n failure-branch status updates
--
-- Fix: cast NEW.report_type::text before COALESCE (same fix applied in
-- migration 012 for notify_on_report_status_change).
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
  -- Only fire on a real status transition into a failed state
  IF (NEW.status IN ('failed', 'failed_site_blocked'))
     AND (OLD.status IS DISTINCT FROM NEW.status)
     AND (OLD.status NOT IN ('failed', 'failed_site_blocked')) THEN

    -- Look up the user's email for a readable message
    SELECT email INTO v_user_email
    FROM profiles
    WHERE id = NEW.user_id;

    IF NEW.n8n_execution_id IS NOT NULL THEN
      v_message :=
        'Report failed: ' || COALESCE(NEW.report_type::text, 'unknown') ||
        ' for ' || COALESCE(v_user_email, NEW.user_id::text) ||
        ' (' || NEW.status || '). ' ||
        'n8n: https://n8n.goodbreeze.ai/executions/' || NEW.n8n_execution_id;
    ELSE
      v_message :=
        'Report failed: ' || COALESCE(NEW.report_type::text, 'unknown') ||
        ' for ' || COALESCE(v_user_email, NEW.user_id::text) ||
        ' (' || NEW.status || '). No execution ID.';
    END IF;

    -- Notify all admin users
    INSERT INTO notifications (user_id, type, message)
    SELECT id, 'error_alert', v_message
    FROM profiles
    WHERE role = 'admin';

  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- VERIFICATION: trigger should still exist and function should compile cleanly
--   SELECT tgname FROM pg_trigger WHERE tgname = 'trg_notify_admin_on_report_failure';
--   SELECT prosrc FROM pg_proc WHERE proname = 'notify_admin_on_report_failure';
-- ============================================================================
