/**
 * Per-User Daily Rate Limiter — Aadesh AI v9.2
 *
 * Enforces a maximum of 5 order generation attempts per user per calendar day (IST).
 * IST = UTC+5:30. Day boundary = midnight IST.
 *
 * Requirements: 15.1–15.6
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { logError } from './errorLogger';

const MAX_ORDERS_PER_DAY = 10; // FIX 2026-04-12: 5→10 per user per day
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

export interface RateLimitResult {
  allowed: boolean;
  ordersToday: number;
  resetAt: string; // ISO 8601 — next IST midnight in UTC
}

/**
 * Returns the UTC timestamps for the start and end of the current IST calendar day.
 */
function getISTDayBoundaries(): { start: Date; end: Date } {
  const nowUtc = new Date();
  // Shift to IST
  const nowIst = new Date(nowUtc.getTime() + IST_OFFSET_MS);
  // Truncate to IST midnight
  const istMidnight = new Date(nowIst);
  istMidnight.setUTCHours(0, 0, 0, 0);
  // Convert IST midnight back to UTC
  const utcStart = new Date(istMidnight.getTime() - IST_OFFSET_MS);
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000);
  return { start: utcStart, end: utcEnd };
}

/**
 * Checks whether the user is allowed to generate another order today.
 *
 * @param userId - The user's UUID
 * @param adminClient - Supabase admin client (service role)
 * @returns RateLimitResult — allowed, count today, and reset time
 */
export async function checkDailyLimit(
  userId: string,
  adminClient: SupabaseClient
): Promise<RateLimitResult> {
  const { start, end } = getISTDayBoundaries();
  const resetAt = end.toISOString();

  try {
    const { count, error } = await adminClient
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString());

    if (error) {
      // FIX C3: fail-closed — DB error means we cannot verify limit, block generation
      await logError({
        message: `Rate limit check failed for user ${userId}: ${error.message}`,
        route: '/api/pipeline/generate',
        userId,
        severity: 'WARNING',
        metadata: { error: error.message },
      });
      return { allowed: false, ordersToday: 0, resetAt };
    }

    const ordersToday = count ?? 0;
    const allowed = ordersToday < MAX_ORDERS_PER_DAY;

    return { allowed, ordersToday, resetAt };
  } catch (err) {
    // FIX C3: fail-closed on exception — cannot verify limit, block generation
    await logError({
      message: `Rate limit check threw for user ${userId}`,
      stack: err instanceof Error ? err.stack : undefined,
      route: '/api/pipeline/generate',
      userId,
      severity: 'WARNING',
    });
    return { allowed: false, ordersToday: 0, resetAt };
  }
}

/**
 * Formats the reset time as a human-readable IST time string.
 * e.g. "12:00 AM IST (midnight)"
 */
export function formatResetTime(resetAtUtc: string): string {
  const resetDate = new Date(resetAtUtc);
  const istDate = new Date(resetDate.getTime() + IST_OFFSET_MS);
  const hours = istDate.getUTCHours().toString().padStart(2, '0');
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} IST`;
}
