-- Migration 042: Drop NOT NULL constraint on refund_requests.user_id
--
-- Migration 040 added ON DELETE SET NULL to refund_requests.user_id_fkey,
-- but did not drop the NOT NULL constraint on the column itself.
-- When a profile is cascade-deleted, Postgres tries to SET user_id = NULL
-- on any linked refund_requests rows — the NOT NULL constraint blocked this,
-- causing "null value in column user_id violates not-null constraint" and
-- preventing all account deletions (admin and self-service).

ALTER TABLE public.refund_requests ALTER COLUMN user_id DROP NOT NULL;
