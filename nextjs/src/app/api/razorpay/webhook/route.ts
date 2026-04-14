import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Pack definitions — must match route.ts
const PACKS: Record<string, { name: string; orders: number; priceInr: number }> = {
  pack_a: { name: 'Pack A', orders: 7,  priceInr: 999  },
  pack_b: { name: 'Pack B', orders: 18, priceInr: 1999 },
  pack_c: { name: 'Pack C', orders: 32, priceInr: 3499 },
  pack_d: { name: 'Pack D', orders: 55, priceInr: 5999 },
};

// Razorpay webhook payload types
interface RazorpayPaymentEntity {
  id: string;
  email: string;
  amount: number;
  status: string;
  order_id?: string;
}

interface RazorpayPaymentLinkEntity {
  id: string;
  status: string;
  amount: number;
  notes?: Record<string, string>;
}

interface RazorpayWebhookPayload {
  entity: string;
  event: string;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    payment_link?: { entity: RazorpayPaymentLinkEntity };
    order?: { entity: { id: string; notes?: Record<string, string> } };
  };
}

// POST /api/razorpay/webhook
// Called by Razorpay server — no user auth, uses webhook signature instead
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. READ RAW BODY (required for HMAC verification) ──────────────────
  const rawBody = await request.text();

  // ── 2. VERIFY RAZORPAY SIGNATURE ───────────────────────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const receivedSignature = request.headers.get('x-razorpay-signature');
  if (!receivedSignature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  // FIX (MEDIUM): timing-safe comparison — prevent timing attacks on signature
  const signaturesMatch = (() => {
    const a = Buffer.from(expectedSignature);
    const b = Buffer.from(receivedSignature);
    if (a.length !== b.length) {
      crypto.timingSafeEqual(a, a); // dummy op to normalize timing
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  })();

  if (!signaturesMatch) {
    console.warn('Razorpay webhook signature mismatch — possible spoofing attempt');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── 3. PARSE EVENT ──────────────────────────────────────────────────────
  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only process payment_link.paid events
  if (event.event !== 'payment_link.paid') {
    // Return 200 — acknowledge all events even if we don't handle them
    return NextResponse.json({ received: true });
  }

  // ── 4. EXTRACT PAYMENT DATA ─────────────────────────────────────────────
  const payment = event.payload.payment?.entity;
  const paymentLink = event.payload.payment_link?.entity;

  if (!payment || !paymentLink) {
    console.error('Webhook missing payment or payment_link entity', event);
    return NextResponse.json({ error: 'Missing payment data' }, { status: 400 });
  }

  const paymentId = payment.id;
  const userEmail = payment.email;
  const packId = paymentLink.notes?.pack_id;
  const amountPaise = payment.amount;

  if (!paymentId || !userEmail || !packId) {
    console.error('Webhook missing required fields', { paymentId, userEmail, packId });
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!(packId in PACKS)) {
    console.error('Unknown pack_id in webhook notes:', packId);
    return NextResponse.json({ error: 'Unknown pack' }, { status: 400 });
  }

  const pack = PACKS[packId];

  // ── 5. INIT ADMIN CLIENT ────────────────────────────────────────────────
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── 6. IDEMPOTENCY CHECK ────────────────────────────────────────────────
  // If this payment_id already recorded, skip (Razorpay retries webhooks)
  const { data: existing } = await adminClient
    .from('transactions')
    .select('id')
    .eq('razorpay_payment_id', paymentId)
    .maybeSingle();

  if (existing) {
    console.log(`Webhook: payment ${paymentId} already processed — skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // ── 7. LOOK UP USER BY EMAIL ────────────────────────────────────────────
  // FIX B7: paginate listUsers properly — perPage: 1000 breaks at 1001 users.
  // Supabase admin API has no getUserByEmail; loop through pages until found.
  // TODO: add email column to profiles table for O(1) lookup when user count grows.
  let matchedUser: { id: string; email?: string } | null = null;
  let userError: { message: string } | null = null;
  {
    let page = 1;
    outer: while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 100 });
      if (error) { userError = error; break; }
      if (!data?.users?.length) break;
      for (const u of data.users) {
        if (u.email?.toLowerCase() === userEmail.toLowerCase()) {
          matchedUser = u;
          break outer;
        }
      }
      if (data.users.length < 100) break; // last page
      page++;
    }
  }

  if (userError || !matchedUser) {
    console.error(`Webhook: no user found for email ${userEmail}, payment ${paymentId}`);
    // Record as pending — can be manually resolved
    await adminClient.from('transactions').insert({
      user_id: null,
      razorpay_payment_id: paymentId,
      razorpay_order_id: payment.order_id ?? null,
      pack_name: pack.name,
      amount_inr: amountPaise / 100,
      credits_added: 0,
      status: 'pending_user_not_found',
      notes: `email: ${userEmail}`,
    });
    return NextResponse.json({ received: true, warning: 'User not found' });
  }

  const userId = matchedUser.id;

  // ── 8. AMOUNT VERIFICATION (mitigates email abuse) ──────────────────────
  // Verify amount paid matches the declared pack amount — attacker can't under-pay
  // to get more credits than they paid for.
  // FIX B8: derive from pack.priceInr — hardcoded values diverge when pricing changes
  const expectedPaise = pack.priceInr * 100;
  if (amountPaise !== expectedPaise) {
    console.warn(`Webhook amount mismatch: expected ${expectedPaise}, got ${amountPaise} for pack ${packId}`);
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  // ── 9. FIX (CRITICAL): INSERT first to claim slot atomically ────────────
  // The UNIQUE constraint on razorpay_payment_id ensures only one request wins.
  const { data: insertedRows } = await adminClient
    .from('transactions')
    .insert({
      user_id: userId,
      razorpay_payment_id: paymentId,
      razorpay_order_id: payment.order_id ?? null,
      pack_name: pack.name,
      amount_inr: amountPaise / 100,
      credits_added: pack.orders,
      status: 'pending_credit',
      notes: 'webhook: payment_link.paid',
    })
    .select('id')
    .limit(1);

  if (!insertedRows || insertedRows.length === 0) {
    // Duplicate — already processed
    console.log(`Webhook: payment ${paymentId} already processed (duplicate) — skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  const transactionId = insertedRows[0].id;

  // ── 10. ADD CREDITS ─────────────────────────────────────────────────────
  const { error: rpcError } = await adminClient.rpc('add_credits', {
    user_uuid: userId,
    amount: pack.orders,
  });

  if (rpcError) {
    console.error('Credit addition failed:', rpcError);
    await adminClient.from('transactions')
      .update({ status: 'credit_failed' })
      .eq('id', transactionId);
    return NextResponse.json({ error: 'Credit addition failed' }, { status: 500 });
  }

  await adminClient.from('transactions')
    .update({ status: 'completed' })
    .eq('id', transactionId);

  console.log(`Webhook: ${pack.orders} credits added to user ${userId} (payment ${paymentId})`);
  return NextResponse.json({ received: true, creditsAdded: pack.orders });
}
