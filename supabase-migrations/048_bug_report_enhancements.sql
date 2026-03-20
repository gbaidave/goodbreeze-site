-- Migration 048: Bug report enhancements
--
-- Adds subject, importance, priority, bug_number (sequential), and bug_category
-- columns to support_requests for structured bug reporting by testers/admins.
--
-- bug_number: auto-assigned sequential integer for rows with category='bug_report'
-- importance: user-reported severity (low / medium / high)
-- priority:   admin-set priority (low / medium / high / critical)
-- bug_category: type of bug (app-layer enforcement, not CHECK constraint)
-- subject: short summary line (replaces title embedded in message body)
--
-- Run on staging Supabase first. Verify columns exist. Then run on production.
-- ============================================================

-- Sequential counter for bug numbers
CREATE SEQUENCE IF NOT EXISTS bug_report_number_seq;

-- Add columns
ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS subject      TEXT,
  ADD COLUMN IF NOT EXISTS importance   TEXT CHECK (importance IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS priority     TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS bug_number   INTEGER,
  ADD COLUMN IF NOT EXISTS bug_category TEXT;

-- Trigger function: assign bug_number only for bug_report rows
CREATE OR REPLACE FUNCTION assign_bug_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category = 'bug_report' AND NEW.bug_number IS NULL THEN
    NEW.bug_number := nextval('bug_report_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it already exists (idempotent re-run)
DROP TRIGGER IF EXISTS trg_assign_bug_number ON public.support_requests;

CREATE TRIGGER trg_assign_bug_number
  BEFORE INSERT ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION assign_bug_number();


-- ============================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================
--
-- Check columns added:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'support_requests'
-- AND column_name IN ('subject','importance','priority','bug_number','bug_category');
--
-- Check trigger:
-- SELECT trigger_name FROM information_schema.triggers
-- WHERE event_object_table = 'support_requests'
-- AND trigger_name = 'trg_assign_bug_number';
