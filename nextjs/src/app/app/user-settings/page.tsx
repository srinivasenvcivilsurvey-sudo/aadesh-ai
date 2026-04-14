"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { Key, User, CheckCircle, ArrowRightLeft, AlertTriangle, Building2 } from 'lucide-react';
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

    // Officer profile fields
    const [officerName, setOfficerName] = useState('');
    const [salutation, setSalutation] = useState('');
    const [designation, setDesignation] = useState('');
    const [districtAndCity, setDistrictAndCity] = useState('');
    const [personalPrompt, setPersonalPrompt] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        const loadOfficerProfile = async () => {
            try {
                const supabase = await createSPASassClient();
                const client = supabase.getSupabaseClient();
                const { data } = await client
                    .from('profiles' as never)
                    .select('officer_name, salutation, designation, district_and_city, personal_prompt')
                    .eq('id' as never, user.id as never)
                    .single();
                if (data) {
                    const p = data as { officer_name?: string; salutation?: string; designation?: string; district_and_city?: string; personal_prompt?: string };
                    setOfficerName(p.officer_name || '');
                    setSalutation(p.salutation || '');
                    setDesignation(p.designation || '');
                    setDistrictAndCity(p.district_and_city || '');
                    setPersonalPrompt(p.personal_prompt || '');
                }
            } catch { /* silent — profile fields optional */ }
        };
        loadOfficerProfile();
    }, [user]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setError('');
        setSuccess('');
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            const { error: updateError } = await client
                .from('profiles' as never)
                .update({
                    officer_name: officerName.trim() || null,
                    salutation: salutation.trim() || null,
                    designation: designation.trim() || null,
                    district_and_city: districtAndCity.trim() || null,
                    personal_prompt: personalPrompt.trim() || null,
                } as never)
                .eq('id' as never, user!.id as never);
            if (updateError) throw updateError;
            setSuccess(locale === 'kn' ? 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಿದೆ' : 'Profile saved successfully');
        } catch (err: Error | unknown) {
            setError(err instanceof Error ? err.message : (locale === 'kn' ? 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಲು ವಿಫಲ' : 'Failed to save profile'));
        } finally {
            setProfileSaving(false);
        }
    };

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

                    {/* Officer Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {locale === 'kn' ? 'ಅಧಿಕಾರಿ ಪ್ರೊಫೈಲ್' : 'Officer Profile'}
                            </CardTitle>
                            <CardDescription>
                                {locale === 'kn'
                                    ? 'AI ಆದೇಶಗಳಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಕಚೇರಿ ವಿವರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಬಳಸುತ್ತದೆ.'
                                    : 'Used automatically in AI-generated orders for your name and office details.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSave} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="salutation" className="block text-sm font-medium text-gray-700">
                                            {locale === 'kn' ? 'ಸಂಬೋಧನೆ' : 'Salutation'}
                                        </label>
                                        <select
                                            id="salutation"
                                            value={salutation}
                                            onChange={(e) => setSalutation(e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                        >
                                            <option value="">{locale === 'kn' ? 'ಆಯ್ಕೆ ಮಾಡಿ' : 'Select'}</option>
                                            <option value="ಶ್ರೀ">ಶ್ರೀ (Sri)</option>
                                            <option value="ಶ್ರೀಮತಿ">ಶ್ರೀಮತಿ (Smt.)</option>
                                            <option value="ಡಾ.">ಡಾ. (Dr.)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="officer-name" className="block text-sm font-medium text-gray-700">
                                            {locale === 'kn' ? 'ಅಧಿಕಾರಿ ಹೆಸರು' : 'Officer Name'}
                                        </label>
                                        <input
                                            type="text"
                                            id="officer-name"
                                            value={officerName}
                                            onChange={(e) => setOfficerName(e.target.value)}
                                            placeholder={locale === 'kn' ? 'ಉದಾ: ರಾಮಕೃಷ್ಣ ಜಿ.' : 'e.g. Ramakrishna G.'}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                            {locale === 'kn' ? 'ಹುದ್ದೆ' : 'Designation'}
                                        </label>
                                        <input
                                            type="text"
                                            id="designation"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            placeholder={locale === 'kn' ? 'ಉದಾ: ಉಪ ನಿರ್ದೇಶಕ, DDLR' : 'e.g. Deputy Director, DDLR'}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                                            {locale === 'kn' ? 'ಜಿಲ್ಲೆ ಮತ್ತು ನಗರ' : 'District & City'}
                                        </label>
                                        <input
                                            type="text"
                                            id="district"
                                            value={districtAndCity}
                                            onChange={(e) => setDistrictAndCity(e.target.value)}
                                            placeholder={locale === 'kn' ? 'ಉದಾ: ಬೆಂಗಳೂರು ಜಿಲ್ಲೆ' : 'e.g. Bengaluru District'}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="personal-prompt" className="block text-sm font-medium text-gray-700">
                                        {locale === 'kn' ? 'ವೈಯಕ್ತಿಕ ಶೈಲಿ ಸೂಚನೆಗಳು (ಐಚ್ಛಿಕ)' : 'Personal Style Instructions (Optional)'}
                                    </label>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {locale === 'kn'
                                            ? 'AI ಉತ್ಪಾದಿಸುವ ಆದೇಶಗಳಲ್ಲಿ ನೀವು ಬಯಸುವ ಹೆಚ್ಚಿನ ಸೂಚನೆಗಳು.'
                                            : 'Additional instructions for how you want the AI to write your orders.'}
                                    </p>
                                    <textarea
                                        id="personal-prompt"
                                        rows={3}
                                        value={personalPrompt}
                                        onChange={(e) => setPersonalPrompt(e.target.value)}
                                        placeholder={locale === 'kn' ? 'ಉದಾ: ಪ್ರತಿ ಆದೇಶದ ಕೊನೆಯಲ್ಲಿ ಕಾನೂನು ನಿಬಂಧನೆಗಳನ್ನು ಉಲ್ಲೇಖಿಸಿ.' : 'e.g. Always cite the relevant legal provision at the end of each order.'}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {profileSaving
                                        ? (locale === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...')
                                        : (locale === 'kn' ? 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ' : 'Save Profile')}
                                </button>
                            </form>
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
