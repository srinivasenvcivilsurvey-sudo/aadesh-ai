"use client";
import React, { useState } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Check, AlertCircle, CheckCircle } from 'lucide-react';
import strings, { t } from '@/lib/i18n';
import { useLanguage } from '@/lib/context/LanguageContext';
import { createSPASassClientAuthenticated } from '@/lib/supabase/client';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PACKS = [
  { id: 'pack_a', name: 'ಪ್ಯಾಕ್ A', nameEn: 'Pack A', orders: 30, price: 499, perOrder: '₹16.6' },
  { id: 'pack_b', name: 'ಪ್ಯಾಕ್ B', nameEn: 'Pack B', orders: 75, price: 999, perOrder: '₹13.3' },
  { id: 'pack_c', name: 'ಪ್ಯಾಕ್ C', nameEn: 'Pack C', orders: 200, price: 1999, perOrder: '₹10.0' },
  { id: 'pack_d', name: 'ಪ್ಯಾಕ್ D', nameEn: 'Pack D', orders: 600, price: 4999, perOrder: '₹8.3', bestValue: true },
];

export default function BillingPage() {
  const { user } = useGlobal();
  const { locale } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (packId: string) => {
    setLoading(packId);
    setError('');
    setSuccess('');

    try {
      // Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Check your internet connection.');
      }

      // Get auth token
      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Session expired. Please login again.');
      }

      // Create Razorpay order
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Aadesh AI (ಆದೇಶ AI)',
        description: `${data.packName} — ${data.ordersInPack} ಆದೇಶಗಳು`,
        order_id: data.orderId,
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verify payment — FIX: 2026-03-29 — include auth header (was missing, causing 401)
          try {
            const verifyResponse = await fetch('/api/razorpay', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packId,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              setSuccess(`✅ ${verifyData.creditsAdded} ಆದೇಶ ಕ್ರೆಡಿಟ್‌ಗಳನ್ನು ಸೇರಿಸಲಾಗಿದೆ!`);
            } else {
              setError('Payment recorded but credit addition failed. Contact support.');
            }
          } catch {
            setError('Payment verification failed. Contact support with your payment ID.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary-600" />
            {t(strings.nav.billing, locale)} — {locale === 'kn' ? 'ರೀಚಾರ್ಜ್ ಪ್ಯಾಕ್\u200Cಗಳು' : 'Recharge Packs'}
          </CardTitle>
          <CardDescription>
            {locale === 'kn' ? 'ಆದೇಶ ಕ್ರೆಡಿಟ್\u200Cಗಳನ್ನು ಖರೀದಿಸಿ. ಪ್ರತಿ ಕ್ರೆಡಿಟ್ = ಒಂದು AI ಆದೇಶ ಕರಡು.' : 'Buy order credits. Each credit = one AI order draft.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`relative border-2 rounded-xl p-6 text-center transition-all hover:shadow-lg ${
                  pack.bestValue
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {pack.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                    {t(strings.pricing.bestValue, locale)}
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900">{locale === 'kn' ? pack.name : pack.nameEn}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-primary-600">₹{pack.price.toLocaleString('en-IN')}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {pack.orders} {t(strings.pricing.orders, locale)}
                </p>
                <p className="text-xs text-gray-500">
                  {pack.perOrder} / {t(strings.pricing.perOrder, locale)}
                </p>

                <ul className="mt-4 space-y-1 text-left text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {locale === 'kn' ? 'AI ಆದೇಶ ಕರಡು' : 'AI order drafts'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {locale === 'kn' ? 'DOCX & PDF ಡೌನ್\u200Cಲೋಡ್' : 'DOCX & PDF download'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {locale === 'kn' ? 'ಸರಕಾರಿ ಕನ್ನಡ' : 'Sarakari Kannada'}
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(pack.id)}
                  disabled={loading === pack.id}
                  className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    pack.bestValue
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50`}
                >
                  {loading === pack.id ? (locale === 'kn' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading...') : t(strings.pricing.buyNow, locale)}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
