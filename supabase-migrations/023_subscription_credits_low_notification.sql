-- ============================================================================
-- Migration 023: Subscription credits_low notification (N6 fix)
-- ============================================================================
--
-- Problem: The existing notify_credits_low() trigger only watches the credits
-- table. Subscription users have their credit balance tracked in
-- subscriptions.credits_remaining, NOT in credits. So when a subscription
-- user runs a report and drops to 1 credit remaining, the trigger never fires.
--
-- Fix: Add a trigger on the subscriptions table that fires when
-- credits_remaining drops to 1 (i.e., NEW.credits_remaining = 1 AND
-- OLD.credits_remaining > 1).
--
-- Note: credits_low notification_type was added in migration 007.
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_subscription_credits_low()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when credits_remaining just dropped TO 1 (not from higher to higher,
  -- and not when it's already been at 1 and gets refunded back up).
  IF NEW.credits_remaining = 1 AND OLD.credits_remaining > 1 THEN
    INSERT INTO notifications (user_id, type, message)
    VALUES (
      NEW.user_id,
      'credits_low',
      'You have 1 credit remaining. Top up to keep running reports.'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_subscription_credits_low ON subscriptions;
CREATE TRIGGER trg_notify_subscription_credits_low
  AFTER UPDATE OF credits_remaining ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscription_credits_low();


-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm success)
-- ============================================================================
--
-- 1. Confirm trigger exists:
--    SELECT trigger_name, event_object_table, action_timing, event_manipulation
--    FROM information_schema.triggers
--    WHERE trigger_name = 'trg_notify_subscription_credits_low';
--
-- 2. Test manually (substitute a real subscription row user_id):
--    UPDATE subscriptions SET credits_remaining = 1 WHERE id = '<sub_id>' AND credits_remaining > 1;
--    SELECT * FROM notifications WHERE type = 'credits_low' ORDER BY created_at DESC LIMIT 3;
