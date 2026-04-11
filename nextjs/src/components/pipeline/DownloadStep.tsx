"use client";

import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAuthHeaders } from '@/lib/pipeline/getAuthToken';
import type { PipelineAction, PipelineState } from '@/lib/pipeline/types';

interface DownloadStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  state: PipelineState;
  userId: string;
  officerName: string;
}

export function DownloadStep({ dispatch, locale, state, userId, officerName }: DownloadStepProps) {
  const kn = locale === 'kn';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    exportDocx();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exportDocx() {
    setLoading(true);
    setError('');

    // Use edited text if available, otherwise fall back to generated text
    const finalText = state.editedText || state.generatedText;

    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        setError(kn ? 'ಸೆಷನ್ ಮುಕ್ತಾಯ. ಮರುಲಾಗಿನ್ ಮಾಡಿ / Session expired. Please login.' : 'Session expired. Please login.');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/pipeline/export-docx', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          finalText,
          caseType: state.caseType ?? 'appeal',
          caseNumber: (() => {
            // Extract case number from keyFacts (pattern: digits/digits)
            const facts = state.caseSummary?.keyFacts ?? [];
            const caseNumFact = facts.find(f => /\d+\/\d+/.test(f));
            const match = caseNumFact?.match(/\d+\/\d+/);
            return match?.[0] ?? '';
          })(),
          orderDate: state.officerAnswers?.orderDate ?? new Date().toISOString().split('T')[0],
          officerName: officerName || (state.officerAnswers?.officerName ?? ''),
          userId,
          guardrailScore: state.guardrailScore ?? 0,
          modelUsed: state.modelUsed ?? 'claude-sonnet-4-6',
          promptVersion: state.promptVersion ?? 'V3.2.1',
          inputTokens: state.inputTokens ?? null,
          outputTokens: state.outputTokens ?? null,
          // v9.2: pass acknowledgement timestamp from Entity Lock screen
          acknowledgementAt: sessionStorage.getItem('acknowledgement_at') ?? null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Export failed');
      }

      const data = await response.json();
      setDownloadUrl(data.downloadUrl);
      setFileName(data.fileName);

      if (data.orderId) {
        dispatch({ type: 'SET_ORDER_ID', orderId: data.orderId });
      }

      // Auto-trigger download
      triggerDownload(data.downloadUrl, data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : (kn
        ? 'ಡೌನ್\u200Cಲೋಡ್ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ'
        : 'Download failed. Please retry.'
      ));
    } finally {
      setLoading(false);
    }
  }

  function triggerDownload(url: string, name: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleManualDownload() {
    if (downloadUrl && fileName) {
      triggerDownload(downloadUrl, fileName);
    }
  }

  function handleRetry() {
    // Retry export WITHOUT re-running generation
    exportDocx();
  }

  function handleNewOrder() {
    // Reset to upload step for a new order
    dispatch({ type: 'SET_STEP', step: 'upload' });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <Download className="h-8 w-8 mx-auto text-primary-600 animate-bounce" />
          <p className="text-sm font-medium text-gray-700">
            {kn ? 'Word ಫೈಲ್ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...' : 'Preparing Word file...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={handleRetry}
            className="w-full py-3 px-4 btn-primary rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {kn ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry Download'}
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-green-700">
          <CheckCircle className="h-5 w-5" />
          {kn ? 'ಆದೇಶ ಸಿದ್ಧ!' : 'Order Ready!'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
          {kn
            ? 'ಆದೇಶ ಡೌನ್\u200Cಲೋಡ್ ಆಗಿದೆ. ಪರಿಶೀಲಿಸಿ ಸಹಿ ಮಾಡಿ.'
            : 'Order downloaded. Please review and sign.'}
        </div>

        {/* Credits remaining */}
        {state.credits > 0 && (
          <p className="text-xs text-gray-500 text-center">
            {kn ? `ಉಳಿದ ಕ್ರೆಡಿಟ್‌ಗಳು: ${state.credits}` : `Credits remaining: ${state.credits}`}
          </p>
        )}

        <button
          onClick={handleManualDownload}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          {kn ? 'ಮತ್ತೆ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ' : 'Download Again'}
        </button>

        <button
          onClick={handleNewOrder}
          className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
        >
          {kn ? 'ಹೊಸ ಆದೇಶ ರಚಿಸಿ' : 'Generate New Order'}
        </button>
      </CardContent>
    </Card>
  );
}
