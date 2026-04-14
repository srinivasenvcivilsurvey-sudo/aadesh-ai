-- Migration: transactions table improvements
-- Date: 2026-04-14
-- Changes:
--   1. Add notes column for webhook/debug info
--   2. Add unique constraint on razorpay_payment_id (idempotency)
--   3. Make user_id nullable (webhook may not find user)

-- 1. Add notes column
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Unique constraint on payment_id — prevents double-crediting
-- Use DO block to avoid error if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transactions_razorpay_payment_id_key'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_razorpay_payment_id_key
      UNIQUE (razorpay_payment_id);
  END IF;
END $$;

-- 3. Make user_id nullable (for unmatched webhook payments)
ALTER TABLE public.transactions
  ALTER COLUMN user_id DROP NOT NULL;
