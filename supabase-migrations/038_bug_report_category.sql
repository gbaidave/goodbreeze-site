-- Migration 038: Add 'bug_report' to support_requests category CHECK constraint
--
-- support_requests.category is a TEXT column with a CHECK constraint
-- (not an ENUM). To add a new allowed value we drop and recreate the constraint.
--
-- Existing allowed values (from migration 029):
--   'account_access', 'report_issue', 'billing', 'refund', 'dispute', 'help', 'feedback'
-- Adding:
--   'bug_report' — used by /api/bug-report for tester-submitted bug reports
-- ============================================================

ALTER TABLE public.support_requests
  DROP CONSTRAINT IF EXISTS support_requests_category_check;

ALTER TABLE public.support_requests
  ADD CONSTRAINT support_requests_category_check
  CHECK (category IN (
    'account_access',
    'report_issue',
    'billing',
    'refund',
    'dispute',
    'help',
    'feedback',
    'bug_report'
  ));


-- ============================================================
-- VERIFICATION QUERY (run after applying)
-- ============================================================
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.support_requests'::regclass
-- AND conname = 'support_requests_category_check';
-- -- Should show 'bug_report' in the IN list
