-- ============================================================================
-- Good Breeze AI - Fix Report Refund Trigger + Notification Messages
-- Migration: 019_fix_refund_trigger_and_notifications.sql
-- Created: 2026-02-26
--
-- Problems:
--   1. refund_on_report_failure() handles credits users correctly, but for
--      subscription users it still updates the OLD usage table (deprecated).
--      Migration 018 introduced credits_remaining on subscriptions.
--      Subscription users who have a report fail are NOT getting their
--      credits_remaining refunded. This migration fixes that.
--
--   2. notify_on_report_status_change() failure messages don't mention that
--      the credit was refunded. Users see "couldn't be completed" but don't
--      know if they lost the credit or got it back. This migration updates
--      the messages to explicitly confirm the refund.
--
-- Safe to re-run: CREATE OR REPLACE FUNCTION is idempotent.
-- ============================================================================


-- ============================================================================
-- 1. Fix refund_on_report_failure() — subscription credits_remaining refund
--
-- Replaces migration 007 version.
-- Added: INCREMENT credits_remaining for subscription users (migration 007
-- incorrectly tried to update the old usage table for these users).
-- Removed: usage table updates (that system is deprecated as of migration 018).
-- ============================================================================

CREATE OR REPLACE FUNCTION refund_on_report_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process when status actually changes TO a failure state
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('failed', 'failed_site_blocked') THEN RETURN NEW; END IF;

  -- ── Credit pack refund ─────────────────────────────────────────────────────
  -- Increment the credit row balance back by 1
  IF NEW.usage_type = 'credits' AND NEW.credit_row_id IS NOT NULL THEN
    UPDATE credits
    SET balance = balance + 1
    WHERE id = NEW.credit_row_id;
  END IF;

  -- ── Subscription credits_remaining refund ─────────────────────────────────
  -- Increment credits_remaining by 1 on the user's active/trialing subscription.
  -- This reverses the decrement done by decrement_subscription_credits() at
  -- report submission time. No cap enforced — the plan cap is checked at
  -- submission time only.
  IF NEW.usage_type = 'subscription' THEN
    UPDATE subscriptions
    SET credits_remaining = credits_remaining + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND status IN ('active', 'trialing');
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION refund_on_report_failure IS
  'Reverses credit deduction when a report transitions to failed/failed_site_blocked.
   credits usage_type: increments credits row balance.
   subscription usage_type: increments credits_remaining on subscription row.
   Replaces migration 007 version (which had stale usage table logic).';


-- ============================================================================
-- 2. Update notify_on_report_status_change() — add credit refund confirmation
--
-- Replaces migration 012 version.
-- Updated: failure messages now mention whether the credit was refunded,
-- based on usage_type. This tells users they can try again without losing a
-- credit, which reduces support tickets and frustration.
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
  v_refund  TEXT;
BEGIN
  -- Only fire when status actually changes
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;

  -- Build human-readable report type label
  v_label := replace(replace(NEW.report_type::text, '_', ' '), 'seo', 'SEO');

  -- Build refund suffix based on usage type
  IF NEW.usage_type = 'credits' THEN
    v_refund := ' Your credit has been refunded.';
  ELSIF NEW.usage_type = 'subscription' THEN
    v_refund := ' Your plan credit has been refunded.';
  ELSE
    v_refund := '';
  END IF;

  IF NEW.status = 'complete' THEN
    v_type    := 'report_ready';
    v_message := 'Your ' || initcap(v_label) || ' report is ready to download.';

  ELSIF NEW.status = 'failed_site_blocked' THEN
    v_type    := 'report_failed';
    v_message := 'Your ' || initcap(v_label) ||
                 ' report could not be completed — the website blocked our analysis.' ||
                 v_refund;

  ELSIF NEW.status = 'failed' THEN
    v_type    := 'report_failed';
    v_message := 'Your ' || initcap(v_label) ||
                 ' report could not be completed.' || v_refund ||
                 ' Please try again or contact support.';

  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, message)
  VALUES (NEW.user_id, v_type, v_message);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION notify_on_report_status_change IS
  'Inserts a bell notification when a report reaches a final state.
   complete: report ready message.
   failed/failed_site_blocked: failure message with credit refund confirmation
   (credits or subscription plan credit, based on usage_type).
   Replaces migration 012 version.';


-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
--
-- 1. Confirm refund function updated (check body for credits_remaining):
--    SELECT prosrc FROM pg_proc WHERE proname = 'refund_on_report_failure';
--    -- Should contain 'credits_remaining + 1'
--
-- 2. Confirm notification function updated (check body for v_refund):
--    SELECT prosrc FROM pg_proc WHERE proname = 'notify_on_report_status_change';
--    -- Should contain 'v_refund'
--
-- 3. Test: manually set a test report to 'failed' and check:
--    a. credits row balance increased by 1 (for credits users)
--    b. subscriptions.credits_remaining increased by 1 (for subscription users)
--    c. notifications row inserted with refund message
-- ============================================================================
