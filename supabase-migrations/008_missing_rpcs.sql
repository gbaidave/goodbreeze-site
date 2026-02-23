-- ============================================================================
-- Good Breeze AI - Migration 008: Missing Entitlement RPCs
-- Created: 2026-02-24
-- Run AFTER: 007_credit_refund_and_notifications.sql
-- ============================================================================
-- Adds two RPCs that were referenced in application code but never implemented:
--
--   force_delete_auth_user_by_email(p_email TEXT) → BOOLEAN
--     Called by the frictionless route when Supabase soft-deletes leave a ghost
--     row in auth.users (dashboard delete sets deleted_at but keeps the row).
--     Hard-deletes the row so the email can be re-registered.
--
--   check_and_reserve_free_slot(p_user_id UUID, p_free_system TEXT, p_report_type TEXT) → TEXT
--     Called by entitlement.ts for free-plan users before generating a report.
--     Atomically checks if the user's free slot for a system is available and
--     reserves it in the same transaction (prevents race conditions).
--     Returns 'already_used' if taken, NULL if the slot was just reserved.
-- ============================================================================


-- ============================================================================
-- force_delete_auth_user_by_email
-- ============================================================================
-- Permanently removes a user from auth.users regardless of soft-delete state.
-- SECURITY DEFINER runs as postgres (needed to access auth schema).
-- Returns TRUE if a row was found and deleted, FALSE if no row existed.
--
-- Called by: app/api/frictionless/route.ts (on 422 from createUser)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.force_delete_auth_user_by_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the user — matches even when deleted_at is set (soft-deleted row)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Hard-delete from auth (cascades to auth.identities, auth.sessions, etc.)
  DELETE FROM auth.users WHERE id = v_user_id;

  -- Belt-and-suspenders: remove orphaned profile row if cascade didn't fire
  DELETE FROM public.profiles WHERE id = v_user_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_delete_auth_user_by_email(TEXT) TO service_role;

COMMENT ON FUNCTION public.force_delete_auth_user_by_email IS
  'Hard-deletes a user from auth.users (including soft-deleted rows with deleted_at set).
   Used by the frictionless route to purge ghost accounts so the email can be re-registered.
   Returns TRUE if deleted, FALSE if no row found.';


-- ============================================================================
-- check_and_reserve_free_slot
-- ============================================================================
-- Atomically checks if a user has used their free report slot for a given
-- system, and reserves it if available. Uses FOR UPDATE to prevent races.
-- Returns 'already_used' if the slot was taken, NULL if now reserved.
--
-- Called by: lib/entitlement.ts (free plan check, before triggering n8n)
-- p_free_system: 'analyzer' or 'brand_visibility'
-- p_report_type: the report type string to store (e.g. 'h2h', 'seo_audit')
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_and_reserve_free_slot(
  p_user_id     UUID,
  p_free_system TEXT,
  p_report_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current JSONB;
BEGIN
  -- Lock the profile row for this user to prevent concurrent free-slot grabs
  SELECT free_reports_used INTO v_current
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- If the key already exists in the JSONB, the free slot has been used
  IF v_current ? p_free_system THEN
    RETURN 'already_used';
  END IF;

  -- Atomically reserve the slot by writing the system key + report type
  UPDATE public.profiles
  SET free_reports_used = COALESCE(free_reports_used, '{}'::jsonb)
                       || jsonb_build_object(p_free_system, p_report_type)
  WHERE id = p_user_id;

  -- NULL return = success: slot was available and is now reserved
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_reserve_free_slot(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_reserve_free_slot(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.check_and_reserve_free_slot IS
  'Atomically checks and reserves a per-system free report slot for a user.
   Prevents race conditions via FOR UPDATE row lock.
   p_free_system: "analyzer" or "brand_visibility"
   p_report_type: the report type string to store (e.g. "h2h", "seo_audit")
   Returns "already_used" if slot is taken, NULL if slot was just reserved.';


-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm success)
-- ============================================================================
--
-- 1. Confirm both functions exist:
--    SELECT routine_name, routine_type
--    FROM information_schema.routines
--    WHERE routine_schema = 'public'
--    AND routine_name IN ('force_delete_auth_user_by_email', 'check_and_reserve_free_slot');
--
-- 2. Test check_and_reserve_free_slot with a real user_id from profiles:
--    -- First call should reserve and return NULL
--    -- SELECT check_and_reserve_free_slot('your-user-uuid', 'test_system', 'h2h');
--    -- Second call should return 'already_used'
--    -- SELECT check_and_reserve_free_slot('your-user-uuid', 'test_system', 'h2h');
--    -- Then clean up:
--    -- UPDATE profiles SET free_reports_used = free_reports_used - 'test_system' WHERE id = 'your-user-uuid';
--
-- 3. Test force_delete_auth_user_by_email (only on a real test account you want gone):
--    -- SELECT force_delete_auth_user_by_email('test@example.com');
--    -- Should return TRUE if deleted, FALSE if not found.
--
-- ============================================================================
