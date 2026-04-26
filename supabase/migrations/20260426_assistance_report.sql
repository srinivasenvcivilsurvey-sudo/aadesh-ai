-- Aadesh AI — Assistance Report metadata
-- Date: 2026-04-26

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS assistance_report_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assistance_report_hash TEXT,
  ADD COLUMN IF NOT EXISTS assistance_report_path TEXT;
