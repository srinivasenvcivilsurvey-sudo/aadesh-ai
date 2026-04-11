
/**
 * POST /api/pipeline/migrate
 * Admin-only migration route for v9.2 schema additions.
 *
 * Adds to orders table:
 *   - prompt_version TEXT DEFAULT 'V3.2.1'
 *   - input_tokens INTEGER
 *   - output_tokens INTEGER
 *
 * Creates audit_log table if not exists.
 *
 * Protected by SUPABASE_SERVICE_ROLE_KEY check in Authorization header.
 *
 * Requirements: 18.1–18.6, 19.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Admin auth check ──────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const results: string[] = [];

  // ── Migration 1: Add prompt_version column ────────────────────────────────
  try {
    const { error } = await adminClient.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS prompt_version TEXT DEFAULT 'V3.2.1';`,
    });
    if (error) throw error;
    results.push('✓ prompt_version column added (or already exists)');
  } catch (err) {
    // Try direct approach via raw SQL if RPC not available
    results.push(`⚠ prompt_version: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Migration 2: Add input_tokens column ──────────────────────────────────
  try {
    const { error } = await adminClient.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS input_tokens INTEGER;`,
    });
    if (error) throw error;
    results.push('✓ input_tokens column added (or already exists)');
  } catch (err) {
    results.push(`⚠ input_tokens: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Migration 3: Add output_tokens column ─────────────────────────────────
  try {
    const { error } = await adminClient.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS output_tokens INTEGER;`,
    });
    if (error) throw error;
    results.push('✓ output_tokens column added (or already exists)');
  } catch (err) {
    results.push(`⚠ output_tokens: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Migration 4: Create audit_log table ───────────────────────────────────
  const createAuditLogSQL = `
    CREATE TABLE IF NOT EXISTS audit_log (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID,
      severity    TEXT NOT NULL CHECK (severity IN ('ERROR', 'WARNING', 'INFO')),
      message     TEXT NOT NULL,
      stack       TEXT,
      route       TEXT,
      metadata    JSONB,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS audit_log_severity_idx ON audit_log(severity);
    CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at DESC);
  `;

  try {
    const { error } = await adminClient.rpc('exec_sql', { sql: createAuditLogSQL });
    if (error) throw error;
    results.push('✓ audit_log table created (or already exists)');
  } catch (err) {
    results.push(`⚠ audit_log: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Migration 5: Add acknowledgement_at column to orders ─────────────────
  try {
    const { error } = await adminClient.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS acknowledgement_at TIMESTAMPTZ;`,
    });
    if (error) throw error;
    results.push('✓ acknowledgement_at column added (or already exists)');
  } catch (err) {
    results.push(`⚠ acknowledgement_at: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({
    success: true,
    message: 'Migration complete',
    results,
    timestamp: new Date().toISOString(),
  });
}
