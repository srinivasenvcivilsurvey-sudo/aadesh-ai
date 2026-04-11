/**
 * Helper to get the current Supabase session token for authenticated API calls.
 * Used by pipeline components to pass Bearer token to server routes.
 */

import { createSPAClient } from '@/lib/supabase/client';

/**
 * Returns the current session access token, or null if not authenticated.
 * Redirects to login if session is expired.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createSPAClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      window.location.href = '/auth/login';
      return null;
    }
    return session.access_token;
  } catch {
    return null;
  }
}

/**
 * Returns auth headers for fetch calls, or null if not authenticated.
 */
export async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}
