import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Recharge pack definitions (amounts in paise for Razorpay)
//
// Pricing locked 2026-04-27 per AADESH_AI_PRICING_DECISION_v2.md:
//   - Trial (1 free) is INTERNAL ONLY — handled at /api/trial/grant, not Razorpay
//   - Paid: Starter / Regular / Pro
//
// Deprecated keys (pack_a..pack_d) RETAINED for webhook back-compat so any
// in-flight Razorpay orders/payment_links created before the launch deploy
// still resolve correctly. They are NOT exposed in the UI and POST blocks
// new checkout creation against them via ACTIVE_PACK_IDS.
const PACKS = {
  // ── Active (exposed in UI, allowed for new checkouts) ───────────────
  starter: { name: 'Starter', orders: 3,  priceInr: 999,  amountPaise: 99900  },
  regular: { name: 'Regular', orders: 5,  priceInr: 1499, amountPaise: 149900 },
  pro:     { name: 'Pro',     orders: 10, priceInr: 2499, amountPaise: 249900 },

  // ── Deprecated (webhook back-compat ONLY — do NOT show in UI) ───────
  // Remove after 30 days with no in-flight old-packId webhooks.
  pack_a: { name: 'Pack A (deprecated)', orders: 7,  priceInr: 999,  amountPaise: 99900  },
  pack_b: { name: 'Pack B (deprecated)', orders: 18, priceInr: 1999, amountPaise: 199900 },
  pack_c: { name: 'Pack C (deprecated)', orders: 32, priceInr: 3499, amountPaise: 349900 },
  pack_d: { name: 'Pack D (deprecated)', orders: 55, priceInr: 5999, amountPaise: 599900 },
} as const;

type PackId = keyof typeof PACKS;

// Only these may be used for NEW checkout creation. Webhook/PUT verification
// still resolves all PACKS keys (including deprecated) for back-compat.
const ACTIVE_PACK_IDS = ['starter', 'regular', 'pro'] as const;
type ActivePackId = typeof ACTIVE_PACK_IDS[number];

function isActivePackId(value: unknown): value is ActivePackId {
  return typeof value === 'string' && (ACTIVE_PACK_IDS as readonly string[]).includes(value);
}

// FIX (MEDIUM): timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // lengths differ — do a dummy comparison to avoid timing leak on length
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Fetch Razorpay order server-side to get trusted notes (FIX HIGH: client packId not signed)
async function getRazorpayOrderNotes(
  orderId: string,
  keyId: string,
  keySecret: string,
): Promise<Record<string, string> | null> {
  try {
    const resp = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
    });
    if (!resp.ok) return null;
    const order = await resp.json() as { notes?: Record<string, string> };
    return order.notes ?? null;
  } catch {
    return null;
  }
}

// POST /api/razorpay — Create a Razorpay order
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packId } = body;

    // Block deprecated packs from new checkouts. Webhook/PUT still resolves
    // them for in-flight orders, but no fresh purchases at old prices.
    if (!isActivePackId(packId)) {
      return NextResponse.json(
        { error: 'Invalid pack. Choose: starter, regular, pro' },
        { status: 400 }
      );
    }

    const pack = PACKS[packId as PackId];
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret ||
        razorpayKeyId.includes('placeholder') || razorpayKeySecret.includes('placeholder')) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
    }

    // Create Razorpay order — embed userId + packId in notes (server-authoritative)
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: pack.amountPaise,
        currency: 'INR',
        receipt: `aadesh_${user.id.slice(0, 8)}_${packId}_${Date.now()}`,
        notes: {
          userId: user.id,      // used in PUT to skip Razorpay order fetch
          packId,               // server-authoritative — verified in PUT
          packName: pack.name,
          ordersInPack: String(pack.orders),
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      throw new Error(`Razorpay error: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json() as { id: string };

    // FIX (LOW): don't return keyId from server — use NEXT_PUBLIC_ env var in frontend instead
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: pack.amountPaise,
      currency: 'INR',
      packName: pack.name,
      ordersInPack: pack.orders,
      keyId: razorpayKeyId, // Razorpay Checkout requires this; keyId is already public
    });
  } catch (error: unknown) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT /api/razorpay — Verify payment and add credits
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }

    // ── VERIFY RAZORPAY SIGNATURE ────────────────────────
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID!;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // FIX (MEDIUM): timing-safe comparison
    if (!timingSafeEqual(expectedSignature, razorpay_signature as string)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // ── FIX (HIGH): read packId from Razorpay order notes — not from client ──
    // This prevents pack upgrade attacks (pay pack_a, claim pack_d credits)
    const orderNotes = await getRazorpayOrderNotes(razorpay_order_id, razorpayKeyId, razorpayKeySecret);
    const trustedPackId = orderNotes?.packId;
    const trustedUserId = orderNotes?.userId;

    if (!trustedPackId || !(trustedPackId in PACKS)) {
      console.error('Missing/invalid packId in Razorpay order notes', { razorpay_order_id, orderNotes });
      return NextResponse.json({ error: 'Cannot verify pack from order' }, { status: 400 });
    }

    // Verify the authenticated user matches the order's userId
    if (trustedUserId && trustedUserId !== user.id) {
      console.warn('User ID mismatch on payment verification', { expected: trustedUserId, got: user.id });
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
    }

    const pack = PACKS[trustedPackId as PackId];

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── FIX (CRITICAL): INSERT first to claim the slot atomically ────────────
    // The DB UNIQUE constraint on razorpay_payment_id means only one request wins.
    // ignoreDuplicates: true returns empty data if conflict — no error thrown.
    const { data: insertedRows } = await adminClient
      .from('transactions')
      .insert({
        user_id: user.id,
        razorpay_order_id,
        razorpay_payment_id,
        pack_name: pack.name,
        amount_inr: pack.priceInr,
        credits_added: pack.orders,
        status: 'pending_credit',
        notes: 'checkout-widget',
      })
      .select('id')
      // ignoreDuplicates: true → INSERT ... ON CONFLICT DO NOTHING
      .limit(1);

    // If no row was inserted, another request already claimed this payment
    if (!insertedRows || insertedRows.length === 0) {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 409 });
    }

    const transactionId = insertedRows[0].id;

    // ── ADD CREDITS ───────────────────────────────────────
    const { error: rpcError } = await adminClient.rpc('add_credits', {
      user_uuid: user.id,
      amount: pack.orders,
    });

    if (rpcError) {
      console.error('Credit addition error:', rpcError);
      // Mark transaction as failed so it can be retried / manually resolved
      await adminClient.from('transactions')
        .update({ status: 'credit_failed' })
        .eq('id', transactionId);
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
    }

    // Mark transaction as completed
    await adminClient.from('transactions')
      .update({ status: 'completed' })
      .eq('id', transactionId);

    return NextResponse.json({
      success: true,
      message: `Payment verified. ${pack.orders} order credits added.`,
      creditsAdded: pack.orders,
    });
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment verification failed' },
      { status: 500 }
    );
  }
}
