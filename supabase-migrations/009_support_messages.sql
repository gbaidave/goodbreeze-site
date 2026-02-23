-- ============================================================================
-- Good Breeze AI - Support Messages (Conversation Threading)
-- Migration: 009_support_messages.sql
-- Created: 2026-02-23
-- Updated: 2026-02-23 (fixed RLS policy column refs + DROP before CREATE)
-- Run AFTER: 003_phase0_additions.sql (support_requests, notifications tables)
-- ============================================================================
--
-- HOW TO RUN IN SUPABASE SQL EDITOR:
--   Run PART 1 first (enum additions). Wait for success.
--   Then run PART 2 (table + RLS). This two-step is required because
--   PostgreSQL enum ADD VALUE must commit before new DDL runs in Supabase.
--
-- ============================================================================


-- ============================================================================
-- PART 1 — Enum additions (run this block first, by itself)
-- ============================================================================

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_request';   -- admin gets: new request from user
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_reply';      -- user gets: admin replied
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_resolved';   -- user gets: request resolved

ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_reply';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_resolved';


-- ============================================================================
-- PART 2 — Table + RLS (run this block after Part 1 succeeds)
-- ============================================================================

-- Drop any partial table from a failed previous run
DROP TABLE IF EXISTS support_messages CASCADE;

CREATE TABLE support_messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id   UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
  sender_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_role  TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
  message      TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_messages_request_id ON support_messages(request_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages on their own tickets; admins can read all
-- NOTE: use unqualified column name (request_id not support_messages.request_id)
--       inside subqueries in Supabase RLS policies
CREATE POLICY "Users and admins can read support_messages"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_requests sr
      WHERE sr.id = request_id
        AND (sr.user_id = auth.uid() OR is_admin())
    )
  );

-- Users can insert messages on their own open/in_progress tickets
CREATE POLICY "Users can reply to their own tickets"
  ON support_messages FOR INSERT
  WITH CHECK (
    sender_role = 'user'
    AND EXISTS (
      SELECT 1 FROM support_requests sr
      WHERE sr.id = request_id
        AND sr.user_id = auth.uid()
        AND sr.status IN ('open', 'in_progress')
    )
  );

-- Admins can insert admin messages
CREATE POLICY "Admins can insert admin messages"
  ON support_messages FOR INSERT
  WITH CHECK (sender_role = 'admin' AND is_admin());

-- Service role full access
CREATE POLICY "Service role full access on support_messages"
  ON support_messages FOR ALL
  USING (auth.role() = 'service_role');
