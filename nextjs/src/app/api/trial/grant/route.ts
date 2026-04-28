/**
 * POST /api/trial/grant
 *
 * Aadesh AI — Trial Credit Grant (Pricing v2, 2026-04-27)
 *
 * Trial is INTERNAL ONLY — never a Razorpay object. Grants exactly one
 * free credit per verified account. Abuse protection enforced here:
 *
 *   1. Bearer token auth (must be a real Supabase user)
 *   2. auth.users.email_confirmed_at must be non-null
 *   3. auth.users.phone_confirmed_at must be non-null (if PHONE_VERIFICATION_REQUIRED)
 *   4. profiles.trial_credit_granted_at must be NULL (never claimed)
 *   5. Email/phone uniqueness across accounts is enforced upstream by
 *      auth.users (Supabase native unique constraint)
 *
 * The grant itself is a single atomic UPDATE with a WHERE clause that
 * blocks double-grant via concurrent requests.
 *
 * Trial-state flags consumed downstream:
 *   - generate route: forces Sonnet only and 30-page / 5 MB caps when
 *     credits are spent against a still-unused trial.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Toggle phone verification gate. Default true — flip to false if Supabase
// project is not configured for phone auth and email-only verification is
// considered sufficient for trial.
const PHONE_VERIFICATION_REQUIRED = true;

interface TrialGrantSuccess {
  success: true;
  credits_granted: 1;
  trial_credit_granted_at: string;
}

interface TrialGrantError {
  success: false;
  error: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<TrialGrantSuccess | TrialGrantError>> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }
  const token = authHeader.split(' ')[1];

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  // ── Verification gate ─────────────────────────────────────────────────────
  // user.email_confirmed_at and user.phone_confirmed_at come from auth.users
  // and are populated by Supabase's verification flows.
  if (!user.email_confirmed_at) {
    return NextResponse.json(
      {
        success: false,
        error:
          'ಇಮೇಲ್ ಪರಿಶೀಲನೆ ಬಾಕಿ / Verify your email before claiming the free trial.',
      },
      { status: 400 },
    );
  }

  if (PHONE_VERIFICATION_REQUIRED && !user.phone_confirmed_at) {
    return NextResponse.json(
      {
        success: false,
        error:
          'ಫೋನ್ ಪರಿಶೀಲನೆ ಬಾಕಿ / Verify your phone before claiming the free trial.',
      },
      { status: 400 },
    );
  }

  // ── Service role for the privileged UPDATE ────────────────────────────────
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('[trial/grant] SUPABASE_SERVICE_ROLE_KEY not configured');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 },
    );
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
  );

  // ── Pre-flight: has trial already been granted? ───────────────────────────
  // Cheap check before the atomic UPDATE — gives a clear 409 message without
  // burning a write. The atomic UPDATE below is still the source of truth
  // for race safety.
  const { data: existing, error: readError } = await adminClient
    .from('profiles')
    .select('trial_credit_granted_at, credits_remaining')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) {
    console.error('[trial/grant] profile read error:', readError.message);
    return NextResponse.json(
      { success: false, error: 'Could not verify trial state. Please retry.' },
      { status: 500 },
    );
  }

  if (existing?.trial_credit_granted_at) {
    return NextResponse.json(
      {
        success: false,
        error:
          'ಉಚಿತ ಪ್ರಯತ್ನ ಈಗಾಗಲೇ ಬಳಸಲಾಗಿದೆ / Free trial already claimed on this account.',
      },
      { status: 409 },
    );
  }

  // ── Atomic grant ──────────────────────────────────────────────────────────
  // The .is('trial_credit_granted_at', null) clause makes this race-safe:
  // two concurrent requests both pass the pre-flight, but only one UPDATE
  // affects a row. The other gets 0 rows back and we return 409.
  const grantedAtIso = new Date().toISOString();
  const currentCredits = existing?.credits_remaining ?? 0;

  const { data: rows, error: updateError } = await adminClient
    .from('profiles')
    .update({
      trial_credit_granted_at: grantedAtIso,
      credits_remaining: currentCredits + 1,
    })
    .eq('id', user.id)
    .is('trial_credit_granted_at', null)
    .select('id');

  if (updateError) {
    console.error('[trial/grant] update error:', updateError.message);
    return NextResponse.json(
      { success: false, error: 'Trial grant failed. Please retry.' },
      { status: 500 },
    );
  }

  if (!rows || rows.length === 0) {
    // Lost the race — another concurrent request just claimed the trial
    return NextResponse.json(
      {
        success: false,
        error:
          'ಉಚಿತ ಪ್ರಯತ್ನ ಈಗಾಗಲೇ ಬಳಸಲಾಗಿದೆ / Free trial already claimed on this account.',
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    success: true,
    credits_granted: 1,
    trial_credit_granted_at: grantedAtIso,
  });
}
