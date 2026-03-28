-- ═══════════════════════════════════════════════════════════
-- AADESH AI — Complete Supabase Schema
-- Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor)
-- Date: 2026-03-28
-- ═══════════════════════════════════════════════════════════

-- ─── 1. PROFILES TABLE ─────────────────────────────────────
-- Extends Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credits_remaining INTEGER DEFAULT 3,
  total_orders_generated INTEGER DEFAULT 0,
  preferred_language TEXT DEFAULT 'kn',
  training_level TEXT DEFAULT 'untrained',
  training_score INTEGER DEFAULT 0,
  total_references INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_remaining)
  VALUES (NEW.id, NEW.email, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. ORDERS TABLE ───────────────────────────────────────
-- Every generated order is saved here
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_type TEXT NOT NULL,
  input_text TEXT NOT NULL,
  generated_order TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  model_used TEXT DEFAULT 'sarvam-m',
  verified BOOLEAN DEFAULT FALSE,
  version_number INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ─── 3. REFERENCES TABLE ───────────────────────────────────
-- Uploaded training orders with extracted metadata
CREATE TABLE IF NOT EXISTS public.references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  extracted_text TEXT,
  detected_type TEXT,
  word_count INTEGER,
  section_count INTEGER,
  processing_status TEXT DEFAULT 'pending',
  extraction_method TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  version_number INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.references(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own references" ON public.references
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own references" ON public.references
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own references" ON public.references
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_references_user_id ON public.references(user_id);

-- ─── 4. TRANSACTIONS TABLE ─────────────────────────────────
-- Razorpay payment records
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  pack_name TEXT,
  amount_inr NUMERIC,
  credits_added INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ─── 5. AUDIT LOG TABLE (DPDP Compliance) ──────────────────
-- Every download/verification action is logged
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit" ON public.audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_log(created_at DESC);

-- ─── 6. RPC: Add Credits (atomic) ──────────────────────────
-- Used by Razorpay webhook to safely add credits
CREATE OR REPLACE FUNCTION public.add_credits(user_uuid UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_remaining = credits_remaining + amount,
      updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- DONE! All tables created. App is ready.
-- ═══════════════════════════════════════════════════════════
