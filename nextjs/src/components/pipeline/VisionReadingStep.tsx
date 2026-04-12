"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAuthHeaders } from '@/lib/pipeline/getAuthToken';
import type { PipelineAction, CaseSummary } from '@/lib/pipeline/types';

interface VisionReadingStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
}

export function VisionReadingStep({ dispatch, locale }: VisionReadingStepProps) {
  const [error, setError] = useState('');
  const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [caseType, setCaseType] = useState('');

  const kn = locale === 'kn';

  useEffect(() => {
    readCaseFile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function readCaseFile() {
    setError('');
    setCaseSummary(null);

    const fileBase64 = sessionStorage.getItem('pipeline_file_base64');
    const mimeType = sessionStorage.getItem('pipeline_file_mime');
    const pageCount = parseInt(sessionStorage.getItem('pipeline_file_page_count') ?? '1', 10);

    console.log('[VisionReadingStep] readCaseFile — fileBase64 length:', fileBase64?.length ?? 0, 'mime:', mimeType);

    if (!fileBase64 || !mimeType) {
      console.error('[VisionReadingStep] sessionStorage missing file data!');
      setError(kn ? 'ಫೈಲ್ ಡೇಟಾ ಕಾಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ / File data missing. Please re-upload.' : 'File data missing. Please re-upload.');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        console.error('[VisionReadingStep] No auth headers — session expired');
        setError(kn ? 'ಸೆಷನ್ ಮುಕ್ತಾಯ. ಮರುಲಾಗಿನ್ ಮಾಡಿ / Session expired. Please login.' : 'Session expired. Please login.');
        return;
      }

      console.log('[VisionReadingStep] calling /api/pipeline/vision-read, pageCount:', pageCount);
      const response = await fetch('/api/pipeline/vision-read', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fileBase64, mimeType, pageCount }),
      });

      console.log('[VisionReadingStep] vision-read response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('[VisionReadingStep] vision-read error response:', response.status, data);
        throw new Error(data.error || `Vision read failed (${response.status})`);
      }

      const data = await response.json();
      console.log('[VisionReadingStep] vision-read success, caseType:', data.caseType);
      setCaseSummary(data.caseSummary);
      setQuestions(data.questions);
      setCaseType(data.caseType);

      // Clear file from sessionStorage — no longer needed
      sessionStorage.removeItem('pipeline_file_base64');
    } catch (err) {
      console.error('[VisionReadingStep] error:', err);
      setError(err instanceof Error ? err.message : (kn
        ? 'ಫೈಲ್ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Could not read file. Please retry.'
        : 'Could not read file. Please retry.'
      ));
    }
  }

  function handleConfirm() {
    if (!caseSummary) return;
    dispatch({
      type: 'SET_CASE_SUMMARY',
      caseSummary,
      aiQuestions: questions,
      caseType,
    });
  }

  // Loading state
  if (!caseSummary && !error) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 mx-auto text-primary-600 animate-spin" />
          <p className="text-sm font-medium text-gray-700">
            {kn ? 'AI ಪ್ರಕರಣ ಫೈಲ್ ಓದುತ್ತಿದೆ...' : 'AI is reading the case file...'}
          </p>
          <p className="text-xs text-gray-400">
            {kn ? '15-30 ಸೆಕೆಂಡ್ ತೆಗೆದುಕೊಳ್ಳಬಹುದು' : 'This may take 15-30 seconds'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={readCaseFile}
            className="w-full py-3 px-4 btn-primary rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {kn ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry'}
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'upload' })}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {kn ? 'ಹಿಂದೆ ಹೋಗಿ' : 'Go back'}
          </button>
        </CardContent>
      </Card>
    );
  }

  // Summary confirmation
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {kn ? 'AI ಓದಿದ ಸಾರಾಂಶ' : 'AI Case Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {caseSummary && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">{kn ? 'ಪ್ರಕರಣ ಪ್ರಕಾರ: ' : 'Case Type: '}</span>
              <span>{caseSummary.caseType}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">{kn ? 'ಮೇಲ್ಮನವಿದಾರರು: ' : 'Petitioner: '}</span>
              <span>{caseSummary.parties.petitioner}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">{kn ? 'ಎದುರುದಾರರು: ' : 'Respondent: '}</span>
              <span>{caseSummary.parties.respondent}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">{kn ? 'ಕೋರಿದ ಪರಿಹಾರ: ' : 'Relief Sought: '}</span>
              <span>{caseSummary.reliefSought}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleConfirm}
          className="w-full py-3 px-4 btn-primary rounded-lg font-medium"
        >
          {kn ? 'ಸರಿ, ಮುಂದುವರಿಯಿರಿ' : 'Looks good, continue'}
        </button>
      </CardContent>
    </Card>
  );
}
