      
                
                
                
                      
                      /**
 * Self-Hosted Error Logger — Aadesh AI v9.2
 *
 * Writes errors to:
 *   1. Supabase audit_log table (structured, queryable)
 *   2. console (VPS captures stdout/stderr to /var/log/aadesh/errors.log)
 *
 * No third-party error monitoring services (no Sentry).
 * Requirements: 19.1–19.6
 */

import { createClient } from '@supabase/supabase-js';

export type LogSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ErrorLogParams {
  message: string;
  stack?: string;
  route?: string;
  userId?: string;
  severity: LogSeverity;
  metadata?: Record<string, unknown>;
}

const MAX_STACK_LENGTH = 2000;

/**
 * Logs an error/warning/info event to Supabase audit_log and console.
 * Never throws — logging failures are silently swallowed to avoid cascading errors.
 */
export async function logError(params: ErrorLogParams): Promise<void> {
  const { message, stack, route, userId, severity, metadata } = params;

  // Truncate stack trace to 2,000 characters
  const truncatedStack = stack ? stack.slice(0, MAX_STACK_LENGTH) : undefined;

  // ── Console output (VPS captures to log file) ─────────────────────────────
  const logLine = `[${severity}] ${new Date().toISOString()} | ${route ?? 'unknown'} | ${userId ?? 'anon'} | ${message}`;
  if (severity === 'ERROR') {
    console.error(logLine, truncatedStack ?? '');
  } else if (severity === 'WARNING') {
    console.warn(logLine);
  } else {
    console.log(logLine);
  }

  // ── Supabase audit_log write ──────────────────────────────────────────────
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      // Can't write to DB — console already logged above
      return;
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    await adminClient.from('audit_log').insert({
      user_id: userId ?? null,
      severity,
      message,
      stack: truncatedStack ?? null,
      route: route ?? null,
      metadata: metadata ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silently swallow — we already logged to console
    // Do NOT re-throw or recurse
  }
}

/**
 * Convenience wrapper for error-level logging with stack trace from Error objects.
 */
export async function logException(
  err: unknown,
  context: { route?: string; userId?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  await logError({
    message,
    stack,
    route: context.route,
    userId: context.userId,
    severity: 'ERROR',
    metadata: context.metadata,
  });
}
