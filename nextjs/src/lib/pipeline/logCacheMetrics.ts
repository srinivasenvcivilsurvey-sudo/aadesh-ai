/**
 * Aadesh AI — Prompt Cache Metrics Logger
 * Monitors Anthropic cache hits/misses to detect caching bugs.
 * Property 24: Cache miss warning logged on 2nd+ order with zero cached tokens.
 */

/**
 * Log cache metrics after each AI generation call.
 * Writes to console (picked up by VPS logging).
 * Emits CACHE_MISS_WARNING if caching should have kicked in but didn't.
 *
 * @param userId - The officer's user ID
 * @param cachedTokens - Value from Anthropic API response usage.cache_read_input_tokens
 * @param orderIndexInSession - 1-based index of this order in the current session
 */
export function logCacheMetrics(
  userId: string,
  cachedTokens: number,
  orderIndexInSession: number
): void {
  const base = {
    userId,
    cachedTokens,
    orderIndexInSession,
    timestamp: new Date().toISOString(),
  };

  if (orderIndexInSession >= 2 && cachedTokens === 0) {
    // Cache should have been warm by the 2nd order — this is a bug signal
    console.warn('[CACHE_MISS_WARNING]', JSON.stringify({
      ...base,
      message: 'Expected cache hit on order 2+ but cached_tokens=0. Check cache_control placement and TTL.',
    }));
  } else {
    console.info('[CACHE_METRICS]', JSON.stringify({
      ...base,
      message: cachedTokens > 0
        ? `Cache hit: ${cachedTokens} tokens read from cache`
        : 'First order in session — cache write expected',
    }));
  }
}
