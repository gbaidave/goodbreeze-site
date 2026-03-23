-- Manual cleanup script — run ONCE on staging after migration 052.
-- Wipes credit pack rows and resets subscriptions for Dave's test accounts.
-- DO NOT run on production.
--
-- Run in Supabase SQL Editor. Confirm row counts before committing.

-- Preview what will be deleted:
-- SELECT id, user_id, source, balance, product, purchased_at FROM public.credits
--   WHERE source IN ('pack', 'subscription')
--   AND user_id IN (SELECT id FROM public.profiles WHERE email IN ('dave@goodbreeze.ai', 'dave.silverstein58@gmail.com'));

-- 1. Delete test credit rows (pack + subscription)
DELETE FROM public.credits
  WHERE source IN ('pack', 'subscription')
  AND user_id IN (
    SELECT id FROM public.profiles
    WHERE email IN ('dave@goodbreeze.ai', 'dave.silverstein58@gmail.com')
  );

-- 2. Reset test subscriptions to free/inactive state
UPDATE public.subscriptions
  SET
    plan = 'free',
    status = 'active',
    credits_remaining = 0,
    stripe_subscription_id = NULL,
    stripe_customer_id = NULL,
    current_period_start = NULL,
    current_period_end = NULL,
    cancel_at_period_end = false
  WHERE user_id IN (
    SELECT id FROM public.profiles
    WHERE email IN ('dave@goodbreeze.ai', 'dave.silverstein58@gmail.com')
  );

-- 3. (Optional) Clear any open refund_requests for test accounts
-- DELETE FROM public.refund_requests
--   WHERE user_id IN (
--     SELECT id FROM public.profiles
--     WHERE email IN ('dave@goodbreeze.ai', 'dave.silverstein58@gmail.com')
--   );
