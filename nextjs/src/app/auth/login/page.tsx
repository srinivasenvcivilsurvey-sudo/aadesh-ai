// src/app/auth/login/page.tsx
'use client';

import { createSPASassClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from '@/components/SSOButtons';
import { Loader2 } from 'lucide-react';

// Map Supabase errors to Kannada
function kannadaError(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('invalid login') || lower.includes('invalid credentials'))
        return 'ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್\u200Cವರ್ಡ್ ತಪ್ಪಾಗಿದೆ';
    if (lower.includes('email not confirmed'))
        return 'ಇಮೇಲ್ ದೃಢೀಕರಿಸಿಲ್ಲ. ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.';
    if (lower.includes('too many requests') || lower.includes('rate limit'))
        return 'ಹಲವು ಪ್ರಯತ್ನಗಳು. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.';
    if (lower.includes('network') || lower.includes('fetch'))
        return 'ನೆಟ್\u200Cವರ್ಕ್ ಸಮಸ್ಯೆ — ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ';
    return 'ಲಾಗಿನ್ ವಿಫಲವಾಯಿತು. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.';
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMFAPrompt, setShowMFAPrompt] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const client = await createSPASassClient();
            const { error: signInError } = await client.loginEmail(email, password);
            if (signInError) throw signInError;

            const supabase = client.getSupabaseClient();
            const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (mfaError) throw mfaError;

            if (mfaData.nextLevel === 'aal2' && mfaData.nextLevel !== mfaData.currentLevel) {
                setShowMFAPrompt(true);
            } else {
                router.push('/app');
                return;
            }
        } catch (err) {
            setError(kannadaError(err instanceof Error ? err.message : 'unknown'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showMFAPrompt) router.push('/auth/2fa');
    }, [showMFAPrompt, router]);

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        ಇಮೇಲ್ / Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        ಪಾಸ್{'\u200C'}ವರ್ಡ್ / Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        ಪಾಸ್{'\u200C'}ವರ್ಡ್ ಮರೆತಿರಾ?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-primary-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...</>
                    ) : (
                        'ಲಾಗಿನ್ / Sign in'
                    )}
                </button>
            </form>

            <SSOButtons onError={(msg: string) => setError(kannadaError(msg))} />

            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">ಖಾತೆ ಇಲ್ಲವೇ?</span>{' '}
                <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
                    ಸೈನ್ ಅಪ್ / Sign up
                </Link>
            </div>
        </div>
    );
}
