-- Migration 021: Add security_alert to email_type enum
-- Required for sendSecurityAlertEmail() (phone number change notification).

ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'security_alert';

-- Verification:
-- SELECT unnest(enum_range(NULL::email_type));
-- Should include: security_alert
