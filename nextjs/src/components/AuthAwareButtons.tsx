"use client";
import { useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { useLanguage } from '@/lib/context/LanguageContext';

export default function AuthAwareButtons({ variant = 'primary' }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    let locale: 'kn' | 'en' = 'kn';
    try {
        const lang = useLanguage();
        locale = lang.locale;
    } catch {
        // LanguageProvider not available (e.g. outside provider)
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const supabase = await createSPASassClient();
                const { data: { user } } = await supabase.getSupabaseClient().auth.getUser();
                setIsAuthenticated(!!user);
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) return null;

    // Navigation buttons for the header
    if (variant === 'nav') {
        return isAuthenticated ? (
            <Link
                href="/app"
                className="bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
                {locale === 'kn' ? 'ಡ್ಯಾಶ್\u200Cಬೋರ್ಡ್' : 'Dashboard'}
            </Link>
        ) : (
            <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    {locale === 'kn' ? 'ಲಾಗಿನ್' : 'Login'}
                </Link>
                <Link
                    href="/auth/register"
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                    {locale === 'kn' ? 'ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ' : 'Try Free'}
                </Link>
            </>
        );
    }

    // Primary buttons for the hero section — BIG green CTA
    return isAuthenticated ? (
        <Link
            href="/app"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-green-600 text-white text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            style={{ minHeight: '56px' }}
        >
            {locale === 'kn' ? 'ಡ್ಯಾಶ್\u200Cಬೋರ್ಡ್\u200Cಗೆ ಹೋಗಿ' : 'Go to Dashboard'}
            <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
    ) : (
        <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
                <Link
                    href="/auth/register"
                    className="inline-flex items-center px-8 py-4 rounded-xl bg-green-600 text-white text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                    style={{ minHeight: '56px' }}
                >
                    {locale === 'kn' ? 'ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ' : 'Try for Free'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                    href="#features"
                    className="inline-flex items-center px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    style={{ minHeight: '56px' }}
                >
                    {locale === 'kn' ? 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ' : 'Learn More'}
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
            <p className="text-sm text-gray-400">
                {locale === 'kn' ? 'ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ' : 'No credit card required'}
            </p>
        </div>
    );
}
