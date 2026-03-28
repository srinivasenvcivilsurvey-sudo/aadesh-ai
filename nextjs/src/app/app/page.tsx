"use client";
import React from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, FileText, Upload, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardContent() {
    const { loading, user } = useGlobal();

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

    return (
        <div className="space-y-6 p-6">
            {/* Welcome Card */}
            <Card>
                <CardHeader>
                    <CardTitle>ಸ್ವಾಗತ, {user?.email?.split('@')[0]}! 🙏</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {daysSinceRegistration} ದಿನಗಳಿಂದ ಸದಸ್ಯ
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600">0</div>
                            <p className="text-sm text-gray-600 mt-1">ರಚಿಸಲಾದ ಆದೇಶಗಳು</p>
                            <p className="text-xs text-gray-400">Orders Generated</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">0</div>
                            <p className="text-sm text-gray-600 mt-1">ಉಳಿದ ಕ್ರೆಡಿಟ್‌ಗಳು</p>
                            <p className="text-xs text-gray-400">Credits Remaining</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">0</div>
                            <p className="text-sm text-gray-600 mt-1">ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್‌ಗಳು</p>
                            <p className="text-xs text-gray-400">Files Uploaded</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>ತ್ವರಿತ ಕ್ರಿಯೆಗಳು</CardTitle>
                    <CardDescription>Quick Actions</CardDescription>
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
                                <h3 className="font-medium">ಆದೇಶ ರಚಿಸಿ</h3>
                                <p className="text-sm text-gray-500">Generate Order</p>
                            </div>
                        </Link>

                        <Link
                            href="/app/storage"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-orange-50 rounded-full">
                                <Upload className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</h3>
                                <p className="text-sm text-gray-500">Upload Files</p>
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
                                <h3 className="font-medium">ರೀಚಾರ್ಜ್ ಮಾಡಿ</h3>
                                <p className="text-sm text-gray-500">Buy Credits</p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
