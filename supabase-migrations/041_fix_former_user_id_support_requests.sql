-- Migration 041: Add former_user_id to support_requests
-- Migration 040 incorrectly targeted 'support_tickets' (which does not exist).
-- The actual table is 'support_requests'. This migration corrects that.

ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS former_user_id UUID;
