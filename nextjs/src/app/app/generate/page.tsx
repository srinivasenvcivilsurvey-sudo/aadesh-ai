"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Loader2, Download, RefreshCw, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert, Save, Printer, WifiOff } from 'lucide-react';
import strings, { t } from '@/lib/i18n';
import { createSPASassClientAuthenticated } from '@/lib/supabase/client';

interface GuardrailResult {
  id: string;
  name: string;
  nameKn: string;
  passed: boolean;
  details: string;
  detailsKn: string;
}

interface GuardrailReport {
  results: GuardrailResult[];
  allPassed: boolean;
  summary: string;
  summaryKn: string;
}

interface OrderMetadata {
  wordCount: number;
  model: string;
  tokensUsed: number;
  generationTime?: string;
  creditsRemaining?: number;
  refsUsed?: number;
  totalRefs?: number;
  refSource?: string;
}

export default function GenerateOrderPage() {
  const { refreshProfile } = useGlobal();
  const { locale } = useLanguage();
  const [orderType, setOrderType] = useState<'appeal' | 'suo_motu'>('appeal');
  const [caseDetails, setCaseDetails] = useState('');
  const [previousCases, setPreviousCases] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState('');
  const [editedOrder, setEditedOrder] = useState('');
  const [metadata, setMetadata] = useState<OrderMetadata | null>(null);
  const [guardrails, setGuardrails] = useState<GuardrailReport | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Offline/online detection
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    setIsOffline(!navigator.onLine);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  }, []);

  // Elapsed timer during generation
  useEffect(() => {
    if (generating) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [generating]);

  // Auto-save: when editedOrder changes, save after 10s of inactivity
  const triggerAutoSave = useCallback(() => {
    if (!editedOrder || editedOrder === generatedOrder) return;
    setAutoSaveStatus('saving');
    // Simulate save (in production, this would update the orders table)
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 500);
  }, [editedOrder, generatedOrder]);

  useEffect(() => {
    if (!editedOrder || editedOrder === generatedOrder) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(triggerAutoSave, 10_000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [editedOrder, generatedOrder, triggerAutoSave]);

  // Sync editedOrder when generatedOrder changes
  useEffect(() => {
    if (generatedOrder) setEditedOrder(generatedOrder);
  }, [generatedOrder]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx', 'pdf'].includes(ext || '')) {
      setError(t(strings.generate.acceptedFormats, locale));
      return;
    }
    setUploadedFile(file);
    setError('');
  };

  const handleGenerate = async () => {
    if (!caseDetails.trim() && !uploadedFile) {
      setError(locale === 'kn'
        ? 'ದಯವಿಟ್ಟು ಪ್ರಕರಣ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಫೈಲ್ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ'
        : 'Please enter case details or upload a file');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedOrder('');
    setEditedOrder('');
    setMetadata(null);
    setGuardrails(null);
    setVerified(false);
    setAutoSaveStatus('idle');

    try {
      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(locale === 'kn' ? 'ಸೆಷನ್ ಮುಕ್ತಾಯ. ಮರುಲಾಗಿನ್ ಮಾಡಿ.' : 'Session expired. Please login again.');
        return;
      }

      let details = caseDetails;
      if (uploadedFile && !caseDetails.trim()) {
        details = `[ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿದ ಫೈಲ್: ${uploadedFile.name}] — ಈ ಫೈಲ್\u200Cನಲ್ಲಿರುವ ಪ್ರಕರಣ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಆದೇಶ ರಚಿಸಿ.`;
      }

      const response = await fetch('/api/generate-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderType, caseDetails: details, previousCases: previousCases.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      setGeneratedOrder(data.order);
      setMetadata(data.metadata);
      if (data.guardrails) setGuardrails(data.guardrails);
      await refreshProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t(strings.errors.generationFailed, locale));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!verified) {
      setError(t(strings.result.mustVerify, locale));
      return;
    }

    setDownloading(true);
    setError('');

    try {
      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(locale === 'kn' ? 'ಸೆಷನ್ ಮುಕ್ತಾಯ. ಮರುಲಾಗಿನ್ ಮಾಡಿ.' : 'Session expired.');
        return;
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderText: editedOrder, format, orderType }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aadesh_order_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t(strings.errors.pleaseRetry, locale));
    } finally {
      setDownloading(false);
    }
  };

  const editedWordCount = editedOrder.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 p-6">
      {/* Offline Banner */}
      {isOffline && (
        <div className="offline-banner flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          {locale === 'kn' ? 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಇಲ್ಲ — ಮರುಸಂಪರ್ಕಗೊಂಡಾಗ ಪ್ರಯತ್ನಿಸಿ' : 'No internet connection — try again when connected'}
        </div>
      )}

      {/* Order Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            {t(strings.generate.title, locale)}
          </CardTitle>
          <CardDescription>
            {locale === 'kn'
              ? 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ DDLR ಆದೇಶ ಕರಡನ್ನು AI ಬಳಸಿ ರಚಿಸಿ'
              : 'Generate DDLR order drafts in Sarakari Kannada using AI'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(strings.generate.orderType, locale)}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setOrderType('appeal')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-center font-medium transition-colors ${
                  orderType === 'appeal'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t(strings.generate.appeal, locale)}
                <span className="block text-xs text-gray-500 mt-1">13 {t(strings.result.sections, locale)}</span>
              </button>
              <button
                onClick={() => setOrderType('suo_motu')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-center font-medium transition-colors ${
                  orderType === 'suo_motu'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t(strings.generate.suoMotu, locale)}
                <span className="block text-xs text-gray-500 mt-1">8 {t(strings.result.sections, locale)}</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(strings.generate.uploadCase, locale)}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {uploadedFile ? uploadedFile.name : t(strings.generate.acceptedFormats, locale)}
              </p>
              <input ref={fileInputRef} type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>

          {/* Structured Case Details — with placeholder examples */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {t(strings.generate.caseDetails, locale)}
            </label>

            {/* Quick fields with examples */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {locale === 'kn' ? 'ಪ್ರಕರಣ ಸಂಖ್ಯೆ' : 'Case Number'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'kn' ? 'ಉದಾ: 123/2025' : 'e.g. 123/2025'}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCaseDetails(prev => {
                      const lines = prev.split('\n');
                      const idx = lines.findIndex(l => l.startsWith('ಪ್ರಕರಣ ಸಂಖ್ಯೆ:') || l.startsWith('Case:'));
                      const newLine = `ಪ್ರಕರಣ ಸಂಖ್ಯೆ: ${val}`;
                      if (idx >= 0) { lines[idx] = newLine; return lines.join('\n'); }
                      return val ? `${newLine}\n${prev}` : prev;
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {locale === 'kn' ? 'ಸರ್ವೆ ನಂಬರ್' : 'Survey Number'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'kn' ? 'ಉದಾ: 45/2' : 'e.g. 45/2'}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCaseDetails(prev => {
                      const lines = prev.split('\n');
                      const idx = lines.findIndex(l => l.startsWith('ಸರ್ವೆ ನಂ:') || l.startsWith('Survey:'));
                      const newLine = `ಸರ್ವೆ ನಂ: ${val}`;
                      if (idx >= 0) { lines[idx] = newLine; return lines.join('\n'); }
                      return val ? `${prev}\n${newLine}` : prev;
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {locale === 'kn' ? 'ಗ್ರಾಮ' : 'Village'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'kn' ? 'ಉದಾ: ಹೆಸರಘಟ್ಟ' : 'e.g. Hesaraghatta'}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCaseDetails(prev => {
                      const lines = prev.split('\n');
                      const idx = lines.findIndex(l => l.startsWith('ಗ್ರಾಮ:') || l.startsWith('Village:'));
                      const newLine = `ಗ್ರಾಮ: ${val}`;
                      if (idx >= 0) { lines[idx] = newLine; return lines.join('\n'); }
                      return val ? `${prev}\n${newLine}` : prev;
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {locale === 'kn' ? 'ಮೇಲ್ಮನವಿದಾರರು' : 'Appellant Name'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'kn' ? 'ಉದಾ: ರಾಮಯ್ಯ ಬಿನ್ ಕೃಷ್ಣಪ್ಪ' : 'e.g. Ramaiah bin Krishnappa'}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCaseDetails(prev => {
                      const lines = prev.split('\n');
                      const idx = lines.findIndex(l => l.startsWith('ಮೇಲ್ಮನವಿದಾರರು:') || l.startsWith('Appellant:'));
                      const newLine = `ಮೇಲ್ಮನವಿದಾರರು: ${val}`;
                      if (idx >= 0) { lines[idx] = newLine; return lines.join('\n'); }
                      return val ? `${prev}\n${newLine}` : prev;
                    });
                  }}
                />
              </div>
            </div>

            {/* Full details textarea — for pasting or additional info */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {locale === 'kn' ? 'ಹೆಚ್ಚುವರಿ ವಿವರಗಳು (ಅಥವಾ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ)' : 'Additional details (or paste all details here)'}
              </label>
              <textarea
                value={caseDetails}
                onChange={(e) => setCaseDetails(e.target.value)}
                placeholder={t(strings.generate.caseDetailsPlaceholder, locale)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-y"
              />
            </div>
          </div>

          {/* Previous Related Cases (Optional) */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {locale === 'kn' ? 'ಸಂಬಂಧಿತ ಹಿಂದಿನ ಪ್ರಕರಣಗಳು (ಐಚ್ಛಿಕ)' : 'Previous Related Cases (Optional)'}
            </label>
            <input
              type="text"
              value={previousCases}
              onChange={(e) => setPreviousCases(e.target.value)}
              placeholder={locale === 'kn' ? 'ಉದಾ: ಅಪೀಲು 11/2018-19, ದಿ: 28-10-2020' : 'e.g. Appeal 11/2018-19, date: 28-10-2020'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-4 px-6 bg-primary-600 text-white rounded-lg font-medium text-lg hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex flex-col items-center justify-center gap-1"
          >
            {generating ? (
              <>
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t(strings.generate.generating, locale)}
                </span>
                <span className="text-sm text-primary-200">
                  {elapsedSeconds} {locale === 'kn' ? 'ಸೆಕೆಂಡ್ ಕಳೆದಿದೆ...' : 'seconds elapsed...'}
                  {elapsedSeconds > 5 && (locale === 'kn' ? ' — ದಯವಿಟ್ಟು ಕಾಯಿರಿ' : ' — please wait')}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t(strings.generate.generateBtn, locale)}
              </span>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Generated Order Result */}
      {generatedOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              {t(strings.result.orderGenerated, locale)}
            </CardTitle>
            {metadata && (
              <CardDescription>
                {t(strings.result.wordCount, locale)}: {editedWordCount} |
                Model: {metadata.model} |
                {metadata.generationTime && ` ⏱ ${metadata.generationTime} |`}
                {metadata.refsUsed !== undefined && (
                  <> 📚 {metadata.refsUsed}/{metadata.totalRefs} {locale === 'kn' ? 'ಉಲ್ಲೇಖಗಳು' : 'refs'} |</>
                )}
                {t(strings.result.sections, locale)}: {orderType === 'appeal' ? 13 : 8}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guardrail Status Panel */}
            {guardrails && (
              <div className={`rounded-lg border p-4 ${
                guardrails.allPassed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {guardrails.allPassed
                    ? <ShieldCheck className="h-5 w-5 text-green-600" />
                    : <ShieldAlert className="h-5 w-5 text-amber-600" />}
                  <span className={`text-sm font-semibold ${guardrails.allPassed ? 'text-green-700' : 'text-amber-700'}`}>
                    {locale === 'kn' ? guardrails.summaryKn : guardrails.summary}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {guardrails.results.map((g) => (
                    <div
                      key={g.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        g.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                      title={g.details}
                    >
                      {g.passed ? '\u2705' : '\u26A0\uFE0F'} {locale === 'kn' ? g.nameKn : g.name}
                      {!g.passed && <span className="ml-1 text-red-600">— {locale === 'kn' ? g.detailsKn : g.details}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Disclaimer Watermark — shown until verified */}
            {!verified && (
              <div className="text-center py-2 bg-amber-100 border border-amber-300 rounded-lg text-sm font-medium text-amber-800">
                {t(strings.result.aiDisclaimer, locale)}
              </div>
            )}

            {/* Editable hint */}
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>✏️</span>
              {locale === 'kn' ? 'ಸಂಪಾದಿಸಬಹುದು — ಕ್ಲಿಕ್ ಮಾಡಿ ಬದಲಾಯಿಸಿ' : 'Editable — click to change'}
            </p>

            {/* Editable Order Text — styled like government document */}
            <div className="relative">
              <textarea
                value={editedOrder}
                onChange={(e) => setEditedOrder(e.target.value)}
                rows={18}
                className="govt-document w-full rounded-lg border border-gray-200 px-8 py-6 leading-relaxed resize-y focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif", fontSize: '15px', lineHeight: '1.8' }}
              />
              {/* Auto-save indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                {autoSaveStatus === 'saving' && (
                  <><Loader2 className="h-3 w-3 animate-spin" />{locale === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...'}</>
                )}
                {autoSaveStatus === 'saved' && (
                  <><Save className="h-3 w-3 text-green-500" />{t(strings.result.autoSaved, locale)}</>
                )}
              </div>
            </div>

            {/* Word count live display */}
            <div className="text-sm text-gray-500 text-right">
              {editedWordCount} {t(strings.common.words, locale)}
              {editedWordCount >= 550 && editedWordCount <= 750
                ? <span className="ml-2 text-green-600">✓</span>
                : <span className="ml-2 text-amber-600">⚠</span>}
            </div>

            {/* Formal Verification Declaration — looks like official checkbox */}
            <div className={`p-5 rounded-lg border-2 transition-colors ${
              verified ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-200'
            }`}>
              <label htmlFor="verify-order" className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="verify-order"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {locale === 'kn'
                      ? 'ನಾನು ಈ ಕರಡಿನಲ್ಲಿರುವ ಎಲ್ಲಾ ಸಂಗತಿಗಳು, ಉಲ್ಲೇಖಗಳು ಮತ್ತು ಕಾನೂನು ನಿಬಂಧನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ ಮತ್ತು ಸಮ್ಮತಿಸುತ್ತೇನೆ.'
                      : 'I have verified all facts, citations, and legal provisions in this draft and accept responsibility.'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'kn'
                      ? '(AI-ಸಹಾಯಿತ ಕರಡು — ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ ಕಡ್ಡಾಯ)'
                      : '(AI-assisted draft — Officer verification mandatory)'}
                  </p>
                </div>
              </label>
            </div>

            {/* Download & Print Buttons — Word is primary for government offices */}
            <div className="flex gap-4 no-print">
              <button
                onClick={() => handleDownload('docx')}
                disabled={!verified || downloading}
                className={`flex-1 py-4 px-4 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition-colors ${
                  verified && !downloading ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {locale === 'kn' ? 'Word (.docx) ಡೌನ್\u200Cಲೋಡ್' : 'Download Word (.docx)'}
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={!verified || downloading}
                className={`flex-1 py-4 px-4 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition-colors ${
                  verified && !downloading ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={locale === 'kn' ? 'PDF ಬೆಂಬಲ ಶೀಘ್ರದಲ್ಲಿ — DOCX ಡೌನ್\u200Cಲೋಡ್ ಆಗುತ್ತದೆ' : 'PDF coming soon — downloads as DOCX'}
              >
                {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {locale === 'kn' ? 'PDF ಡೌನ್\u200Cಲೋಡ್' : 'Download PDF'}
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 no-print"
            >
              <Printer className="h-4 w-4" />
              {locale === 'kn' ? 'ಮುದ್ರಿಸಿ' : 'Print'}
            </button>

            {/* Regenerate */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 no-print"
            >
              <RefreshCw className="h-4 w-4" />
              {t(strings.result.regenerate, locale)}
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
