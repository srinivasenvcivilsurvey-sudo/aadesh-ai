/**
 * Unit tests for rateLimiter
 * Feature: generation-pipeline
 * Validates: Requirements 15.1–15.6
 */

import { describe, it, expect, vi } from 'vitest';
import { checkDailyLimit, formatResetTime } from '../rateLimiter';
import type { SupabaseClient } from '@supabase/supabase-js';

function makeAdminClient(count: number, shouldError = false): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: () => ({
            lt: () =>
              shouldError
                ? Promise.resolve({ count: null, error: { message: 'DB error' } })
                : Promise.resolve({ count, error: null }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe('checkDailyLimit', () => {
  it('allows generation when ordersToday < 5', async () => {
    const result = await checkDailyLimit('user-1', makeAdminClient(3));
    expect(result.allowed).toBe(true);
    expect(result.ordersToday).toBe(3);
  });

  it('blocks generation when ordersToday >= 5', async () => {
    const result = await checkDailyLimit('user-1', makeAdminClient(5));
    expect(result.allowed).toBe(false);
    expect(result.ordersToday).toBe(5);
  });

  it('blocks at exactly 5 orders', async () => {
    const result = await checkDailyLimit('user-1', makeAdminClient(5));
    expect(result.allowed).toBe(false);
  });

  it('allows when count is 4 (one below limit)', async () => {
    const result = await checkDailyLimit('user-1', makeAdminClient(4));
    expect(result.allowed).toBe(true);
  });

  it('allows generation when DB check fails (Req 15.6)', async () => {
    const result = await checkDailyLimit('user-1', makeAdminClient(0, true));
    expect(result.allowed).toBe(true);
  });

  it('returns a resetAt ISO string', async () => {
    const result = await checkDailyLimit('user-1', makeAdminClient(0));
    expect(() => new Date(result.resetAt)).not.toThrow();
    expect(new Date(result.resetAt).getTime()).toBeGreaterThan(Date.now());
  });
});

describe('formatResetTime', () => {
  it('returns a time string with IST', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const result = formatResetTime(tomorrow.toISOString());
    expect(result).toMatch(/\d{2}:\d{2} IST/);
  });
});
