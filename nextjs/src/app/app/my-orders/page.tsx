"use client";
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText, Loader2, AlertCircle, Search, Eye, Download, RefreshCw,
  ChevronLeft, ChevronRight, ArrowUpDown,
} from 'lucide-react';
import { createSPASassClientAuthenticated } from '@/lib/supabase/client';
import strings, { t } from '@/lib/i18n';

interface OrderItem {
  id: string;
  caseType: string;
  caseNumber: string | null;
  wordCount: number;
  score: number;
  model: string;
  verified: boolean;
  createdAt: string;
  preview: string;
}

export default function MyOrdersPage() {
  const { user } = useGlobal();
  const { locale } = useLanguage();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);
  const [fullOrderText, setFullOrderText] = useState('');
  const [downloading, setDownloading] = useState(false);
  const limit = 20;

  useEffect(() => {
    if (user?.id) loadOrders();
  }, [user, page, sortBy, sortDir]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
        dir: sortDir,
        ...(search ? { search } : {}),
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      setError(locale === 'kn' ? 'ಆದೇಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲ' : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadOrders();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleView = async (orderId: string) => {
    try {
      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Fetch full order from a dedicated endpoint or inline
      // For now, use the admin client approach via a simple fetch
      const adminClient = await createSPASassClientAuthenticated();
      const db = adminClient.getSupabaseClient();
      const { data } = await db
        .from('orders' as never)
        .select('generated_order' as never)
        .eq('id' as never, orderId as never)
        .single();

      if (data) {
        setFullOrderText((data as { generated_order: string }).generated_order || '');
        setViewingOrder(orderId);
      }
    } catch {
      setError(locale === 'kn' ? 'ಆದೇಶ ಲೋಡ್ ವಿಫಲ' : 'Failed to load order');
    }
  };

  const handleDownload = async (orderId: string, format: 'docx' | 'pdf') => {
    try {
      setDownloading(true);
      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // First get the full order text
      const db = client.getSupabaseClient();
      const { data } = await db
        .from('orders' as never)
        .select('generated_order, case_type' as never)
        .eq('id' as never, orderId as never)
        .single();

      if (!data) return;
      const orderData = data as { generated_order: string; case_type: string };

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderText: orderData.generated_order,
          format,
          orderType: orderData.case_type,
        }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aadesh_order_${orderId.slice(0, 8)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(locale === 'kn' ? 'ಡೌನ್\u200Cಲೋಡ್ ವಿಫಲ' : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const typeLabels: Record<string, { kn: string; en: string }> = {
    appeal: { kn: 'ಮೇಲ್ಮನವಿ', en: 'Appeal' },
    suo_motu: { kn: 'ಸ್ವಯಂಪ್ರೇರಿತ', en: 'Suo Motu' },
    dismissed: { kn: 'ವಜಾ', en: 'Dismissed' },
    review: { kn: 'ಪುನರ್ವಿಮರ್ಶೆ', en: 'Review' },
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary-600" />
            {t(strings.nav.myOrders, locale)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} {locale === 'kn' ? 'ಆದೇಶಗಳು ರಚಿಸಲಾಗಿದೆ' : 'orders generated'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={locale === 'kn' ? 'ಪ್ರಕರಣ ಸಂಖ್ಯೆ ಅಥವಾ ವಿವರಗಳಿಂದ ಹುಡುಕಿ...' : 'Search by case number or details...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          {locale === 'kn' ? 'ಹುಡುಕಿ' : 'Search'}
        </button>
      </div>

      {/* Order View Modal */}
      {viewingOrder && (
        <Card className="border-2 border-primary-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {locale === 'kn' ? 'ಆದೇಶ ವೀಕ್ಷಣೆ' : 'Order View'}
            </CardTitle>
            <button
              onClick={() => { setViewingOrder(null); setFullOrderText(''); }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              {locale === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'} ✕
            </button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {fullOrderText}
              </pre>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleDownload(viewingOrder, 'docx')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                DOCX
              </button>
              <button
                onClick={() => handleDownload(viewingOrder, 'pdf')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => toggleSort('created_at')}
          className={`px-3 py-1.5 rounded-full border transition-colors ${sortBy === 'created_at' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="flex items-center gap-1">
            {locale === 'kn' ? 'ದಿನಾಂಕ' : 'Date'} <ArrowUpDown className="h-3 w-3" />
          </span>
        </button>
        <button
          onClick={() => toggleSort('score')}
          className={`px-3 py-1.5 rounded-full border transition-colors ${sortBy === 'score' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="flex items-center gap-1">
            {locale === 'kn' ? 'ಸ್ಕೋರ್' : 'Score'} <ArrowUpDown className="h-3 w-3" />
          </span>
        </button>
      </div>

      {/* Orders — Card Layout */}
      <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">
                {locale === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಆದೇಶಗಳಿಲ್ಲ' : 'No orders yet'}
              </p>
              <p className="text-gray-400 text-sm mt-1 mb-4">
                {locale === 'kn' ? 'ನಿಮ್ಮ ಮೊದಲ ಆದೇಶವನ್ನು ರಚಿಸಿ!' : 'Generate your first order!'}
              </p>
              <a
                href="/app/generate"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                <FileText className="h-4 w-4" />
                {locale === 'kn' ? 'ಮೊದಲ ಆದೇಶ ರಚಿಸಿ' : 'Generate First Order'}
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleView(order.id)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                        {typeLabels[order.caseType]?.[locale] || order.caseType}
                      </span>
                      {order.caseNumber && (
                        <span className="ml-2 text-sm text-gray-500 font-mono">
                          {locale === 'kn' ? 'ಪ್ರಕರಣ' : 'Case'} {order.caseNumber}
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${order.score >= 85 ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.score}
                    </span>
                  </div>

                  {/* Card Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    <span className={order.wordCount >= 550 && order.wordCount <= 750 ? 'text-green-600' : 'text-amber-600'}>
                      {order.wordCount} {locale === 'kn' ? 'ಪದ' : 'words'}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleView(order.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      {locale === 'kn' ? 'ನೋಡಿ' : 'View'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(order.id, 'docx'); }}
                      disabled={downloading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      {locale === 'kn' ? 'ಡೌನ್\u200Cಲೋಡ್' : 'Download'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.location.href = '/app/generate'; }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors ml-auto"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {locale === 'kn' ? 'ಮರುರಚಿಸಿ' : 'Regenerate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                {locale === 'kn'
                  ? `ಪುಟ ${page} / ${totalPages}`
                  : `Page ${page} of ${totalPages}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
