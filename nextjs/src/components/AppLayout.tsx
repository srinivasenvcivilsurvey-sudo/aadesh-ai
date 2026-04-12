"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home, User, Menu, X, ChevronDown, LogOut,
    Key, Files, FileText, CreditCard, Upload, Brain, Globe,
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { createSPASassClient } from "@/lib/supabase/client";
import strings, { t } from '@/lib/i18n';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useGlobal();
    const { locale, toggleLocale } = useLanguage();

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
        { name: t(strings.nav.trainAI, locale), href: '/app/train', icon: Brain },
        { name: locale === 'kn' ? 'ಉಲ್ಲೇಖ ಆದೇಶಗಳು' : 'My References', href: '/app/my-references', icon: Upload },
        { name: t(strings.nav.generateOrder, locale), href: '/app/generate', icon: FileText },
        { name: t(strings.nav.myOrders, locale), href: '/app/my-orders', icon: Files },
        { name: t(strings.nav.myFiles, locale), href: '/app/storage', icon: Upload },
        { name: t(strings.nav.billing, locale), href: '/app/billing', icon: CreditCard },
        { name: t(strings.nav.settings, locale), href: '/app/user-settings', icon: User },
    ];

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-100">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <span className="text-xl font-semibold text-primary-600">
                        {t(strings.productName, locale)}
                    </span>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    isActive
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${
                                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Language Toggle — bottom of sidebar */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <button
                        onClick={toggleLocale}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className={locale === 'en' ? 'font-bold' : 'text-gray-500'}>EN</span>
                        <span className="text-gray-300">|</span>
                        <span className={locale === 'kn' ? 'font-bold' : 'text-gray-500'}>ಕನ್ನಡ</span>
                    </button>
                </div>
            </div>

            <div className="lg:pl-64">
                <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white shadow-sm px-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Language toggle in header (visible on desktop) */}
                    <div className="hidden lg:flex items-center">
                        <button
                            onClick={toggleLocale}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <Globe className="h-3.5 w-3.5 text-gray-500" />
                            <span className={locale === 'en' ? 'font-bold text-primary-600' : 'text-gray-500'}>EN</span>
                            <span className="text-gray-300">|</span>
                            <span className={locale === 'kn' ? 'font-bold text-primary-600' : 'text-gray-500'}>ಕನ್ನಡ</span>
                        </button>
                    </div>

                    <div className="relative ml-auto">
                        <button
                            onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-medium">
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

                <main className="p-4 pb-24 lg:pb-4">
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
