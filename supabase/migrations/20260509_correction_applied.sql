-- Aadesh AI — Track self-correction pass on orders
-- Date: 2026-05-09
-- Purpose: Record whether the AI guardrail audit triggered a second-pass
-- correction during generation. Displayed in the Assistance Report and
-- used to measure guardrail effectiveness over time.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS correction_applied BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.orders.correction_applied IS
  'TRUE when the self-correction pass (auditOrder → regenerateWithCorrection) ran and improved the draft.';
