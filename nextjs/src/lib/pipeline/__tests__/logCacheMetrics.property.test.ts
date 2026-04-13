/**
 * Property tests for logCacheMetrics
 * Feature: generation-pipeline
 * Property 24: Cache miss warning is logged on second+ order with zero cached tokens
 * Validates: Requirements 11.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

describe('logCacheMetrics — Property 24: Cache miss warning on 2nd+ order with zero cached tokens', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('emits CACHE_MISS_WARNING when orderIndex >= 2 and cachedTokens === 0', async () => {
    const { logCacheMetrics } = await import('../logCacheMetrics');

    await fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }), // orderIndexInSession >= 2
        (orderIndex) => {
          vi.clearAllMocks();
          logCacheMetrics('test-user', 0, orderIndex);
          expect(console.warn).toHaveBeenCalledWith(
            '[CACHE_MISS_WARNING]',
            expect.stringContaining('cached_tokens=0')
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  it('does NOT emit CACHE_MISS_WARNING on first order (index 1) even with zero tokens', async () => {
    const { logCacheMetrics } = await import('../logCacheMetrics');
    vi.clearAllMocks();
    logCacheMetrics('test-user', 0, 1);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does NOT emit CACHE_MISS_WARNING when cachedTokens > 0', async () => {
    const { logCacheMetrics } = await import('../logCacheMetrics');

    await fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }), // cachedTokens > 0
        fc.integer({ min: 1, max: 20 }),      // any order index
        (cachedTokens, orderIndex) => {
          vi.clearAllMocks();
          logCacheMetrics('test-user', cachedTokens, orderIndex);
          expect(console.warn).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });
});
