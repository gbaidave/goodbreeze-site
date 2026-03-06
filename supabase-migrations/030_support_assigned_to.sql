-- Migration 030: Add assigned_to column to support_requests
-- Allows admin to track who is handling a ticket (free text — e.g. "Dave", "AI Agent").
--
-- HOW TO RUN:
--   Single block — safe to run as-is in Supabase SQL Editor.

ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS assigned_to TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_support_requests_assigned_to
  ON public.support_requests(assigned_to)
  WHERE assigned_to IS NOT NULL;
