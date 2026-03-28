// In-memory sliding window rate limiter
// Sufficient for single-server VPS deployment

const requests = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;  // 10 per minute per user

/**
 * Check if a user has exceeded the rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = requests.get(userId) || [];

  // Remove timestamps outside the window
  const recent = timestamps.filter(t => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldestInWindow = recent[0];
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);
    return { allowed: false, retryAfterMs };
  }

  recent.push(now);
  requests.set(userId, recent);
  return { allowed: true };
}

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of requests.entries()) {
    const recent = timestamps.filter(t => now - t < WINDOW_MS);
    if (recent.length === 0) {
      requests.delete(userId);
    } else {
      requests.set(userId, recent);
    }
  }
}, 5 * 60_000);
