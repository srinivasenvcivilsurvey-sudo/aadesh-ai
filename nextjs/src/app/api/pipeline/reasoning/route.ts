/**
 * POST /api/pipeline/reasoning
 * Legal Shield Layer 3.5 — Officer Reasoning Capture
 *
 * Validates the officer's reasoning inputs, computes a canonical
 * SHA-256 reasoning hash, and writes an audit_log row.
 *
 * Validation rules:
 *  1. key_issue.length >= 40
 *  2. documents_relied is a non-empty array of strings
 *  3. decision_reasoning.length >= 80
 *  4. Both key_issue and decision_reasoning must contain at least one of:
 *     "survey", "ಸರ್ವೆ", or any 2+ digit sequence (case-insensitive substring)
 *
 * Returns: { reasoning_hash: string }
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  computeReasoningHash,
  isLockExpired,
  type LegalOrderState,
} from '@/lib/pipeline/legalState';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReasoningBody {
  receipt_id: string;
  order_id?: string;
  attestation_hash: string;
  key_issue: string;
  documents_relied: string[];
  decision_reasoning: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Simplified server-side entity reference check.
 * Passes if text contains "survey", "ಸರ್ವೆ", or any 2+ digit sequence.
 */
function containsEntityRef(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('survey') || lower.includes('ಸರ್ವೆ') || /\d{2,}/.test(lower);
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
    order_id,
    attestation_hash,
    key_issue,
    documents_relied,
    decision_reasoning,
  } = body as Partial<ReasoningBody>;

  // ── Validation 1: required fields present ──────────────────────────────────
  const orderId = typeof order_id === 'string' && order_id.trim()
    ? order_id.trim()
    : typeof receipt_id === 'string'
      ? receipt_id.trim()
      : '';

  if (
    typeof receipt_id !== 'string' || !receipt_id.trim() ||
    !orderId ||
    typeof attestation_hash !== 'string' || !attestation_hash.trim() ||
    typeof key_issue !== 'string' ||
    !Array.isArray(documents_relied) ||
    typeof decision_reasoning !== 'string'
  ) {
    return NextResponse.json(
      {
        error:
          'Missing required fields: receipt_id, attestation_hash, key_issue, documents_relied, decision_reasoning',
      },
      { status: 400 }
    );
  }

  // ── Validation 2: key_issue length >= 40 ──────────────────────────────────
  if (key_issue.trim().length < 40) {
    return NextResponse.json(
      {
        error: `key_issue too short: ${key_issue.trim().length} chars provided, 40 required. / ಕಾನೂನು ಸಮಸ್ಯೆ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ.`,
      },
      { status: 400 }
    );
  }

  // ── Validation 3: documents_relied non-empty array of strings ─────────────
  if (documents_relied.length === 0) {
    return NextResponse.json(
      { error: 'documents_relied must contain at least one document. / ಕನಿಷ್ಠ ಒಂದು ದಾಖಲೆ ಅಗತ್ಯ.' },
      { status: 400 }
    );
  }
  for (const entry of documents_relied) {
    if (typeof entry !== 'string' || !entry.trim()) {
      return NextResponse.json(
        { error: 'Each entry in documents_relied must be a non-empty string.' },
        { status: 400 }
      );
    }
  }

  // ── Validation 4: decision_reasoning length >= 80 ─────────────────────────
  if (decision_reasoning.trim().length < 80) {
    return NextResponse.json(
      {
        error: `decision_reasoning too short: ${decision_reasoning.trim().length} chars provided, 80 required. / ತಾರ್ಕಿಕತೆ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ.`,
      },
      { status: 400 }
    );
  }

  // ── Validation 5: entity reference in key_issue ───────────────────────────
  if (!containsEntityRef(key_issue)) {
    return NextResponse.json(
      {
        error:
          'key_issue must reference a party name, survey number, or case fact. / ಕಾನೂನು ಸಮಸ್ಯೆಯಲ್ಲಿ ಪಕ್ಷಕಾರ ಅಥವಾ ಸರ್ವೆ ಸಂಖ್ಯೆ ಉಲ್ಲೇಖಿಸಿ.',
      },
      { status: 400 }
    );
  }

  // ── Validation 6: entity reference in decision_reasoning ─────────────────
  if (!containsEntityRef(decision_reasoning)) {
    return NextResponse.json(
      {
        error:
          'decision_reasoning must reference a party name, survey number, or case fact. / ತಾರ್ಕಿಕತೆಯಲ್ಲಿ ಪ್ರಕರಣದ ಸಂಗತಿ ಉಲ್ಲೇಖಿಸಿ.',
      },
      { status: 400 }
    );
  }

  // ── Service-role client for DB writes ─────────────────────────────────────
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('[reasoning] SUPABASE_SERVICE_ROLE_KEY not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  // ── Server-side order state gate ───────────────────────────────────────────
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, user_id, state, state_version, attestation_hash, locked_at, attestation_nonce_consumed')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: 'Order record not found. Please upload again. / ಆದೇಶ ದಾಖಲೆ ಕಾಣೆಯಾಗಿದೆ.' },
      { status: 409 }
    );
  }

  if ((order.state as LegalOrderState) !== 'entity_locked') {
    return NextResponse.json(
      { error: `Reasoning requires state=entity_locked, got ${order.state}` },
      { status: 409 }
    );
  }

  if (order.attestation_hash !== attestation_hash.trim()) {
    return NextResponse.json(
      { error: 'Attestation hash mismatch. Please redo Entity Lock. / ದೃಢೀಕರಣ ಹ್ಯಾಶ್ ಹೊಂದಾಣಿಕೆ ಇಲ್ಲ.' },
      { status: 409 }
    );
  }

  if (order.attestation_nonce_consumed) {
    return NextResponse.json({ error: 'Attestation already consumed.' }, { status: 409 });
  }

  if (!order.locked_at || isLockExpired(order.locked_at)) {
    return NextResponse.json(
      { error: 'Entity Lock expired. Please verify entities again. / ದೃಢೀಕರಣ ಅವಧಿ ಮುಗಿದಿದೆ.' },
      { status: 410 }
    );
  }

  // ── Compute reasoning hash ─────────────────────────────────────────────────
  const payload: ReasoningBody = {
    receipt_id: receipt_id.trim(),
    order_id: orderId,
    attestation_hash: attestation_hash.trim(),
    key_issue: key_issue.trim(),
    documents_relied,
    decision_reasoning: decision_reasoning.trim(),
  };

  const reasoning_hash = computeReasoningHash({
    user_id: user.id,
    order_id: orderId,
    attestation_hash: payload.attestation_hash,
    key_issue: payload.key_issue,
    documents_relied: payload.documents_relied,
    decision_reasoning: payload.decision_reasoning,
  });

  const { data: updatedRows, error: updateError } = await adminClient
    .from('orders')
    .update({
      state: 'reasoned',
      state_version: Number(order.state_version) + 1,
      reasoning_hash,
      key_issue: payload.key_issue,
      documents_relied: payload.documents_relied,
      reasoning_text: payload.decision_reasoning,
    })
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('state', 'entity_locked')
    .eq('state_version', order.state_version)
    .select('id');

  if (updateError || !updatedRows || updatedRows.length !== 1) {
    console.error('[reasoning] Order state update failed:', updateError?.message);
    return NextResponse.json(
      { error: 'Could not save reasoning state. Please retry. / ತಾರ್ಕಿಕ ಸ್ಥಿತಿ ಉಳಿಸಲು ವಿಫಲ.' },
      { status: 409 }
    );
  }

  // ── Write audit log ────────────────────────────────────────────────────────
  const { error: auditError } = await adminClient.from('audit_log').insert({
    user_id: user.id,
    receipt_id: payload.receipt_id,
    event_type: 'reasoning_captured',
    event_payload: payload,
    event_hash: reasoning_hash,
  });

  if (auditError) {
    console.error('[reasoning] Audit log write error:', auditError.message);
    return NextResponse.json(
      {
        error:
          'Failed to record reasoning. Please retry. / ತಾರ್ಕಿಕ ದಾಖಲಾತಿ ವಿಫಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ reasoning_hash });
}
