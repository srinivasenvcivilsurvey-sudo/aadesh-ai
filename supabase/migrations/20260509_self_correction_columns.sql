-- Aadesh AI — Phase 1 self-correction + smart routing telemetry
-- Adds columns written by /api/generate-order after the Stage 8 reviewer pass.
-- Date: 2026-05-09

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS correction_applied BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS correction_score   INTEGER,
  ADD COLUMN IF NOT EXISTS complexity         TEXT;

COMMENT ON COLUMN public.orders.correction_applied IS
  'TRUE when the Sonnet reviewer (Stage 8) rewrote the draft. FALSE = original kept.';
COMMENT ON COLUMN public.orders.correction_score IS
  'Reviewer 0..100 confidence in the original draft. NULL = reviewer skipped.';
COMMENT ON COLUMN public.orders.complexity IS
  'simple|complex — output of detectComplexity() at routing time. Drives Sarvam vs Sonnet pick.';
