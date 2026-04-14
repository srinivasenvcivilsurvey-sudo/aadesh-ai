-- Aadesh AI — Add missing profiles columns (C4 fix)
-- These columns were added ad-hoc via ALTER TABLE but never recorded in a migration.
-- Running this is safe (IF NOT EXISTS) against any state.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS officer_name        TEXT,
  ADD COLUMN IF NOT EXISTS salutation          TEXT DEFAULT 'ಶ್ರೀ/ಶ್ರೀಮತಿ',
  ADD COLUMN IF NOT EXISTS training_status     TEXT DEFAULT 'untrained',
  ADD COLUMN IF NOT EXISTS personal_prompt     TEXT,
  ADD COLUMN IF NOT EXISTS case_type_id        TEXT;

-- Ensure updated_at trigger fires on profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
