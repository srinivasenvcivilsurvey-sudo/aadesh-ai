-- Aadesh AI — Production Database Schema
-- Run this in Supabase Dashboard > SQL Editor > New Query > Paste > Run
-- Date: March 28, 2026

-- ══════════════════════════════════════════════════════════
-- 1. PROFILES (extends Supabase Auth)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  office_name TEXT,
  district TEXT,
  designation TEXT,
  phone TEXT,
  credits_remaining INTEGER DEFAULT 3,
  total_orders_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════
-- 2. ORDERS (generated legal orders)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_type TEXT NOT NULL,
  case_number TEXT,
  input_text TEXT,
  generated_order TEXT,
  score INTEGER,
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
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════
-- 3. TRANSACTIONS (payments / credit purchases)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  pack_name TEXT NOT NULL,
  amount_inr INTEGER NOT NULL,
  credits_added INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════
-- 4. REFERENCES (uploaded reference orders for style mimicry)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  version_number INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.references(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own references" ON public.references
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own references" ON public.references
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own references" ON public.references
  FOR UPDATE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════
-- 5. ADD CREDITS RPC (called by Razorpay webhook)
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_remaining = credits_remaining + p_credits,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done! Verify: check Table Editor for profiles, orders, transactions, references
