-- ============================================================================
-- Good Breeze AI - Fix: Missing notification_type ENUM values
-- Migration: 033_notification_type_enum_additions.sql
-- Created: 2026-03-09
-- Fixes:
--   T7 / T7-REJECT2/4/5: testimonial rejection bell never fired
--   ADM-DISP2: dispute submission admin bell never fired
--   T11-NOTIF-TESTIMONIAL: new testimonial submission admin bell never fired
--   T11-NOTIF-REFUND: refund ticket admin bell never fired
--
-- Root cause: 4 notification types used in application code were never added
-- to the notification_type PostgreSQL ENUM. Supabase silently rejects INSERT
-- statements with an invalid ENUM value — no error surfaces to the UI, so
-- the bell notification is just never created.
--
-- Types added:
--   testimonial_rejected  → user bell when admin rejects their testimonial
--   new_testimonial       → admin bell when a user submits a new testimonial
--   dispute_request       → admin bell when a support ticket has category=dispute
--   refund_request        → admin bell when a support ticket has category=refund
-- ============================================================================

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'testimonial_rejected';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_testimonial';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'dispute_request';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'refund_request';

-- ============================================================================
-- VERIFICATION QUERY (run after applying to confirm all values present):
--   SELECT unnest(enum_range(NULL::notification_type));
-- Expected to include:
--   email_failed, testimonial_credit, referral_credit, report_ready,
--   report_failed, plan_changed, admin_message, credits_low,
--   support_request, support_reply, support_resolved,
--   support_closed, support_followup, error_alert,
--   testimonial_rejected, new_testimonial, dispute_request, refund_request
-- ============================================================================
