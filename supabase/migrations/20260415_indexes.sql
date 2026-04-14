-- Aadesh AI — Missing indexes on hot query paths (C8 fix)
-- Without these, rate limiter + reference selection do full table scans.

-- Rate limiter: SELECT from orders WHERE user_id = ? AND created_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
  ON public.orders (user_id, created_at DESC);

-- Reference selection: SELECT from references WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 20
CREATE INDEX IF NOT EXISTS idx_references_user_uploaded_at
  ON public.references (user_id, uploaded_at DESC);

-- Reference case-type fallback: WHERE user_id = ? AND case_type_id = ?
CREATE INDEX IF NOT EXISTS idx_references_user_case_type
  ON public.references (user_id, case_type_id, uploaded_at DESC);

-- Transactions idempotency lookup: WHERE razorpay_payment_id = ?
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id
  ON public.transactions (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;
