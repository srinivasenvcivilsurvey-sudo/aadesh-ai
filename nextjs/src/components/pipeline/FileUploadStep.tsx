"use client";

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAuthHeaders } from '@/lib/pipeline/getAuthToken';
import type { PipelineAction, CaseSummary } from '@/lib/pipeline/types';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Case types that skip Vision reading (no PDF upload needed)
const SIMPLE_CASE_TYPES = ['withdrawal', 'suo_motu'];

interface CaseTypeOption {
  value: string;
  labelKn: string;
  labelEn: string;
  isSimple: boolean;
}

const CASE_TYPE_OPTIONS: CaseTypeOption[] = [
  { value: 'contested_appeal', labelKn: 'ಸ್ಪರ್ಧಿತ ಮೇಲ್ಮನವಿ', labelEn: 'Contested Appeal', isSimple: false },
  { value: 'withdrawal',       labelKn: 'ವಾಪಸ್ ಮೇಲ್ಮನವಿ',   labelEn: 'Withdrawal',        isSimple: true  },
  { value: 'suo_motu',         labelKn: 'ಸ್ವಯಂಪ್ರೇರಿತ',      labelEn: 'Suo Motu Review',   isSimple: true  },
];

interface FileUploadStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  isSimplePath: boolean;
}

export function FileUploadStep({ dispatch, locale }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedCaseType, setSelectedCaseType] = useState<string>('');

  const kn = locale === 'kn';
  const isSimple = SIMPLE_CASE_TYPES.includes(selectedCaseType);

  // ── Simple path: no file upload needed ───────────────────────────────────
  function handleSimplePathContinue() {
    if (!selectedCaseType) return;
    const emptySummary: CaseSummary = {
      caseType: selectedCaseType,
      parties: { petitioner: '', respondent: '' },
      keyFacts: [],
      reliefSought: '',
    };
    dispatch({
      type: 'SET_CASE_SUMMARY',
      caseSummary: emptySummary,
      aiQuestions: [],
      caseType: selectedCaseType,
    });
  }

  // ── Full path: file upload + Vision reading ───────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(kn
        ? `ಫೈಲ್ ${MAX_FILE_SIZE_MB}MB ಗಿಂತ ದೊಡ್ಡದಾಗಿದೆ / File exceeds ${MAX_FILE_SIZE_MB}MB limit`
        : `File exceeds ${MAX_FILE_SIZE_MB}MB limit / ಫೈಲ್ ${MAX_FILE_SIZE_MB}MB ಗಿಂತ ದೊಡ್ಡದಾಗಿದೆ`
      );
      return;
    }

    if (!ACCEPTED_TYPES[file.type]) {
      setError(kn
        ? 'ಈ ಫೈಲ್ ಪ್ರಕಾರ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. PDF, DOCX, JPG, ಅಥವಾ PNG ಬಳಸಿ / File type not supported.'
        : 'File type not supported. Use PDF, DOCX, JPG, or PNG.'
      );
      return;
    }

    setSelectedFile(file);
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const headers = await getAuthHeaders();
      if (!headers) {
        setError(kn ? 'ಸೆಷನ್ ಮುಕ್ತಾಯ. ಮರುಲಾಗಿನ್ ಮಾಡಿ / Session expired.' : 'Session expired. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/pipeline/validate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fileBase64: base64, mimeType: file.type, fileName: file.name }),
      });

      const result = await response.json();

      if (!result.valid) {
        setError(result.error || (kn ? 'ಫೈಲ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಯಿತು / Validation failed' : 'Validation failed'));
        setLoading(false);
        return;
      }

      sessionStorage.setItem('pipeline_file_base64', base64);
      sessionStorage.setItem('pipeline_file_mime', file.type);
      sessionStorage.setItem('pipeline_file_page_count', String(result.pageCount));
      if (selectedCaseType) {
        sessionStorage.setItem('pipeline_case_type_hint', selectedCaseType);
      }

      dispatch({ type: 'SET_STEP', step: 'reading' });
    } catch {
      setError(kn
        ? 'ಫೈಲ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Validation failed. Please retry.'
        : 'Validation failed. Please retry.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary-600" />
          {kn ? 'ಪ್ರಕರಣ ಪ್ರಕಾರ ಆಯ್ಕೆ ಮಾಡಿ' : 'Select Case Type'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Case type selector */}
        <div className="grid gap-2">
          {CASE_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedCaseType(opt.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                selectedCaseType === opt.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <span className="block text-sm font-semibold text-gray-800" style={{ fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                  {opt.labelKn}
                </span>
                <span className="block text-xs text-gray-500">{opt.labelEn}</span>
              </div>
              <div className="flex items-center gap-2">
                {opt.isSimple && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    {kn ? 'ಉಚಿತ' : 'Free'}
                  </span>
                )}
                {selectedCaseType === opt.value && (
                  <div className="w-4 h-4 rounded-full bg-[#e85d26] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* DPDP Consent — shown after case type is selected */}
        {selectedCaseType && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              id="dpdp-consent"
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary-600 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="dpdp-consent" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
              {kn
                ? 'AI ಆದೇಶ ಕರಡು ತಯಾರಿಕೆಗಾಗಿ ನನ್ನ ಪ್ರಕರಣ ಡೇಟಾ ಪ್ರಕ್ರಿಯೆ ಮಾಡಲು ನಾನು ಒಪ್ಪಿಗೆ ನೀಡುತ್ತೇನೆ (DPDP Act 2023). ಹೆಸರು ಮತ್ತು ಸರ್ವೆ ನಂಬರ್ AI ಗೆ ಕಳುಹಿಸುವ ಮೊದಲು ಮರೆಮಾಡಲಾಗುತ್ತದೆ.'
                : 'I consent to processing my case data via AI for order drafting (DPDP Act 2023). Names and survey numbers are masked before sending to AI.'}
            </label>
          </div>
        )}

        {/* Simple path: no upload needed — just continue */}
        {selectedCaseType && isSimple && consentGiven && (
          <button
            onClick={handleSimplePathContinue}
            className="w-full py-3.5 px-4 btn-primary rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {kn ? 'ಮುಂದುವರಿಯಿರಿ' : 'Continue'}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Full path: file upload required */}
        {selectedCaseType && !isSimple && consentGiven && (
          <>
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                loading
                  ? 'border-primary-300 bg-primary-50 cursor-wait'
                  : 'border-gray-300 hover:border-primary-400 cursor-pointer'
              }`}
            >
              <Upload className={`h-10 w-10 mx-auto mb-3 ${loading ? 'text-primary-400 animate-pulse' : 'text-gray-400'}`} />
              {loading ? (
                <p className="text-sm text-primary-600 font-medium">
                  {kn ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Validating...'}
                </p>
              ) : selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {kn ? 'ಬೇರೆ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to select a different file'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {kn ? 'ಪ್ರಕರಣ ಫೈಲ್ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ' : 'Upload Case File'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {kn ? 'PDF, DOCX, JPG, PNG — ಗರಿಷ್ಠ 200 ಪುಟಗಳು' : 'PDF, DOCX, JPG, PNG — max 200 pages'}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {kn ? 'ಫೈಲ್ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿದ ನಂತರ AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಓದುತ್ತದೆ' : 'After upload, AI will automatically read the case file'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
