-- Migration 044: Add 'refund_processed' to notification_type ENUM
--
-- Root cause fix: admin refund route and charge.refunded webhook were both
-- inserting notifications with type='info', which does not exist in the
-- notification_type ENUM. Every notification INSERT was failing silently,
-- meaning users never received a bell notification after a refund.
--
-- MUST BE RUN AS A SEPARATE PASTE before any code that uses 'refund_processed'.
-- PostgreSQL cannot use a new ENUM value in the same transaction that creates it.

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'refund_processed';
