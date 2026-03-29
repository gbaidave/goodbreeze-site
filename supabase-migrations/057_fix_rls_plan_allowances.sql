-- Migration 057: Fix overly permissive RLS policies on plan_report_allowances and report_type_usage
--
-- Problem: Migration 056 created "Service role full access" FOR ALL policies with
-- USING (true) / WITH CHECK (true), which grants full read/write to ALL roles,
-- not just service_role. service_role bypasses RLS entirely and needs no policy.
--
-- Fix: Drop the overly permissive FOR ALL policies. Keep only scoped policies:
-- - plan_report_allowances: read-only for authenticated (entitlement checks)
-- - report_type_usage: read own rows for authenticated, no direct write (RPC handles writes)

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role full access on plan_report_allowances" ON public.plan_report_allowances;
DROP POLICY IF EXISTS "Service role full access on report_type_usage" ON public.report_type_usage;

-- plan_report_allowances: authenticated users can SELECT (needed for entitlement checks)
-- No INSERT/UPDATE/DELETE policy for authenticated — admin changes via service_role (bypasses RLS)
CREATE POLICY "Authenticated can read plan_report_allowances"
  ON public.plan_report_allowances
  FOR SELECT
  TO authenticated
  USING (true);

-- report_type_usage: keep the existing "Users can read own" SELECT policy (already correct)
-- No write policy for authenticated — writes happen via increment_report_type_usage RPC (SECURITY DEFINER)
