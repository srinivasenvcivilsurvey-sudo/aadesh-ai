/**
 * Property tests for withRetry
 * Feature: generation-pipeline
 * Property 27: Rate limit retries are capped at 3 total attempts
 * Validates: Requirements 12.2
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { withRetry, isRateLimit } from '../withRetry';

describe('withRetry — Property 27: Rate limit retries are capped at 3 total attempts', () => {
  it('never makes more than 3 total attempts on repeated rate limit errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // how many rate limit errors to throw
        async (errorCount) => {
          let callCount = 0;
          const fn = async () => {
            callCount++;
            throw new Error('429 rate limit exceeded');
          };

          try {
            await withRetry(fn, 3, 0); // delayMs=0 for fast tests
          } catch {
            // expected to throw after exhausting retries
          }

          // Total attempts must never exceed 3 (maxAttempts)
          expect(callCount).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('succeeds on first attempt when no error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        async (result) => {
          let callCount = 0;
          const fn = async () => {
            callCount++;
            return result;
          };

          const output = await withRetry(fn, 3, 0);
          expect(output).toBe(result);
          expect(callCount).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('does not retry on non-rate-limit errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (errorMsg) => {
          // Ensure it's not a rate limit message
          const msg = errorMsg.replace(/429|rate limit|too many/gi, 'other');
          let callCount = 0;
          const fn = async () => {
            callCount++;
            throw new Error(msg);
          };

          try {
            await withRetry(fn, 3, 0);
          } catch {
            // expected
          }

          // Non-rate-limit errors should not be retried
          expect(callCount).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('isRateLimit', () => {
  it('detects 429 in error message', () => {
    expect(isRateLimit(new Error('HTTP 429 Too Many Requests'))).toBe(true);
    expect(isRateLimit(new Error('rate limit exceeded'))).toBe(true);
    expect(isRateLimit(new Error('too many requests'))).toBe(true);
  });

  it('returns false for non-rate-limit errors', () => {
    expect(isRateLimit(new Error('Network error'))).toBe(false);
    expect(isRateLimit(new Error('500 Internal Server Error'))).toBe(false);
    expect(isRateLimit(null)).toBe(false);
  });
});
