/**
 * Aadesh AI — IP-based rate limiter (C9 fix)
 *
 * Sliding window per IP. Module-level Map persists across requests in the
 * Node.js process (single PM2 instance on VPS — no Redis needed).
 *
 * Limits: 30 requests per IP per 60 seconds.
 * Applies to: /api/pipeline/generate and /api/pipeline/vision-read
 */

const LIMIT = 30;         // max requests per window
const WINDOW_MS = 60_000; // 1 minute

interface IpRecord {
  timestamps: number[];
}

const store = new Map<string, IpRecord>();

export interface IpLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

/**
 * Check whether the given IP is within the rate limit.
 * Mutates the store — call once per request.
 */
export function checkIpLimit(ip: string): IpLimitResult {
  const now = Date.now();
  const record = store.get(ip) ?? { timestamps: [] };

  // Evict timestamps outside the current window
  record.timestamps = record.timestamps.filter(t => now - t < WINDOW_MS);

  if (record.timestamps.length >= LIMIT) {
    const oldest = record.timestamps[0];
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }

  record.timestamps.push(now);
  store.set(ip, record);
  return { allowed: true, retryAfterMs: 0 };
}
