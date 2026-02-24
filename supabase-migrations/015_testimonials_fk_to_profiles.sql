-- ============================================================================
-- Migration 015: Fix testimonials.user_id FK — point to profiles, not auth.users
-- Created: 2026-02-24
-- Problem: testimonials.user_id references auth.users(id) directly.
--          Every other table in the schema (admin_notes, notifications,
--          referral_codes, etc.) references public.profiles(id).
--          PostgREST builds its relationship graph from the public schema only.
--          Because testimonials → auth.users (not public.profiles), PostgREST
--          cannot follow the testimonials → profiles join in the admin panel query:
--            .select('... profiles ( name, email )')
--          This causes a silent query error, data returns null, and the admin
--          testimonials panel shows zero rows even when testimonials exist.
-- Fix: Drop the auth.users FK and replace with a profiles(id) FK.
--      profiles.id IS auth.users.id (same UUID — trigger creates both on signup),
--      so data integrity is unchanged. ON DELETE CASCADE is preserved.
-- ============================================================================

-- Drop the old FK pointing to auth.users
ALTER TABLE testimonials
  DROP CONSTRAINT IF EXISTS testimonials_user_id_fkey;

-- Add new FK pointing to public.profiles(id)
-- profiles.id = auth.users.id, so all existing rows remain valid
ALTER TABLE testimonials
  ADD CONSTRAINT testimonials_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
--
-- Confirm the FK now points to profiles, not auth.users:
--   SELECT
--     tc.constraint_name,
--     kcu.column_name,
--     ccu.table_schema AS foreign_schema,
--     ccu.table_name   AS foreign_table,
--     ccu.column_name  AS foreign_column
--   FROM information_schema.table_constraints AS tc
--   JOIN information_schema.key_column_usage AS kcu
--     ON tc.constraint_name = kcu.constraint_name
--   JOIN information_schema.constraint_column_usage AS ccu
--     ON ccu.constraint_name = tc.constraint_name
--   WHERE tc.table_name = 'testimonials'
--     AND tc.constraint_type = 'FOREIGN KEY';
--   -- Expected: foreign_schema = 'public', foreign_table = 'profiles'
--
-- Then reload /admin/testimonials — all submitted testimonials should appear.
-- ============================================================================
