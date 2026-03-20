-- Migration 049: Add missing email_type ENUM values + new support_status values
--
-- Root cause: email_type ENUM was created in migration 003 with only 8 values.
-- All newer types added in TypeScript were never added to the DB ENUM, causing
-- logEmail() INSERT to fail silently for every type not in the original list.
--
-- NOTE: In Supabase SQL Editor, ALTER TYPE ... ADD VALUE must be run OUTSIDE
-- of a transaction block. This file runs each statement individually. If you
-- encounter errors about transaction context, run each ALTER TYPE as a
-- separate query execution.
--
-- ============================================================
-- PART 1: Add missing email_type ENUM values
-- ============================================================

ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'pack_purchase';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'subscription_purchase';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'payment_failed';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'bug_report_notification';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'testimonial_admin_notification';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'account_deleted';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'refund_processed';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'consent_confirmation';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_reply';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_resolved';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_closed';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'support_followup';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'security_alert';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'pack_refund';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'subscription_refund';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'subscription_cancelled';

-- ============================================================
-- PART 2: Add new bug report statuses to support_status ENUM
-- ============================================================

ALTER TYPE support_status ADD VALUE IF NOT EXISTS 'info_needed';
ALTER TYPE support_status ADD VALUE IF NOT EXISTS 'dupe';
ALTER TYPE support_status ADD VALUE IF NOT EXISTS 'reopened';

-- ============================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================
--
-- Check email_type values:
-- SELECT unnest(enum_range(NULL::email_type));
--
-- Check support_status values:
-- SELECT unnest(enum_range(NULL::support_status));
