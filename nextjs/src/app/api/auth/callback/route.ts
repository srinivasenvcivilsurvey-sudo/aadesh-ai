// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSSRSassClient } from "@/lib/supabase/server";

// FIX: 2026-03-30 — Build redirect URL from Host header, not request.url
// In standalone mode behind Nginx, request.url uses 0.0.0.0:3000 which is unreachable externally
function getOrigin(request: Request): string {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    if (host) return `${proto}://${host}`;
    return new URL(request.url).origin;
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = getOrigin(request);

    if (code) {
        const supabase = await createSSRSassClient()
        const client = supabase.getSupabaseClient()

        // Exchange the code for a session
        await supabase.exchangeCodeForSession(code)

        // Check MFA status — skip if error (non-MFA users throw here)
        const { data: aal, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel()

        // If user needs to complete MFA verification (and check succeeded)
        if (!aalError && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
            return NextResponse.redirect(new URL('/auth/2fa', origin))
        }

        // All other cases (no MFA, MFA verified, or MFA check failed): go to app
        return NextResponse.redirect(new URL('/app', origin))
    }

    // If no code provided, redirect to login
    return NextResponse.redirect(new URL('/auth/login', origin))
}