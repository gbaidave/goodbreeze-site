-- Migration 011: Sync auth.users email changes to profiles.email
--
-- Problem: Supabase's secure email change updates auth.users.email after
-- both old+new addresses confirm, but profiles.email is never updated.
-- Account settings shows profiles.email first, so the old email persists.
--
-- Fix: Trigger on auth.users that copies the new email to profiles whenever
-- auth.users.email changes.

CREATE OR REPLACE FUNCTION public.sync_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_email_to_profile
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_to_profile();
