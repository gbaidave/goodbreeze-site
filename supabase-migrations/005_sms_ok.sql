-- Phase 14: Add SMS opt-in field to profiles
-- Run in Supabase SQL Editor.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS sms_ok BOOLEAN NOT NULL DEFAULT false;
