-- Migration 012: Fix notify_on_report_status_change — cast report_type ENUM to text
--
-- Problem: notify_on_report_status_change() calls replace() on NEW.report_type
-- before the status guard that filters non-final states. PostgreSQL's replace()
-- requires (text, text, text) — it cannot implicitly cast a custom ENUM to text.
-- Result: every PATCH to reports (including status → processing) throws:
--   "function replace(report_type, unknown, unknown) does not exist"
--
-- Fix: cast NEW.report_type::text in the replace() call.

CREATE OR REPLACE FUNCTION notify_on_report_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type    notification_type;
  v_message TEXT;
  v_label   TEXT;
BEGIN
  -- Only fire when status actually changes
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;

  -- Build human-readable report type label
  -- Cast ENUM → text explicitly; replace() requires (text, text, text)
  v_label := replace(replace(NEW.report_type::text, '_', ' '), 'seo', 'SEO');

  IF NEW.status = 'complete' THEN
    v_type    := 'report_ready';
    v_message := 'Your ' || initcap(v_label) || ' report is ready to download.';

  ELSIF NEW.status = 'failed_site_blocked' THEN
    v_type    := 'report_failed';
    v_message := 'Your ' || initcap(v_label) || ' report could not be completed — the website blocked our analysis.';

  ELSIF NEW.status = 'failed' THEN
    v_type    := 'report_failed';
    v_message := 'Your ' || initcap(v_label) || ' report could not be completed. Please try again or contact support.';

  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, message)
  VALUES (NEW.user_id, v_type, v_message);

  RETURN NEW;
END;
$$;
