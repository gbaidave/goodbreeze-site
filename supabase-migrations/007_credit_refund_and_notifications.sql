-- ============================================================================
-- Good Breeze AI - T3: Credit Refund on Failure + Notification Triggers
-- Migration: 007_credit_refund_and_notifications.sql
-- Created: 2026-02-23
-- Implements:
--   T3-PENDING-ENTITLEMENT: Refund credits/free-slots when report fails
--   T3-NOTIFICATIONS: In-app notifications for report completion/failure/credits low
-- ============================================================================


-- ============================================================================
-- Fix: add 'failed_site_blocked' to report_status ENUM
-- This value is used by n8n when a site blocks our analysis.
-- Must be added before any trigger WHEN clause can reference it.
-- (ENUM values cannot be removed once added — safe to re-run: IF NOT EXISTS)
-- ============================================================================

ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'failed_site_blocked';


-- ============================================================================
-- T3-NOTIFICATIONS: Add credits_low to notification_type ENUM
-- ============================================================================

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'credits_low';


-- ============================================================================
-- T3-PENDING-ENTITLEMENT: Add usage tracking columns to reports
-- These are written at submission time so the refund trigger knows what to undo.
--
-- usage_type:    What entitlement path was used:
--                 'free'         → free slot reserved in free_reports_used JSONB
--                 'credits'      → credit pack row decremented
--                 'subscription' → monthly usage counter incremented
--                 'admin'        → admin/tester bypass — nothing to refund
-- credit_row_id: UUID of the credits row that was decremented (credits only)
-- free_system:   JSONB key in free_reports_used that was reserved (free only)
--                e.g. 'analyzer', 'brand_visibility', 'ai_seo_frictionless'
-- ============================================================================

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS usage_type   TEXT CHECK (usage_type IN ('free', 'credits', 'subscription', 'admin')),
  ADD COLUMN IF NOT EXISTS credit_row_id UUID REFERENCES credits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS free_system  TEXT;

COMMENT ON COLUMN reports.usage_type IS
  'What entitlement was consumed when this report was submitted.
   free=free slot, credits=credit pack, subscription=monthly cap, admin=no deduction.
   Used by refund_on_report_failure trigger to reverse the deduction on failure.';

COMMENT ON COLUMN reports.credit_row_id IS
  'FK to the credits row that was decremented for this report. NULL for non-credit reports.
   Used by refund_on_report_failure trigger to increment balance back on failure.';

COMMENT ON COLUMN reports.free_system IS
  'The free_reports_used JSONB key that was reserved for this report.
   e.g. ''analyzer'', ''brand_visibility'', ''ai_seo_frictionless''.
   Used by refund_on_report_failure trigger to clear the slot on failure.';

CREATE INDEX IF NOT EXISTS idx_reports_usage_type    ON reports(usage_type);
CREATE INDEX IF NOT EXISTS idx_reports_credit_row_id ON reports(credit_row_id);


-- ============================================================================
-- T3-PENDING-ENTITLEMENT: Refund trigger on report failure
-- Fires AFTER UPDATE on reports when status changes to 'failed' or 'failed_site_blocked'.
-- Reverses whatever entitlement was consumed at submission time.
-- ============================================================================

CREATE OR REPLACE FUNCTION refund_on_report_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start DATE;
BEGIN
  -- Only process when status actually changes TO a failure state
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('failed', 'failed_site_blocked') THEN RETURN NEW; END IF;

  -- ── Credit pack refund ────────────────────────────────────────────────────
  -- Increment the credit row balance back by 1
  IF NEW.usage_type = 'credits' AND NEW.credit_row_id IS NOT NULL THEN
    UPDATE credits
    SET balance = balance + 1
    WHERE id = NEW.credit_row_id;
  END IF;

  -- ── Free slot refund ──────────────────────────────────────────────────────
  -- Remove the JSONB key from free_reports_used so the slot is available again.
  -- The '-' operator removes a key from JSONB in PostgreSQL.
  IF NEW.usage_type = 'free' AND NEW.free_system IS NOT NULL THEN
    UPDATE profiles
    SET free_reports_used = free_reports_used - NEW.free_system
    WHERE id = NEW.user_id;
  END IF;

  -- ── Subscription monthly cap refund ──────────────────────────────────────
  -- Decrement the usage counter for the period this report was submitted in.
  -- Uses GREATEST(0, ...) as a safety floor — never go negative.
  IF NEW.usage_type = 'subscription' THEN
    v_period_start := date_trunc('month', NEW.created_at)::date;

    IF NEW.product = 'analyzer' THEN
      UPDATE usage
      SET analyzer_reports_used = GREATEST(0, analyzer_reports_used - 1)
      WHERE user_id = NEW.user_id AND period_start = v_period_start;
    ELSIF NEW.product = 'seo_auditor' THEN
      UPDATE usage
      SET seo_reports_used = GREATEST(0, seo_reports_used - 1)
      WHERE user_id = NEW.user_id AND period_start = v_period_start;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_on_report_failure ON reports;
CREATE TRIGGER trg_refund_on_report_failure
  AFTER UPDATE ON reports
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status
        AND NEW.status IN ('failed', 'failed_site_blocked'))
  EXECUTE FUNCTION refund_on_report_failure();


-- ============================================================================
-- T3-NOTIFICATIONS: In-app notification on report status change
-- Fires when report status changes to 'complete' (success) or failed states.
-- Inserts a notification row for the user — shows up in nav bell dropdown.
-- ============================================================================

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
  -- Build human-readable report type label
  v_label := replace(replace(NEW.report_type, '_', ' '), 'seo', 'SEO');

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

DROP TRIGGER IF EXISTS trg_notify_report_status_change ON reports;
CREATE TRIGGER trg_notify_report_status_change
  AFTER UPDATE ON reports
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status
        AND NEW.status IN ('complete', 'failed', 'failed_site_blocked'))
  EXECUTE FUNCTION notify_on_report_status_change();


-- ============================================================================
-- T3-NOTIFICATIONS: In-app notification when credits drop to 1
-- Fires AFTER UPDATE on credits when balance transitions from >1 to exactly 1.
-- Gives users a heads-up before their last credit is gone.
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_credits_low()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.balance = 1 AND OLD.balance > 1 THEN
    INSERT INTO notifications (user_id, type, message)
    VALUES (
      NEW.user_id,
      'credits_low',
      'You have 1 report credit remaining. Top up to keep running reports.'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_credits_low ON credits;
CREATE TRIGGER trg_notify_credits_low
  AFTER UPDATE ON credits
  FOR EACH ROW
  WHEN (NEW.balance = 1 AND OLD.balance > 1)
  EXECUTE FUNCTION notify_credits_low();


-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm success)
-- ============================================================================
--
-- 1. Confirm new columns on reports:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'reports'
--    AND column_name IN ('usage_type', 'credit_row_id', 'free_system');
--
-- 2. Confirm credits_low in ENUM:
--    SELECT unnest(enum_range(NULL::notification_type));
--    -- Should include: credits_low
--
-- 3. Confirm triggers exist:
--    SELECT trigger_name, event_manipulation, event_object_table
--    FROM information_schema.triggers
--    WHERE trigger_name IN (
--      'trg_refund_on_report_failure',
--      'trg_notify_report_status_change',
--      'trg_notify_credits_low'
--    );
--
-- ============================================================================
