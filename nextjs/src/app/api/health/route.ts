/**
 * GET /api/health
 * Health check endpoint for UptimeRobot monitoring.
 *
 * - No authentication required
 * - Returns 200 { status: "ok", timestamp, version } under normal conditions
 * - Returns 503 { status: "degraded", reason: "database_unavailable" } if DB unreachable
 * - Responds within 2 seconds
 * - Does NOT expose API keys, credentials, or internal IPs
 *
 * Requirements: 20.1–20.6
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fix 14: Read version from a constant rather than npm_package_version
// (npm_package_version is not reliably available in Next.js server runtime)
const APP_VERSION = '0.1.0';
const DB_CHECK_TIMEOUT_MS = 1500; // 1.5s — leaves 0.5s buffer for response

// FIX 2026-04-17 (BUG-L3): Expose build SHA so Lakshmi can verify VPS deploy freshness.
// VPS PM2 ecosystem should set BUILD_SHA=$(git rev-parse --short HEAD) before `pm2 reload`.
// Falls back to 'unknown' if env var missing (local dev, un-set deploys).
const BUILD_SHA = process.env.BUILD_SHA ?? 'unknown';

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  // ── Test Supabase connection ──────────────────────────────────────────────
  const dbOk = await checkDatabase();

  if (!dbOk) {
    return NextResponse.json(
      { status: 'degraded', reason: 'database_unavailable', buildSha: BUILD_SHA },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { status: 'ok', timestamp, version: APP_VERSION, buildSha: BUILD_SHA },
    { status: 200 }
  );
}

async function checkDatabase(): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return false;
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Race the DB query against a timeout
    const dbQuery = adminClient.from('profiles').select('id', { count: 'exact', head: true });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DB check timeout')), DB_CHECK_TIMEOUT_MS)
    );

    await Promise.race([dbQuery, timeoutPromise]);
    return true;
  } catch {
    return false;
  }
}
