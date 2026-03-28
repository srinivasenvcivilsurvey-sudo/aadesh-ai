"use client";
import React, { useState, useRef } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Loader2, Download, RefreshCw, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
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
}

export default function GenerateOrderPage() {
  const { refreshProfile } = useGlobal();
  const [orderType, setOrderType] = useState<'appeal' | 'suo_motu'>('appeal');
  const [caseDetails, setCaseDetails] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState('');
  const [metadata, setMetadata] = useState<OrderMetadata | null>(null);
  const [guardrails, setGuardrails] = useState<GuardrailReport | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locale = 'kn'; // Default to Kannada — TODO: make user-selectable

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
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
      setError('ದಯವಿಟ್ಟು ಪ್ರಕರಣ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedOrder('');
    setMetadata(null);
    setGuardrails(null);
    setVerified(false);

    try {
      // Get auth token
      const client = await createSPASassClientAuthenticated();
      const supabase = client.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Session expired. Please login again.');
        return;
      }

      // If file uploaded, read its text (for now just use the filename as context)
      let details = caseDetails;
      if (uploadedFile && !caseDetails.trim()) {
        details = `[ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್: ${uploadedFile.name}] — ಈ ಫೈಲ್‌ನಲ್ಲಿರುವ ಪ್ರಕರಣ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಆದೇಶ ರಚಿಸಿ.`;
      }

      const response = await fetch('/api/generate-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderType,
          caseDetails: details,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedOrder(data.order);
      setMetadata(data.metadata);
      if (data.guardrails) {
        setGuardrails(data.guardrails);
      }
      // Refresh profile to update credits in sidebar/dashboard
      await refreshProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ಆದೇಶ ರಚನೆ ವಿಫಲವಾಯಿತು');
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
        setError('ಸೆಷನ್ ಮುಕ್ತಾಯವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮರುಲಾಗಿನ್ ಮಾಡಿ.');
        return;
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderText: generatedOrder,
          format,
          orderType,
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aadesh_order_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಯಿತು');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Case Details Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(strings.generate.caseDetails, locale)}
            </label>
            <textarea
              value={caseDetails}
              onChange={(e) => setCaseDetails(e.target.value)}
              placeholder={t(strings.generate.caseDetailsPlaceholder, locale)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-y"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t(strings.generate.generating, locale)}
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                {t(strings.generate.generateBtn, locale)}
              </>
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
                {t(strings.result.wordCount, locale)}: {metadata.wordCount} |
                Model: {metadata.model} |
                {metadata.generationTime && ` ⏱ ${metadata.generationTime} |`}
                {t(strings.result.sections, locale)}: {orderType === 'appeal' ? 13 : 8}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guardrail Status Panel */}
            {guardrails && (
              <div className={`rounded-lg border p-4 ${
                guardrails.allPassed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {guardrails.allPassed ? (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    guardrails.allPassed ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {guardrails.summaryKn}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {guardrails.results.map((g) => (
                    <div
                      key={g.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        g.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      title={g.details}
                    >
                      {g.passed ? '✅' : '⚠️'} {g.nameKn}
                      {!g.passed && (
                        <span className="ml-1 text-red-600">— {g.detailsKn}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Preview */}
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {generatedOrder}
              </pre>
            </div>

            {/* Verification Checkbox — MANDATORY before download */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <input
                type="checkbox"
                id="verify-order"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="verify-order" className="text-sm font-medium text-amber-800 cursor-pointer">
                {t(strings.result.verifyCheckbox, locale)}
              </label>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleDownload('docx')}
                disabled={!verified || downloading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  verified && !downloading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {t(strings.result.downloadDocx, locale)}
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={!verified || downloading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  verified && !downloading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {t(strings.result.downloadPdf, locale)}
              </button>
            </div>

            {/* Regenerate */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
