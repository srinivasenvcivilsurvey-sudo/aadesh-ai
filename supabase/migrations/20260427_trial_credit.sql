-- Aadesh AI — Trial Credit Schema (Pricing v2)
-- Date: 2026-04-27
-- Source of truth: AADESH_AI_PRICING_DECISION_v2.md
--
-- Trial is INTERNAL ONLY — never a Razorpay object. One free credit per
-- verified account, granted by /api/trial/grant after auth verification.
--
-- Email/phone uniqueness is already enforced by Supabase auth.users —
-- duplicating those columns on profiles is redundant. The trial endpoint
-- reads email_confirmed_at and phone_confirmed_at directly from auth.users
-- before granting.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_credit_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_credit_used BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast lookup of whether a user has used their trial — used by
-- the generation route to apply Sonnet-only + 30p/5MB caps for trial users.
CREATE INDEX IF NOT EXISTS idx_profiles_trial_credit
  ON public.profiles (trial_credit_granted_at)
  WHERE trial_credit_granted_at IS NOT NULL;

COMMENT ON COLUMN public.profiles.trial_credit_granted_at IS
  'When the 1-credit free trial was granted. NULL = never claimed. Set by /api/trial/grant.';

COMMENT ON COLUMN public.profiles.trial_credit_used IS
  'TRUE once the trial credit has been spent on a generation. Marked by generate route.';
