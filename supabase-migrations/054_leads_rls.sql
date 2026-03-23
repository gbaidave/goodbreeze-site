-- ============================================================================
-- Migration: 054_leads_rls.sql
-- Enable RLS on the leads table (newsletter signups)
-- ============================================================================

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated users to insert (newsletter signup is public)
CREATE POLICY "leads_insert_public"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies for anon or authenticated.
-- Admins read leads via the service role client which bypasses RLS.
