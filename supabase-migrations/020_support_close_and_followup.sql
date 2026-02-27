-- ============================================================================
-- Good Breeze AI - Support Close/Reopen + Follow-up Notifications
-- Migration: 020_support_close_and_followup.sql
-- Created: 2026-02-26
-- ============================================================================
--
-- HOW TO RUN IN SUPABASE SQL EDITOR:
--   Run PART 1 first (enum additions). Wait for success.
--   Then run PART 2 (column additions).
--   Two-step is required because PostgreSQL enum ADD VALUE must commit
--   before new DDL runs in the same Supabase session.
--
-- PART 1 adds:
--   notification_type: support_closed (user gets), support_followup (admin gets)
--   email_type: support_closed, support_followup
--
-- PART 2 adds:
--   support_requests.close_reason TEXT  — reason provided when closing
--   support_requests.closed_by   TEXT   — 'user' or 'admin'
--
-- ============================================================================


-- ============================================================================
-- PART 1 — Enum additions (run this block first, by itself)
-- ============================================================================

-- User gets notified when admin closes their ticket (with reason)
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_closed';

-- Admin gets notified when user does any activity on a ticket:
-- follow-up reply, closes their own ticket, or reopens a closed ticket
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_followup';

ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_closed';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_followup';


-- ============================================================================
-- PART 2 — Column additions (run this block after Part 1 succeeds)
-- ============================================================================

ALTER TABLE support_requests
  ADD COLUMN IF NOT EXISTS close_reason TEXT,
  ADD COLUMN IF NOT EXISTS closed_by    TEXT CHECK (closed_by IN ('user', 'admin'));
