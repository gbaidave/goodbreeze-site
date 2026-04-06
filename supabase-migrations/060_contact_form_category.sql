-- ============================================================================
-- Migration 060: Add contact_form category to support_requests
--
-- Adds 'contact_form' as a valid category for support_requests table.
-- Used by the /api/contact endpoint for public contact form submissions.
--
-- HOW TO RUN:
--   Paste into Supabase SQL Editor and click Run.
--   Run on BOTH staging and production.
-- ============================================================================

-- Add notification types for contact form
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'contact_received';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_contact_request';

-- Drop and recreate the CHECK constraint to include contact_form
ALTER TABLE public.support_requests
  DROP CONSTRAINT IF EXISTS support_requests_category_check;

ALTER TABLE public.support_requests
  ADD CONSTRAINT support_requests_category_check
  CHECK (category IN ('account_access', 'report_issue', 'billing', 'refund', 'dispute', 'help', 'feedback', 'bug_report', 'contact_form'));
