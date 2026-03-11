-- Migration 035: RBAC role hierarchy + ticket assignment
--
-- MUST BE RUN IN 3 SEPARATE PASTES in Supabase SQL Editor.
-- PostgreSQL cannot use a new ENUM value in the same transaction that created it.
-- Paste each block separately and click Run between each one.
--
-- ============================================================
-- PASTE 1 OF 3 — Run this alone first, then click Run
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- ============================================================
-- PASTE 2 OF 3 — Run this alone second, then click Run
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'support';

-- ============================================================
-- PASTE 3 OF 3 — Run this last after both ENUM values are committed
-- ============================================================

-- Add assignee_id column to support_requests
ALTER TABLE support_requests
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Index for filtering by assignee
CREATE INDEX IF NOT EXISTS idx_support_requests_assignee_id
  ON support_requests(assignee_id);

-- Promote Dave's account to superadmin
UPDATE profiles
SET role = 'superadmin'
WHERE email = 'dave@goodbreeze.ai';
