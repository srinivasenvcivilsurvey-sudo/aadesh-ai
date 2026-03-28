"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { Key, User, CheckCircle, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { MFASetup } from '@/components/MFASetup';
import strings, { t } from '@/lib/i18n';

export default function UserSettingsPage() {
    const { user } = useGlobal();
    const { locale } = useLanguage();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [transferring, setTransferring] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(locale === 'kn' ? 'ಪಾಸ್\u200Cವರ್ಡ್\u200Cಗಳು ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ' : "Passwords don't match");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setSuccess(locale === 'kn' ? 'ಪಾಸ್\u200Cವರ್ಡ್ ಬದಲಾಯಿಸಲಾಗಿದೆ' : 'Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: Error | unknown) {
            setError(err instanceof Error ? err.message : (locale === 'kn' ? 'ಪಾಸ್\u200Cವರ್ಡ್ ಬದಲಿಸಲು ವಿಫಲ' : 'Failed to update password'));
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        setTransferring(true);
        setError('');
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Mark all references as inactive (archive, don't delete)
            await client
                .from('references' as never)
                .update({ is_active: false } as never)
                .eq('user_id' as never, user!.id as never);

            // Reset training level
            await client
                .from('profiles' as never)
                .update({
                    training_level: 'untrained',
                    training_score: 0,
                    total_references: 0,
                } as never)
                .eq('id' as never, user!.id as never);

            setSuccess(locale === 'kn'
                ? 'ವರ್ಗಾವಣೆ ಯಶಸ್ವಿ! ಹಳೆಯ ಡೇಟಾ ಆರ್ಕೈವ್ ಆಗಿದೆ. ಹೊಸ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ.'
                : 'Transfer complete! Old data archived. Upload new orders.');
            setShowTransferDialog(false);
        } catch {
            setError(locale === 'kn' ? 'ವರ್ಗಾವಣೆ ವಿಫಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Transfer failed. Please try again.');
        } finally {
            setTransferring(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t(strings.nav.settings, locale)}
                </h1>
                <p className="text-muted-foreground">
                    {locale === 'kn' ? 'ನಿಮ್ಮ ಖಾತೆ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳನ್ನು ನಿರ್ವಹಿಸಿ' : 'Manage your account settings'}
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* User Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {locale === 'kn' ? 'ಬಳಕೆದಾರ ವಿವರಗಳು' : 'User Details'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    {locale === 'kn' ? 'ಇಮೇಲ್' : 'Email'}
                                </label>
                                <p className="mt-1 text-sm">{user?.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                {t(strings.nav.changePassword, locale)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                        {locale === 'kn' ? 'ಹೊಸ ಪಾಸ್\u200Cವರ್ಡ್' : 'New Password'}
                                    </label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                        {locale === 'kn' ? 'ಪಾಸ್\u200Cವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : 'Confirm Password'}
                                    </label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {loading
                                        ? (locale === 'kn' ? 'ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'Updating...')
                                        : t(strings.nav.changePassword, locale)}
                                </button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* MFA */}
                    <MFASetup
                        onStatusChange={() => {
                            setSuccess(locale === 'kn' ? '2FA ಸೆಟ್ಟಿಂಗ್\u200Cಗಳು ಬದಲಾಗಿವೆ' : 'Two-factor settings updated');
                        }}
                    />

                    {/* Transfer Mode */}
                    <Card className="border-amber-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700">
                                <ArrowRightLeft className="h-5 w-5" />
                                {t(strings.transfer.iTransferred, locale)}
                            </CardTitle>
                            <CardDescription>
                                {locale === 'kn'
                                    ? 'ಹೊಸ ಕಚೇರಿಗೆ ವರ್ಗಾವಣೆಯಾದರೆ, ಹಳೆಯ ಡೇಟಾ ಆರ್ಕೈವ್ ಮಾಡಿ ಹೊಸ ಆದೇಶಗಳಿಗಾಗಿ AI ಅನ್ನು ಮರು-ತರಬೇತಿ ಮಾಡಿ.'
                                    : 'If transferred to a new office, archive old data and retrain AI for new orders.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <button
                                onClick={() => setShowTransferDialog(true)}
                                className="flex items-center gap-2 px-4 py-2.5 border-2 border-amber-500 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                            >
                                <ArrowRightLeft className="h-4 w-4" />
                                {t(strings.transfer.iTransferred, locale)}
                            </button>
                            <p className="mt-3 text-xs text-gray-500">
                                {locale === 'kn'
                                    ? 'ಡೇಟಾ ಅಳಿಸಲಾಗುವುದಿಲ್ಲ — ಆರ್ಕೈವ್ ಆಗುತ್ತದೆ. ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಕ್ರೆಡಿಟ್\u200Cಗಳು ಹಾಗೇ ಇರುತ್ತವೆ.'
                                    : 'Data is not deleted — only archived. Your account and credits remain.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transfer Confirmation Dialog */}
            <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            {t(strings.transfer.iTransferred, locale)}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left space-y-3">
                            <p>{t(strings.transfer.transferWarning, locale)}</p>
                            <ul className="text-sm space-y-1 text-gray-600">
                                <li>{locale === 'kn' ? '• ಎಲ್ಲಾ ಉಲ್ಲೇಖ ಆದೇಶಗಳು ಆರ್ಕೈವ್ ಆಗುತ್ತವೆ' : '• All reference orders will be archived'}</li>
                                <li>{locale === 'kn' ? '• AI ತರಬೇತಿ ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ' : '• AI training will be reset'}</li>
                                <li>{locale === 'kn' ? '• ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಕ್ರೆಡಿಟ್\u200Cಗಳು ಉಳಿಯುತ್ತವೆ' : '• Your account and credits are preserved'}</li>
                                <li>{locale === 'kn' ? '• ಹೊಸ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ ಮರು-ತರಬೇತಿ ಮಾಡಬೇಕು' : '• Upload new orders to retrain'}</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t(strings.common.cancel, locale)}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleTransfer}
                            disabled={transferring}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {transferring
                                ? (locale === 'kn' ? 'ವರ್ಗಾವಣೆ ಆಗುತ್ತಿದೆ...' : 'Transferring...')
                                : (locale === 'kn' ? 'ಹೌದು, ವರ್ಗಾವಣೆ ಮಾಡಿ' : 'Yes, Transfer')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
