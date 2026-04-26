-- Aadesh AI — Entity Lock hardening state machine
-- Date: 2026-04-26
-- Purpose: make generation impossible unless upload, Entity Lock, reasoning,
-- and manifest seed are server-recorded on the order row.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_state') THEN
    CREATE TYPE public.order_state AS ENUM (
      'draft',
      'uploaded',
      'entity_locked',
      'reasoned',
      'manifest_seeded',
      'generating',
      'generation_failed',
      'generated',
      'signed',
      'verified'
    );
  END IF;
END $$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS state public.order_state NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS state_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upload_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS locked_name TEXT,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attestation_nonce TEXT,
  ADD COLUMN IF NOT EXISTS attestation_nonce_consumed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS attestation_hash TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_fields JSONB,
  ADD COLUMN IF NOT EXISTS conflict_reasons JSONB,
  ADD COLUMN IF NOT EXISTS reasoning_hash TEXT,
  ADD COLUMN IF NOT EXISTS key_issue TEXT,
  ADD COLUMN IF NOT EXISTS documents_relied JSONB,
  ADD COLUMN IF NOT EXISTS reasoning_text TEXT,
  ADD COLUMN IF NOT EXISTS manifest_seed_hash TEXT,
  ADD COLUMN IF NOT EXISTS seeded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS gen_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gen_finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS output_hash TEXT,
  ADD COLUMN IF NOT EXISTS final_manifest_hash TEXT,
  ADD COLUMN IF NOT EXISTS generation_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS generation_failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS manifest_signature TEXT,
  ADD COLUMN IF NOT EXISTS signing_key_id TEXT;

ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS receipt_id UUID,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS event_payload JSONB,
  ADD COLUMN IF NOT EXISTS event_hash TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS stack TEXT,
  ADD COLUMN IF NOT EXISTS route TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idem
  ON public.orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_nonce
  ON public.orders(id, attestation_nonce)
  WHERE attestation_nonce IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_state_user
  ON public.orders(user_id, state, created_at DESC);

CREATE OR REPLACE FUNCTION public.orders_state_guard()
RETURNS trigger AS $$
DECLARE
  valid boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.state IS DISTINCT FROM OLD.state THEN
    valid := CASE OLD.state
      WHEN 'draft' THEN NEW.state = 'uploaded'
      WHEN 'uploaded' THEN NEW.state = 'entity_locked'
      WHEN 'entity_locked' THEN NEW.state = 'reasoned'
      WHEN 'reasoned' THEN NEW.state = 'manifest_seeded'
      WHEN 'manifest_seeded' THEN NEW.state = 'generating'
      WHEN 'generating' THEN NEW.state IN ('generated', 'generation_failed')
      WHEN 'generation_failed' THEN false
      WHEN 'generated' THEN NEW.state = 'signed'
      WHEN 'signed' THEN NEW.state = 'verified'
      ELSE false
    END;

    IF NOT valid THEN
      RAISE EXCEPTION 'illegal transition % -> %', OLD.state, NEW.state;
    END IF;

    IF NEW.state_version <> OLD.state_version + 1 THEN
      RAISE EXCEPTION 'state_version must increment by 1';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_state_guard ON public.orders;
CREATE TRIGGER orders_state_guard
  BEFORE UPDATE OF state ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_state_guard();

CREATE OR REPLACE FUNCTION public.deduct_credit(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_remaining = GREATEST(credits_remaining - 1, 0),
      updated_at = NOW()
  WHERE id = user_id
    AND credits_remaining > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_credits(user_uuid UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_remaining = credits_remaining + amount,
      updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
