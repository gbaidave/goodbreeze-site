-- ============================================================================
-- Migration 025: n8n execution ID tracking + admin failure notifications
--
-- IMPORTANT: Supabase SQL Editor wraps each Run click in a transaction.
-- ALTER TYPE ... ADD VALUE cannot be used in the same transaction as DDL/DML
-- that uses the new value. Run PART 1 first (click Run), then run PART 2.
--
-- PART 1 adds: error_alert to notification_type ENUM
-- PART 2 adds: n8n_execution_id column + failure notification trigger
-- ============================================================================


-- ============================================================================
-- PART 1 — Run this block first, by itself
-- ============================================================================

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'error_alert';  -- admin gets: report failed in n8n


-- ============================================================================
-- PART 2 — Run after PART 1 has committed (separate click)
-- ============================================================================

-- Add n8n execution ID column to reports
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS n8n_execution_id TEXT;


-- Notify all admin users when a report transitions to failed/failed_site_blocked
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
        'Report failed: ' || COALESCE(NEW.report_type, 'unknown') ||
        ' for ' || COALESCE(v_user_email, NEW.user_id::text) ||
        ' (' || NEW.status || '). ' ||
        'n8n: https://n8n.goodbreeze.ai/executions/' || NEW.n8n_execution_id;
    ELSE
      v_message :=
        'Report failed: ' || COALESCE(NEW.report_type, 'unknown') ||
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

DROP TRIGGER IF EXISTS trg_notify_admin_on_report_failure ON reports;
CREATE TRIGGER trg_notify_admin_on_report_failure
  AFTER UPDATE OF status ON reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_report_failure();


-- Verification
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'n8n_execution_id';
-- SELECT unnest(enum_range(NULL::notification_type));  -- should include error_alert
-- SELECT tgname FROM pg_trigger WHERE tgname = 'trg_notify_admin_on_report_failure';
