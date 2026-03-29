"use client";
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, FileText, CreditCard, Brain, ArrowRight, Gift, Sparkles } from 'lucide-react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { FileObject } from '@supabase/storage-js';
import strings, { t } from '@/lib/i18n';
import Link from 'next/link';
import TrainingStatusBar from '@/components/TrainingStatusBar';

export default function DashboardContent() {
    const { loading, user } = useGlobal();
    const { locale } = useLanguage();
    const [fileCount, setFileCount] = useState(0);
    const [filesLoading, setFilesLoading] = useState(true);

    useEffect(() => {
        if (user?.id) loadFileCount();
    }, [user]);

    const loadFileCount = async () => {
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
    };

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
        <div className="space-y-6 p-6">
            {/* Personalized Time-Based Greeting */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
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

            {/* First-Time User CTA */}
            {isFirstTime && (
                <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-6">
                            {/* Demo Offer */}
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                    <Gift className="h-4 w-4" />
                                    {t(strings.dashboard.freeOrders, locale)}
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {locale === 'kn'
                                        ? 'ಮೊದಲು ಪ್ರಯತ್ನಿಸಿ — ಅಪ್\u200Cಲೋಡ್ ಇಲ್ಲದೆ!'
                                        : 'Try it first — no upload needed!'}
                                </p>
                                <Link
                                    href="/app/generate"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    {t(strings.dashboard.tryDemo, locale)}
                                </Link>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-sm text-gray-400">{t(strings.dashboard.orSeparator, locale)}</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Training CTA */}
                            <div className="space-y-3">
                                <p className="text-gray-700 font-medium">
                                    {t(strings.dashboard.showYourOrders, locale)}
                                </p>
                                <Link
                                    href="/app/train"
                                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                                >
                                    <Brain className="h-5 w-5" />
                                    {t(strings.dashboard.startTraining, locale)}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
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
                    <CardTitle>{t(strings.dashboard.quickActions, locale)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link
                            href="/app/generate"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-primary-50 transition-colors border-primary-200"
                        >
                            <div className="p-2 bg-primary-50 rounded-full">
                                <FileText className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">{t(strings.nav.generateOrder, locale)}</h3>
                            </div>
                        </Link>

                        <Link
                            href="/app/train"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-orange-50 rounded-full">
                                <Brain className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">{t(strings.nav.trainAI, locale)}</h3>
                            </div>
                        </Link>

                        <Link
                            href="/app/billing"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-green-50 rounded-full">
                                <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">{t(strings.nav.billing, locale)}</h3>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
