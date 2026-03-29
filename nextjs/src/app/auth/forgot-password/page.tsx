'use client';

import { useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.getSupabaseClient().auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ / Check your email
                    </h2>

                    <p className="text-gray-600 mb-8">
                        ಪಾಸ್{'\u200C'}ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ನಿಮ್ಮ ಇಮೇಲ್{'\u200C'}ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.
                        ದಯವಿಟ್ಟು ಇಮೇಲ್ ತೆರೆದು ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ.
                    </p>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                            ← ಲಾಗಿನ್ ಪುಟಕ್ಕೆ / Return to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    ಪಾಸ್{'\u200C'}ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ / Reset your password
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        ಇಮೇಲ್ / Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ, ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ.
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ / Send reset link'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">ಪಾಸ್{'\u200C'}ವರ್ಡ್ ನೆನಪಿದೆಯೇ?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    ಲಾಗಿನ್ / Sign in
                </Link>
            </div>
        </div>
    );
}