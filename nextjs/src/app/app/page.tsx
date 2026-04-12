"use client";
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, FileText, CreditCard, Brain, ArrowRight, Gift, Sparkles, Zap } from 'lucide-react';
import { createSPASassClientAuthenticated as createSPASassClient, createSPAClient } from '@/lib/supabase/client';
import { FileObject } from '@supabase/storage-js';
import strings, { t } from '@/lib/i18n';
import Link from 'next/link';
import TrainingStatusBar from '@/components/TrainingStatusBar';

export default function DashboardContent() {
    const { loading, user } = useGlobal();
    const { locale } = useLanguage();
    const [fileCount, setFileCount] = useState(0);
    const [filesLoading, setFilesLoading] = useState(true);
    const [refCount, setRefCount] = useState<number | null>(null);
    const [refLoading, setRefLoading] = useState(true);

    useEffect(() => {
        async function loadFileCount() {
            try {
                const supabase = await createSPASassClient();
                const { data } = await supabase.getFiles(user!.id);
                const orderFiles = (data || []).filter((f: FileObject) => {
                    const ext = f.name.split('.').pop()?.toLowerCase();
                    return ['docx', 'pdf', 'doc', 'jpg', 'png'].includes(ext || '');
                });
                setFileCount(orderFiles.length);
            } catch {
                // silent fail
            } finally {
                setFilesLoading(false);
            }
        }
        if (user?.id) loadFileCount();
    }, [user?.id]);

    useEffect(() => {
        async function loadRefs() {
            const client = createSPAClient();
            const { count } = await client
                .from('references')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user!.id);
            setRefCount(count ?? 0);
            setRefLoading(false);
        }
        if (user?.id) loadRefs();
    }, [user?.id]);

    const getDaysSinceRegistration = () => {
        if (!user?.registered_at) return 0;
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - user.registered_at.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const daysSinceRegistration = getDaysSinceRegistration();
    const creditsRemaining = user?.credits_remaining ?? 0;
    const ordersGenerated = user?.total_orders_generated ?? 0;
    const isFirstTime = fileCount === 0 && !filesLoading && ordersGenerated === 0;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Personalized Time-Based Greeting */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        {(() => {
                            const hour = new Date().getHours();
                            const greeting = locale === 'kn'
                                ? (hour < 12 ? 'ಶುಭೋದಯ' : hour < 16 ? 'ಶುಭ ಮಧ್ಯಾಹ್ನ' : 'ಶುಭ ಸಂಜೆ')
                                : (hour < 12 ? 'Good morning' : hour < 16 ? 'Good afternoon' : 'Good evening');
                            const name = user?.email?.split('@')[0] || '';
                            return `${greeting}, ${name} `;
                        })()}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {daysSinceRegistration} {t(strings.dashboard.memberFor, locale)}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* First-Time User CTA — shown FIRST so Demo is the clear primary action */}
            {isFirstTime && (
            <React.Fragment>
                <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
                    <CardContent className="pt-6 pb-6">
                        {/* Free orders badge */}
                        <div className="text-center mb-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                <Gift className="h-3.5 w-3.5" />
                                {t(strings.dashboard.freeOrders, locale)}
                            </div>
                        </div>

                        {/* Step indicators — Step 1 highlighted, 2 & 3 dimmed */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {[
                                { n: '1', label: locale === 'kn' ? 'ಡೆಮೋ ನೋಡಿ' : 'Try Demo', active: true },
                                { n: '2', label: locale === 'kn' ? 'AI ತರಬೇತಿ' : 'Train AI', active: false },
                                { n: '3', label: locale === 'kn' ? 'ಆದೇಶ ತಯಾರಿಸಿ' : 'Generate', active: false },
                            ].map((step, i) => (
                                <React.Fragment key={step.n}>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                            step.active
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                        }`}>{step.n}</span>
                                        <span className={`text-xs font-medium ${step.active ? 'text-primary-700' : 'text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {i < 2 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Step 1 — Demo (primary, large) */}
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 py-10 px-6 text-white mb-4 text-center shadow-lg">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white mb-4">
                                <span>👆</span>
                                <span>{locale === 'kn' ? 'ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸಿ' : 'Start here'}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Sparkles className="h-6 w-6 text-blue-200" />
                                <p className="font-black text-3xl tracking-tight">
                                    {locale === 'kn' ? 'ನಿಮ್ಮ ಮೊದಲ ಆದೇಶ ರಚಿಸಿ' : 'Generate Your First Order'}
                                </p>
                            </div>
                            <p className="text-sm text-blue-100 mb-1">
                                {locale === 'kn' ? 'AI ಕ್ಷಣಗಳಲ್ಲಿ ಆದೇಶ ಹೇಗೆ ತಯಾರಿಸುತ್ತದೆ ಎಂದು ನೋಡಿ' : 'See how AI drafts a full order in seconds'}
                            </p>
                            <p className="text-xs text-blue-200/80 mb-1">
                                {locale === 'kn' ? '📎 ಅಪ್‌ಲೋಡ್ ಅಗತ್ಯವಿಲ್ಲ' : '📎 No upload needed'}
                            </p>
                            <p className="text-xs text-blue-100/70 italic mb-6">
                                {locale === 'kn'
                                    ? 'ಗಂಟೆಗಳಲ್ಲ — 2 ನಿಮಿಷದಲ್ಲಿ ಸಂಪೂರ್ಣ ಆದೇಶ ತಯಾರಾಗುತ್ತದೆ'
                                    : 'Draft complete orders in under 2 minutes — not hours'}
                            </p>
                            {/* Trust signals */}
                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mb-6 text-[11px] text-blue-100">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-blue-300 font-bold">✓</span>
                                    {locale === 'kn' ? '576 ನೈಜ DDLR ಆದೇಶಗಳ ಆಧಾರ' : 'Based on 576 real DDLR orders'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="text-blue-300 font-bold">✓</span>
                                    {locale === 'kn' ? 'ಅಧಿಕೃತ ಕರ್ನಾಟಕ ಸ್ವರೂಪ' : 'Matches official Karnataka format'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="text-blue-300 font-bold">✓</span>
                                    {locale === 'kn' ? 'ಕಂದಾಯ ಅಧಿಕಾರಿಗಳು ಬಳಸುತ್ತಾರೆ' : 'Used by revenue officers daily'}
                                </span>
                            </div>

                            <Link
                                href="/app/generate"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl text-base font-bold shadow-md hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all duration-150"
                            >
                                {t(strings.dashboard.tryDemo, locale)}
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        {/* Step 2 — Training (secondary, compact) */}
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <div className="p-1.5 bg-orange-50 rounded-lg flex-shrink-0">
                                <Brain className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-700">
                                    {locale === 'kn' ? 'ನಿಮ್ಮದಾಗಿ ಮಾಡಿ (ನಂತರ)' : 'Make it yours — after the demo'}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                    {locale === 'kn'
                                        ? 'ನಿಮ್ಮ ಹಳೆಯ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ → AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ'
                                        : 'Upload past orders → AI learns your exact writing style'}
                                </p>
                            </div>
                            <Link
                                href="/app/my-references"
                                className="flex-shrink-0 px-3 py-1.5 border border-orange-300 text-orange-700 rounded-lg text-xs font-semibold bg-white hover:bg-orange-50 transition-colors"
                            >
                                {locale === 'kn' ? 'ಅಪ್‌ಲೋಡ್' : 'Upload'}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Example Output — Paper document preview card */}
                <Card className="border border-gray-200 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                <span>📄</span>
                                {locale === 'kn' ? 'ಅಧಿಕೃತ ಆದೇಶ ಪೂರ್ವವೀಕ್ಷಣೆ' : 'Official Order Preview'}
                            </CardTitle>
                            <span className="text-[11px] text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                {locale === 'kn' ? 'AI ರಚಿಸಿದ ಮಾದರಿ' : 'AI-generated sample'}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5">
                        {/* Paper document */}
                        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                            {/* Top accent strip — navy */}
                            <div className="h-1 bg-gradient-to-r from-[#1A237E] via-[#1A237E]/50 to-transparent" />
                            {/* Document body */}
                            <div
                                className="px-8 py-6 text-gray-900"
                                style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif", lineHeight: '1.95' }}
                            >
                                {/* Centered header */}
                                <div className="text-center mb-4 space-y-0.5">
                                    <p className="text-[13px] font-bold tracking-wide">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
                                    <p className="text-[12px] font-semibold text-gray-700">
                                        ಜಿಲ್ಲಾಧಿಕಾರಿಗಳ ಕಚೇರಿ, ಬೆಂಗಳೂರು ನಗರ ಜಿಲ್ಲೆ
                                    </p>
                                </div>
                                {/* Ref line */}
                                <div className="flex justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-2 pb-3">
                                    <span>ಸಂ: ಭೂ.ಉ.ನಿ/ಅಪೀಲು/17/2025-26</span>
                                    <span>ದಿನಾಂಕ: 11-04-2026</span>
                                </div>
                                {/* Parties */}
                                <div className="text-[12px] space-y-1 mb-3">
                                    <p>
                                        <span className="font-semibold">ಮೇಲ್ಮನವಿದಾರರು:</span>{' '}
                                        ರಾಮಯ್ಯ ಬಿನ್ ಕೃಷ್ಣಪ್ಪ, ಹೆಸರಘಟ್ಟ ಗ್ರಾಮ
                                    </p>
                                    <p>
                                        <span className="font-semibold">ಎದುರುದಾರರು:</span>{' '}
                                        ತಹಸೀಲ್ದಾರರು, ಯಲಹಂಕ ತಾಲ್ಲೂಕು
                                    </p>
                                </div>
                                {/* Order heading */}
                                <p className="text-center text-[14px] font-extrabold underline underline-offset-2 mb-4 tracking-wide">
                                    ಆದೇಶ
                                </p>
                                {/* Body — paragraph 1 */}
                                <p className="text-[12px] text-gray-700 leading-[1.95] mb-2.5">
                                    ಮೇಲ್ಮನವಿದಾರರ ಮನವಿ ಪರಿಶೀಲಿಸಲಾಗಿ, ಕರ್ನಾಟಕ ಭೂ ಕಂದಾಯ ಅಧಿನಿಯಮ
                                    1964ರ ಕಲಂ 49(ಎ) ರ ಅಡಿಯಲ್ಲಿ ಎರಡೂ ಕಡೆಯ ವಾದ-ಪ್ರತಿವಾದ ಆಲಿಸಿ
                                    ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಈ ಕೆಳಕಂಡ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.
                                </p>
                                {/* Body — paragraph 2 (longer, more realistic) */}
                                <p className="text-[12px] text-gray-700 leading-[1.95] mb-3">
                                    ಸರ್ವೆ ನಂ: 45/2ರಲ್ಲಿ ಒಟ್ಟು 1 ಎಕರೆ 20 ಗುಂಟೆ ಜಮೀನನ್ನು
                                    ಮೇಲ್ಮನವಿದಾರರ ಹೆಸರಿನಲ್ಲಿ ಪಹಣಿ ನೊಂದಣಿ ಮಾಡಬೇಕೆಂದು
                                    ಕೋರಲಾಗಿದ್ದು, ಹಾಜರಾದ ಸಾಕ್ಷ್ಯ ಹಾಗೂ ಲಿಖಿತ ದಾಖಲೆಗಳ
                                    ಆಧಾರದ ಮೇಲೆ ಮೇಲ್ಮನವಿ ಮಾನ್ಯ ಎನಿಸುತ್ತದೆ.
                                </p>
                                {/* Blurred continuation */}
                                <div className="relative mb-5">
                                    <p className="text-[12px] text-gray-400 leading-[1.95] blur-[2.5px] select-none">
                                        ಆದ್ದರಿಂದ ಎದುರುದಾರರ ಆಕ್ಷೇಪಣೆ ತಿರಸ್ಕರಿಸಿ,
                                        ತಹಸೀಲ್ದಾರರಿಗೆ ಆದೇಶಿಸಲಾಗಿದೆ. ಸದರಿ ಜಮೀನನ್ನು
                                        ಮೇಲ್ಮನವಿದಾರರ ಹೆಸರಿನಲ್ಲಿ ಆರ್.ಟಿ.ಸಿ.ಯಲ್ಲಿ ನಮೂದಿಸಲು
                                        ಸೂಚಿಸಲಾಗಿದೆ.
                                    </p>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
                                </div>
                                {/* Signature block */}
                                <div className="text-right text-[11px] text-gray-600 space-y-0.5 pt-2 border-t border-gray-100">
                                    <p className="font-semibold">ಸಹಿ /-</p>
                                    <p>ಉಪ ವಿಭಾಗಾಧಿಕಾರಿ</p>
                                    <p className="text-gray-500">ಬೆಂಗಳೂರು ನಗರ ಜಿಲ್ಲೆ</p>
                                </div>
                            </div>
                        </div>
                        {/* Caption below the paper */}
                        <p className="text-center text-[11px] text-gray-400 mt-3 leading-relaxed">
                            {locale === 'kn'
                                ? '✦ ನೈಜ ಸರ್ಕಾರಿ ಆದೇಶ ಸ್ವರೂಪದ ಆಧಾರದ ಮೇಲೆ ಪೂರ್ವವೀಕ್ಷಣೆ'
                                : '✦ Preview based on real government order format'}
                        </p>
                        <p className="text-center text-[11px] text-green-600 font-medium mt-1.5">
                            {locale === 'kn'
                                ? '✓ ನಿಜ ತಾಲ್ಲೂಕು ಮತ್ತು ಕಂದಾಯ ಕಚೇರಿ ಕೆಲಸಕ್ಕಾಗಿ ವಿನ್ಯಾಸ'
                                : '✓ Designed for real Taluk & Revenue office workflows'}
                        </p>
                    </CardContent>
                </Card>
            </React.Fragment>
            )}

            {/* AI Training Status Card — shown BELOW demo CTA, hidden for brand-new users */}
            {!refLoading && refCount !== null && (!isFirstTime || refCount >= 5) && (
                <Card className={refCount >= 5 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-full flex-shrink-0 ${refCount >= 5 ? 'bg-green-100' : 'bg-amber-100'}`}>
                                    <Brain className={`h-5 w-5 ${refCount >= 5 ? 'text-green-600' : 'text-amber-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${refCount >= 5 ? 'text-green-800' : 'text-amber-800'}`}>
                                        {refCount >= 5
                                            ? (locale === 'kn' ? 'AI ತಯಾರಾಗಿದೆ ✓' : 'AI Ready ✓')
                                            : (locale === 'kn' ? 'AI ತರಬೇತಿ ಅಗತ್ಯವಿದೆ' : 'AI Training Required')}
                                    </p>
                                    {refCount < 5 && (
                                        <div className="mt-1.5 space-y-2">
                                            <div className="flex justify-between text-xs text-amber-700">
                                                <span>{locale === 'kn' ? 'ಪ್ರಗತಿ' : 'Progress'}</span>
                                                <span>{refCount} / 5</span>
                                            </div>
                                            <div className="w-full bg-amber-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (refCount / 5) * 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-amber-700 italic">
                                                {locale === 'kn'
                                                    ? 'AI ಈ ದಾಖಲೆಗಳಿಂದ ನಿಮ್ಮ ಬರವಣಿಗೆ ಶೈಲಿಯನ್ನು ಕಲಿಯುತ್ತದೆ'
                                                    : 'AI learns your writing style from these documents'}
                                            </p>
                                        </div>
                                    )}
                                    {refCount >= 5 && (
                                        <p className="text-xs text-green-700 mt-0.5">
                                            {locale === 'kn'
                                                ? `${refCount} ಉಲ್ಲೇಖ ಆದೇಶಗಳು ಅಪ್\u200Cಲೋಡ್ ಆಗಿದೆ`
                                                : `${refCount} reference orders uploaded`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {refCount < 5 && (
                                <Link
                                    href="/app/my-references"
                                    className="flex-shrink-0 px-3 py-2 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                                >
                                    {locale === 'kn' ? 'ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ →' : 'Upload Now →'}
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600">{ordersGenerated}</div>
                            <p className="text-sm text-gray-600 mt-1">{t(strings.dashboard.ordersGenerated, locale)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${
                                creditsRemaining >= 5 ? 'credit-green' :
                                creditsRemaining >= 2 ? 'credit-yellow' :
                                'credit-red'
                            }`}>
                                {creditsRemaining}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{t(strings.dashboard.creditsLeft, locale)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                ≈ {creditsRemaining} {locale === 'kn' ? 'ಆದೇಶಗಳಿಗೆ ಸಾಕು' : 'orders remaining'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                {filesLoading ? '...' : fileCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{t(strings.dashboard.filesUploaded, locale)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Credit Warning */}
            {creditsRemaining <= 0 && !isFirstTime && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-700">
                            <p className="font-medium">
                                {locale === 'kn' ? 'ಕ್ರೆಡಿಟ್\u200Cಗಳು ಖಾಲಿಯಾಗಿವೆ!' : 'Credits exhausted!'}
                            </p>
                            <p className="text-sm mt-1">
                                {locale === 'kn' ? 'ಆದೇಶ ರಚಿಸಲು ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ.' : 'Please recharge to generate orders.'}
                            </p>
                            <Link href="/app/billing" className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                                {t(strings.dashboard.recharge, locale)}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Training Status (only if files exist) */}
            {fileCount > 0 && (
                <TrainingStatusBar fileCount={fileCount} />
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">{t(strings.dashboard.quickActions, locale)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* New Pipeline CTA — primary action */}
                        <Link
                            href={!refLoading && refCount !== null && refCount < 5 ? '/app/my-references' : '/app/pipeline'}
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors md:col-span-3 ${
                                !refLoading && refCount !== null && refCount < 5
                                    ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                                    : 'hover:bg-primary-50 border-primary-500 bg-primary-50'
                            }`}
                        >
                            <div className={`p-2 rounded-full ${!refLoading && refCount !== null && refCount < 5 ? 'bg-gray-300' : 'bg-primary-600'}`}>
                                <Zap className={`h-5 w-5 ${!refLoading && refCount !== null && refCount < 5 ? 'text-gray-500' : 'text-white'}`} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${!refLoading && refCount !== null && refCount < 5 ? 'text-gray-500' : 'text-primary-700'}`} style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}>
                                    {locale === 'kn' ? 'ಹೊಸ ಆದೇಶ ತಯಾರಿಸಿ →' : 'Generate New Order (PDF Upload) →'}
                                </h3>
                                <p className={`text-xs mt-0.5 ${!refLoading && refCount !== null && refCount < 5 ? 'text-gray-400' : 'text-primary-600'}`}>
                                    {!refLoading && refCount !== null && refCount < 5
                                        ? (locale === 'kn' ? `ಮೊದಲು ${refCount}/5 ಉಲ್ಲೇಖಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ` : `Upload ${refCount}/5 references first`)
                                        : (locale === 'kn' ? 'PDF ಅಪ್\u200Cಲೋಡ್ → AI ಓದುವಿಕೆ → ಆದೇಶ → ಡೌನ್\u200Cಲೋಡ್' : 'Upload PDF → AI reads → Generate order → Download .docx')}
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/app/generate"
                            className="flex items-center gap-3 p-4 border border-blue-100 rounded-xl bg-blue-50/50 hover:bg-blue-50 hover:scale-[1.02] transition-all duration-150"
                        >
                            <div className="p-2.5 bg-blue-100 rounded-xl">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-800">{t(strings.nav.generateOrder, locale)}</h3>
                            </div>
                        </Link>

                        <Link
                            href="/app/train"
                            className="flex items-center gap-3 p-4 border border-orange-100 rounded-xl bg-orange-50/50 hover:bg-orange-50 hover:scale-[1.02] transition-all duration-150"
                        >
                            <div className="p-2.5 bg-orange-100 rounded-xl">
                                <Brain className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-800">{t(strings.nav.trainAI, locale)}</h3>
                            </div>
                        </Link>

                        <Link
                            href="/app/billing"
                            className="flex items-center gap-3 p-4 border border-green-100 rounded-xl bg-green-50/50 hover:bg-green-50 hover:scale-[1.02] transition-all duration-150"
                        >
                            <div className="p-2.5 bg-green-100 rounded-xl">
                                <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-800">{t(strings.nav.billing, locale)}</h3>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
