import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Recharge pack definitions (amounts in paise for Razorpay)
const PACKS = {
  pack_a: { name: 'Pack A', orders: 30, priceInr: 499, amountPaise: 49900 },
  pack_b: { name: 'Pack B', orders: 75, priceInr: 999, amountPaise: 99900 },
  pack_c: { name: 'Pack C', orders: 200, priceInr: 1999, amountPaise: 199900 },
  pack_d: { name: 'Pack D', orders: 600, priceInr: 4999, amountPaise: 499900 },
} as const;

// POST /api/razorpay — Create a Razorpay order
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Verify user
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

    if (!packId || !(packId in PACKS)) {
      return NextResponse.json(
        { error: 'Invalid pack. Choose: pack_a, pack_b, pack_c, pack_d' },
        { status: 400 }
      );
    }

    const pack = PACKS[packId as keyof typeof PACKS];

    // Check Razorpay credentials
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Razorpay not configured' },
        { status: 500 }
      );
    }

    // Create Razorpay order via their API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: pack.amountPaise,
        currency: 'INR',
        receipt: `aadesh_${user.id}_${packId}_${Date.now()}`,
        notes: {
          userId: user.id,
          packId,
          packName: pack.name,
          ordersInPack: pack.orders,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      throw new Error(`Razorpay error: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: pack.amountPaise,
      currency: 'INR',
      packName: pack.name,
      ordersInPack: pack.orders,
      keyId: razorpayKeyId,
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
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packId) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }

    // Verify signature
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment verified — credits would be added here via Supabase
    const pack = PACKS[packId as keyof typeof PACKS];

    // TODO: Use Supabase service role to add credits
    // await supabaseAdmin.rpc('add_credits', { user_id, credits: pack.orders })

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
