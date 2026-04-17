"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home, User, Menu, X, ChevronDown, LogOut,
    Key, Files, FileText, CreditCard, Upload, Brain, Globe, Zap,
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { createSPASassClient, createSPAClient } from "@/lib/supabase/client";
import strings, { t } from '@/lib/i18n';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useGlobal();
    const { locale, toggleLocale } = useLanguage();
    const [credits, setCredits] = useState<number | null>(null);

    // Reset scroll to top on every navigation
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // Fetch credit balance
    useEffect(() => {
        if (!user) return;
        async function fetchCredits() {
            try {
                const supabase = createSPAClient();
                const { data } = await supabase
                    .from('profiles')
                    .select('credits_remaining')
                    .eq('id', user!.id)
                    .single();
                const row = data as { credits_remaining: number } | null;
                setCredits(row?.credits_remaining ?? null);
            } catch { /* silent */ }
        }
        fetchCredits();
    }, [user, pathname]); // refresh on each page nav so post-export count updates

    const handleLogout = async () => {
        try {
            const client = await createSPASassClient();
            await client.logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleChangePassword = async () => {
        router.push('/app/user-settings');
    };

    const getInitials = (email: string) => {
        const parts = email.split('@')[0].split(/[._-]/);
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    };

    const navigation = [
        { name: t(strings.nav.dashboard, locale), href: '/app', icon: Home },
        { name: t(strings.nav.trainAI, locale), href: '/app/my-references', icon: Brain },
        { name: t(strings.nav.generateOrder, locale), href: '/app/generate', icon: FileText },
        { name: t(strings.nav.myOrders, locale), href: '/app/my-orders', icon: Files },
        { name: t(strings.nav.myFiles, locale), href: '/app/storage', icon: Upload },
        { name: t(strings.nav.billing, locale), href: '/app/billing', icon: CreditCard },
        { name: t(strings.nav.settings, locale), href: '/app/user-settings', icon: User },
    ];

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-[#FFF7F0]">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-[#1A237E] border-r border-white/10 shadow-xl transform transition-transform duration-200 ease-in-out z-30
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                {/* Logo section */}
                <div className="h-[72px] flex items-center justify-between px-5 border-b border-white/10">
                    <div className="flex flex-col leading-tight">
                        <span className="text-[22px] font-black text-white tracking-wide">Aadesh AI</span>
                        <span className="text-[10px] font-semibold text-[#E97B3B] tracking-[0.15em] uppercase">ಆದೇಶ AI</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-white/70 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 pr-2 space-y-0.5 pb-32">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center py-2.5 text-sm transition-colors ${
                                    isActive
                                        ? 'pl-3 pr-3 rounded-r-xl border-l-4 border-[#E97B3B] bg-white/10 text-white font-semibold'
                                        : 'px-3 rounded-lg text-white/70 hover:bg-white/8 hover:text-white font-medium'
                                }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                        isActive ? 'text-[#E97B3B]' : 'text-white/45 group-hover:text-white/65'
                                    }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar bottom — user info + logout + language */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#151c6b]">
                    {/* User identity row */}
                    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                        <div className="w-8 h-8 rounded-full bg-[#E97B3B]/25 border border-[#E97B3B]/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#E97B3B] text-xs font-bold">
                                {user ? getInitials(user.email) : '??'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-semibold truncate leading-tight">
                                {user?.email?.split('@')[0] || '—'}
                            </p>
                            <p className="text-white/40 text-[10px] truncate leading-tight">
                                {user?.email || ''}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="flex-shrink-0 p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Language toggle */}
                    <div className="px-4 pb-3">
                        <button
                            onClick={toggleLocale}
                            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 hover:bg-white/10 transition-colors"
                        >
                            <Globe className="h-3.5 w-3.5 text-white/40" />
                            <span className={locale === 'en' ? 'font-bold text-white' : 'text-white/40'}>EN</span>
                            <span className="text-white/25">|</span>
                            <span className={locale === 'kn' ? 'font-bold text-white' : 'text-white/40'}>ಕನ್ನಡ</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:pl-64">
                {/* Gov gradient header (Arcada P0 sprint, 2026-04-17) */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between h-[72px] border-b-[3px] shadow-md px-6"
                    style={{
                        background: 'var(--color-gov-header-gradient, linear-gradient(135deg, #1a3a6b 0%, #1a6b3c 100%))',
                        borderColor: 'var(--color-gov-gold, #c9a84c)',
                    }}
                >
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-white/80 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Shield + OFFICIAL USE ONLY badge (desktop) */}
                    <div className="hidden lg:flex items-center gap-2 mr-4">
                        <span className="text-white text-lg" aria-hidden>🛡️</span>
                        <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase whitespace-nowrap">
                            Official Use Only
                        </span>
                    </div>

                    {/* Language toggle in header (visible on desktop) */}
                    <div className="hidden lg:flex items-center">
                        <button
                            onClick={toggleLocale}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                        >
                            <Globe className="h-3.5 w-3.5 text-white/70" />
                            <span className={locale === 'en' ? 'font-bold text-white' : 'text-white/60'}>EN</span>
                            <span className="text-white/30">|</span>
                            <span className={locale === 'kn' ? 'font-bold text-white' : 'text-white/60'}>ಕನ್ನಡ</span>
                        </button>
                    </div>

                    {/* Credits badge */}
                    {credits !== null && (
                        <Link
                            href="/app/billing"
                            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ml-3 ${
                                credits === 0
                                    ? 'bg-red-500/20 border-red-300 text-red-200 hover:bg-red-500/30'
                                    : credits <= 2
                                    ? 'bg-orange-400/20 border-orange-300 text-orange-200 hover:bg-orange-400/30'
                                    : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                            }`}
                        >
                            <Zap className="h-3.5 w-3.5" />
                            {credits === 0
                                ? (locale === 'kn' ? 'ರೀಚಾರ್ಜ್' : 'Recharge')
                                : `${credits} ${locale === 'kn' ? 'ಕ್ರೆಡಿಟ್' : 'credits'}`
                            }
                        </Link>
                    )}

                    <div className="relative ml-auto">
                        <button
                            onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                            className="flex items-center space-x-2 text-sm text-white hover:text-white/80"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user ? getInitials(user.email) : '??'}
                                </span>
                            </div>
                            <span className="hidden sm:inline">{user?.email || t(strings.common.loading, locale)}</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-50">
                                <div className="p-2 border-b border-gray-100">
                                    <p className="text-xs text-gray-500">{t(strings.nav.signedInAs, locale)}</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            handleChangePassword();
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <Key className="mr-3 h-4 w-4 text-gray-400" />
                                        {t(strings.nav.changePassword, locale)}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setUserDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="mr-3 h-4 w-4 text-red-400" />
                                        {t(strings.nav.signOut, locale)}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <main className="p-5 pb-24 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation — always visible on phones */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
                <div className="flex justify-around items-center h-16">
                    {[
                        { href: '/app', icon: Home, label: locale === 'kn' ? 'ಮುಖಪುಟ' : 'Home' },
                        { href: '/app/generate', icon: FileText, label: locale === 'kn' ? 'ರಚಿಸಿ' : 'Generate' },
                        { href: '/app/my-orders', icon: Files, label: locale === 'kn' ? 'ಆದೇಶಗಳು' : 'Orders' },
                        { href: '/app/billing', icon: CreditCard, label: locale === 'kn' ? 'ಕ್ರೆಡಿಟ್' : 'Credits' },
                    ].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                                    isActive
                                        ? 'text-primary-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
                                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
