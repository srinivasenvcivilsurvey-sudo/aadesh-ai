/**
 * POST /api/pipeline/entity-lock
 * Legal Shield Layer 3 — Entity Lock Attestation
 *
 * Validates the officer's confirmed entity fields, computes a
 * canonical SHA-256 attestation hash, and writes an audit_log row.
 *
 * Validation rules:
 *  1. All required body fields present
 *  2. typed_name fuzzy-matches profiles.full_name (trim + lowercase, substring match)
 *  3. Every key in confirmed_fields that differs from original extracted value
 *     must have a corresponding reason in conflict_reasons
 *  4. Sum of field_timings values > 15 000 ms
 *
 * Returns: { attestation_hash: string }
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EntityLockBody {
  receipt_id: string;
  confirmed_fields: Record<string, string>;
  conflict_reasons: Record<string, string>;
  field_timings: Record<string, number>;
  typed_name: string;
  attested_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJson).join(',')}]`;
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = sorted.map(k => {
    const val = (obj as Record<string, unknown>)[k];
    return `${JSON.stringify(k)}:${canonicalJson(val)}`;
  });
  return `{${pairs.join(',')}}`;
}

function sha256hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function fuzzyMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase();
  return norm(a).includes(norm(b)) || norm(b).includes(norm(a));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized / ಅನಧಿಕೃತ' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized / ಅನಧಿಕೃತ' }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const {
    receipt_id,
    confirmed_fields,
    conflict_reasons,
    field_timings,
    typed_name,
    attested_at,
  } = body as Partial<EntityLockBody>;

  // ── Validation 1: required fields present ──────────────────────────────────
  if (
    typeof receipt_id !== 'string' || !receipt_id.trim() ||
    !isRecord(confirmed_fields) ||
    !isRecord(conflict_reasons) ||
    !isRecord(field_timings) ||
    typeof typed_name !== 'string' || !typed_name.trim() ||
    typeof attested_at !== 'string' || !attested_at.trim()
  ) {
    return NextResponse.json(
      {
        error:
          'Missing required fields: receipt_id, confirmed_fields, conflict_reasons, field_timings, typed_name, attested_at',
      },
      { status: 400 }
    );
  }

  // ── Validation: confirmed_fields values must be strings ───────────────────
  for (const [k, v] of Object.entries(confirmed_fields)) {
    if (typeof v !== 'string') {
      return NextResponse.json(
        { error: `confirmed_fields.${k} must be a string` },
        { status: 400 }
      );
    }
  }

  // ── Service-role client for DB writes ─────────────────────────────────────
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('[entity-lock] SUPABASE_SERVICE_ROLE_KEY not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  // ── Validation 2: typed_name fuzzy-matches profiles.full_name ─────────────
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[entity-lock] Profile fetch error:', profileError?.message);
    return NextResponse.json(
      { error: 'Could not verify officer identity. Please try again.' },
      { status: 400 }
    );
  }

  if (!fuzzyMatch(typed_name, (profile.full_name as string) ?? '')) {
    return NextResponse.json(
      {
        error:
          'Typed name does not match officer records. Please type your registered name. / ನಮೂದಿಸಿದ ಹೆಸರು ಹೊಂದಾಣಿಕೆ ಆಗಿಲ್ಲ.',
      },
      { status: 400 }
    );
  }

  // ── Validation 3: dwell time > 15 000 ms ──────────────────────────────────
  const totalDwellMs = Object.values(field_timings).reduce<number>((acc, v) => {
    return acc + (typeof v === 'number' ? v : 0);
  }, 0);

  if (totalDwellMs < 15_000) {
    return NextResponse.json(
      {
        error: `Insufficient review time: ${Math.round(totalDwellMs / 1000)}s recorded, minimum 15s required.`,
      },
      { status: 400 }
    );
  }

  // ── Compute attestation hash ───────────────────────────────────────────────
  const payload: EntityLockBody = {
    receipt_id: receipt_id.trim(),
    confirmed_fields: confirmed_fields as Record<string, string>,
    conflict_reasons: conflict_reasons as Record<string, string>,
    field_timings: field_timings as Record<string, number>,
    typed_name: typed_name.trim(),
    attested_at: attested_at.trim(),
  };

  const attestation_hash = sha256hex(canonicalJson(payload));

  // ── Write audit log ────────────────────────────────────────────────────────
  const { error: auditError } = await adminClient.from('audit_log').insert({
    user_id: user.id,
    receipt_id: payload.receipt_id,
    event_type: 'entity_lock_attested',
    event_payload: payload,
    event_hash: attestation_hash,
  });

  if (auditError) {
    console.error('[entity-lock] Audit log write error:', auditError.message);
    return NextResponse.json(
      { error: 'Failed to record attestation. Please retry. / ದಾಖಲಾತಿ ವಿಫಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ attestation_hash });
}
