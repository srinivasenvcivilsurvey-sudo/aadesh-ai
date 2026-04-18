"use client";

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, FileText, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedCaseType, setSelectedCaseType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

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

  // ── Shared file processing logic ───────────────────────────────────────────
  async function processFile(file: File) {
    setError('');
    setUploadSuccess(false);

    // Client-side checks (fast, no server needed)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(kn
        ? `ಫೈಲ್ ${MAX_FILE_SIZE_MB}MB ಗಿಂತ ದೊಡ್ಡದಾಗಿದೆ / File exceeds ${MAX_FILE_SIZE_MB}MB limit`
        : `File exceeds ${MAX_FILE_SIZE_MB}MB limit`
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

    let base64 = '';

    try {
      base64 = await fileToBase64(file);

      // ── Try server validate, but bypass on server errors ──────────────────
      let pageCount = 1;
      try {
        const headers = await getAuthHeaders();
        if (headers) {
          const response = await fetch('/api/pipeline/validate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ fileBase64: base64, mimeType: file.type, fileName: file.name }),
          });

          // Only treat as a file problem if it's a 422 (unprocessable) response
          if (response.status === 422) {
            const result = await response.json();
            if (!result.valid) {
              setError(result.error || (kn ? 'ಫೈಲ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಯಿತು / Validation failed' : 'Validation failed'));
              setLoading(false);
              return;
            }
          } else if (response.ok) {
            const result = await response.json();
            if (!result.valid) {
              setError(result.error || (kn ? 'ಫೈಲ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಯಿತು / Validation failed' : 'Validation failed'));
              setLoading(false);
              return;
            }
            pageCount = result.pageCount ?? 1;
          }
          // else: 401/500/timeout → bypass validate, proceed with reading
        }
      } catch {
        // Network error on validate call — bypass and proceed
      }

      // ── Store file data and advance ───────────────────────────────────────
      sessionStorage.setItem('pipeline_file_base64', base64);
      sessionStorage.setItem('pipeline_file_mime', file.type);
      sessionStorage.setItem('pipeline_file_page_count', String(pageCount));
      if (selectedCaseType) {
        sessionStorage.setItem('pipeline_case_type_hint', selectedCaseType);
      }

      // Brief success flash before navigating
      setUploadSuccess(true);
      setLoading(false);
      await new Promise(r => setTimeout(r, 800));
      dispatch({ type: 'SET_STEP', step: 'reading' });

    } catch (err) {
      console.error('[FileUploadStep] processFile error:', err);
      setError(kn
        ? 'ಫೈಲ್ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Could not read file. Please retry.'
        : 'Could not read file. Please retry.'
      );
      setLoading(false);
    }
  }

  // ── Full path: file upload via click ──────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  // ── Drag-and-drop handlers ────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || loading) return;
    processFile(file);
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
              onClick={() => !loading && !uploadSuccess && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                uploadSuccess
                  ? 'border-green-400 bg-green-50 cursor-default'
                  : loading
                    ? 'border-primary-300 bg-primary-50 cursor-wait'
                    : isDragging
                      ? 'border-primary-500 bg-primary-50 scale-[1.01] shadow-lg'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-orange-50/30 cursor-pointer'
              }`}
            >
              {uploadSuccess ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                  <p className="text-sm font-semibold text-green-700">
                    {kn ? 'ಫೈಲ್ ಸಿದ್ಧ! AI ಓದಲು ಆರಂಭಿಸುತ್ತಿದೆ...' : 'File ready! Starting AI reading...'}
                  </p>
                  <p className="text-xs text-green-600">{selectedFile?.name}</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-16 w-16 text-primary-500 animate-spin" />
                  <p className="text-sm text-primary-600 font-medium">
                    {kn ? 'ಫೈಲ್ ಓದಲಾಗುತ್ತಿದೆ...' : 'Reading file...'}
                  </p>
                  {selectedFile && <p className="text-xs text-gray-400">{selectedFile.name}</p>}
                </div>
              ) : isDragging ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-primary-500" />
                  </div>
                  <p className="text-base font-bold text-primary-600">
                    {kn ? 'ಇಲ್ಲಿ ಬಿಡಿ' : 'Drop file here'}
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {kn ? 'ಬೇರೆ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to select a different file'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {/* 80×80 icon tile */}
                  <div className="w-20 h-20 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-[#e85d26]" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-800">
                      {kn ? 'ಫೈಲ್ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                      {kn ? 'Drag & drop or click to upload' : 'ಫೈಲ್ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">PDF · DOCX · JPG · PNG</p>
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
            {!uploadSuccess && (
              <div className="text-center space-y-0.5">
                <p className="text-xs font-medium text-gray-500">
                  {kn ? 'PDF ಅಪ್‌ಲೋಡ್ ನಂತರ AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಓದುತ್ತದೆ (10–15 ಸೆಕೆಂಡ್)' : 'PDF will be read automatically after upload (10–15 seconds)'}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                  {kn ? 'PDF will be read automatically after upload (10–15 seconds)' : 'PDF ಅಪ್‌ಲೋಡ್ ನಂತರ AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಓದುತ್ತದೆ (10–15 ಸೆಕೆಂಡ್)'}
                </p>
              </div>
            )}
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
