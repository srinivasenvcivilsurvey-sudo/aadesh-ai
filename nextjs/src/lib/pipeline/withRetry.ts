/**
 * Aadesh AI â€” Retry utility for AI API calls
 * Handles rate limits (HTTP 429) with configurable delay and max attempts.
 * Property 27: Rate limit retries are capped at 3 total attempts.
 */

/**
 * Returns true if the error is a rate limit error (HTTP 429).
 */
export function isRateLimit(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes('429') ||
      err.message.toLowerCase().includes('rate limit') ||
      err.message.toLowerCase().includes('too many requests')
    );
  }
  return false;
}

/**
 * Wraps an async function with retry logic.
 * On rate limit errors: waits delayMs then retries.
 * On other errors: throws immediately (no retry).
 * Total attempts = maxAttempts (initial call + retries).
 *
 * @param fn - The async function to retry
 * @param maxAttempts - Maximum total attempts (default: 3)
 * @param delayMs - Delay between retries in ms (default: 30,000)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 8_000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (isRateLimit(err) && attempt < maxAttempts) {
        await sleep(delayMs);
        continue;
      }

      // Non-rate-limit error or last attempt â€” throw immediately
      throw err;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

