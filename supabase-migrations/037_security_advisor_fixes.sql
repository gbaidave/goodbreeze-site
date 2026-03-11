-- Migration 037: Fix all Supabase Security Advisor findings
--
-- Addresses:
--   ERROR  (1): RLS disabled on public.system_errors
--   WARN  (10): function_search_path_mutable on 10 functions
--   WARN   (4): rls_policy_always_true — permissive anon INSERT policies on orphan tables
--   WARN   (1): auth_leaked_password_protection — handled in Auth dashboard (not SQL)
--   INFO  (16): rls_enabled_no_policy — all are intentionally service-role-only or orphan tables; no action needed
--
-- Safe to run as a single block. No ENUM changes. No destructive schema changes.
-- ============================================================

-- ============================================================
-- 1. FIX ERROR: Enable RLS on system_errors
--
-- system_errors is service-role only (server-side error capture).
-- No user should ever read or write it directly.
-- Adding RLS + service_role bypass policy closes the advisor ERROR.
-- ============================================================

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on system_errors"
  ON public.system_errors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 2. FIX WARNINGS: Set search_path on all 10 functions
--
-- Locks each function to the public schema, preventing
-- schema-injection via a malicious lower-priority schema.
-- Uses ALTER FUNCTION (non-destructive — preserves function body).
-- Each function name is unique so no arg-list ambiguity.
-- ============================================================

-- Trigger helper (migration 001, used by leads + other tables)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Trigger helper (used by support_requests and other tables)
-- Note: update_updated_at is a variant defined in migration 002 (pre-file era)
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- Admin/tester role helpers (used in RLS policies throughout)
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_tester() SET search_path = public;

-- Trigger functions (migration 027, 028)
ALTER FUNCTION public.set_refund_requests_updated_at() SET search_path = public;
ALTER FUNCTION public.set_admin_settings_updated_at() SET search_path = public;

-- Auth trigger (migration 011: syncs auth.users email → profiles.email)
ALTER FUNCTION public.sync_email_to_profile() SET search_path = public;

-- Credit/usage helpers (migration 002 era)
-- decrement_credit takes p_credit_id UUID (called from entitlement.ts)
ALTER FUNCTION public.decrement_credit(UUID) SET search_path = public;
-- increment_usage: arg list unknown — uses no-parens form (safe when function name is unique)
ALTER FUNCTION public.increment_usage SET search_path = public;

-- Referral code generator (migration 003)
ALTER FUNCTION public.generate_referral_code(UUID, TEXT) SET search_path = public;


-- ============================================================
-- 3. FIX WARNINGS: Remove permissive anon INSERT policies
--
-- These 4 tables (error_logs, report_requests, usage_events,
-- workflow_errors) are NOT part of the goodbreeze-site schema.
-- They are orphan tables not referenced by any app or n8n code.
-- Their anon INSERT WITH CHECK (true) policies allow anyone on
-- the internet to write arbitrary data — this is a real risk.
--
-- Fix: drop the permissive policies. Service role retains full
-- access via RLS bypass. If any legitimate writes were using
-- the anon key, they should migrate to the service role key.
-- ============================================================

DROP POLICY IF EXISTS anon_insert_error_logs ON public.error_logs;
DROP POLICY IF EXISTS anon_insert_report_requests ON public.report_requests;
DROP POLICY IF EXISTS anon_insert_usage_events ON public.usage_events;
DROP POLICY IF EXISTS anon_insert_workflow_errors ON public.workflow_errors;


-- ============================================================
-- 4. NOT SQL: Leaked password protection (auth_leaked_password_protection)
--
-- Enable in Supabase Dashboard:
--   Authentication → Providers → Email → Password →
--   Toggle ON "Leaked password protection (HaveIBeenPwned)"
-- ============================================================


-- ============================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================
--
-- 1. Confirm system_errors RLS is enabled:
--    SELECT relname, relrowsecurity FROM pg_class
--    WHERE relname = 'system_errors';
--    -- relrowsecurity should be true
--
-- 2. Confirm function search_path set:
--    SELECT proname, proconfig FROM pg_proc
--    WHERE pronamespace = 'public'::regnamespace
--    AND proname IN (
--      'update_updated_at_column','update_updated_at','is_admin','is_tester',
--      'set_refund_requests_updated_at','set_admin_settings_updated_at',
--      'sync_email_to_profile','decrement_credit','increment_usage',
--      'generate_referral_code'
--    );
--    -- proconfig should include 'search_path=public' for each
--
-- 3. Confirm anon policies removed:
--    SELECT policyname, tablename FROM pg_policies
--    WHERE tablename IN ('error_logs','report_requests','usage_events','workflow_errors')
--    AND policyname LIKE 'anon_insert_%';
--    -- Should return 0 rows
