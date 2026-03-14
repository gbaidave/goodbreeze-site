-- Migration 047: Drop NOT NULL on subscriptions.user_id and credits.user_id
--
-- Migration 046 changed both FKs to ON DELETE SET NULL (for GDPR financial
-- record retention) but did not drop the NOT NULL column constraint on either
-- table. This is the same pattern as the refund_requests bug fixed by 042.
--
-- When auth.users is deleted → profiles CASCADE deleted → Postgres tries to
-- SET user_id = NULL on subscriptions + credits rows → NOT NULL constraint
-- fires → whole delete rolls back → "Database error deleting user".
--
-- Every user has a subscriptions row (seeded on signup), so this blocked
-- 100% of account deletions.

ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.credits ALTER COLUMN user_id DROP NOT NULL;
