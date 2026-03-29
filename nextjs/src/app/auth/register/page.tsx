'use client';

import { createSPASassClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from "@/components/SSOButtons";
import { Loader2 } from 'lucide-react';

function kannadaError(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('already registered') || lower.includes('already been registered'))
        return 'ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಲಾಗಿನ್ ಮಾಡಿ.';
    if (lower.includes('password') && lower.includes('short'))
        return 'ಪಾಸ್\u200Cವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು';
    if (lower.includes('network') || lower.includes('fetch'))
        return 'ನೆಟ್\u200Cವರ್ಕ್ ಸಮಸ್ಯೆ — ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ';
    if (lower.includes('rate limit'))
        return 'ಹಲವು ಪ್ರಯತ್ನಗಳು. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.';
    return 'ಖಾತೆ ರಚಿಸಲು ವಿಫಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.';
}

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptedTerms) {
            setError('ನಿಯಮ ಮತ್ತು ಗೌಪ್ಯತಾ ನೀತಿಗೆ ಒಪ್ಪಿಗೆ ನೀಡಿ');
            return;
        }
        if (password !== confirmPassword) {
            setError('ಪಾಸ್\u200Cವರ್ಡ್\u200Cಗಳು ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ');
            return;
        }

        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.registerEmail(email, password);
            if (error) throw error;
            router.push('/auth/verify-email');
        } catch (err: Error | unknown) {
            setError(kannadaError(err instanceof Error ? err.message : 'unknown'));
        } finally {
            setLoading(false);
        }
    };

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
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        ಪಾಸ್{'\u200C'}ವರ್ಡ್ ದೃಢೀಕರಿಸಿ / Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                </div>

                <div className="flex items-start">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                        <Link href="/legal/terms" className="font-medium text-primary-600 hover:text-primary-500" target="_blank">
                            ನಿಯಮಗಳು
                        </Link>{' '}
                        ಮತ್ತು{' '}
                        <Link href="/legal/privacy" className="font-medium text-primary-600 hover:text-primary-500" target="_blank">
                            ಗೌಪ್ಯತಾ ನೀತಿ
                        </Link>
                        ಗೆ ಒಪ್ಪಿಗೆ
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-green-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...</>
                    ) : (
                        'ಉಚಿತ ಖಾತೆ ರಚಿಸಿ / Create Free Account'
                    )}
                </button>
            </form>

            <SSOButtons onError={(msg: string) => setError(kannadaError(msg))} />

            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?</span>{' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    ಲಾಗಿನ್ / Sign in
                </Link>
            </div>
        </div>
    );
}
