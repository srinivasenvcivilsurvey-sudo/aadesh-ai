"use client";

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PipelineAction, PipelineState } from '@/lib/pipeline/types';

interface PreviewEditorStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  state: PipelineState;
}

export function PreviewEditorStep({ dispatch, locale, state }: PreviewEditorStepProps) {
  const kn = locale === 'kn';
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  // Entity Lock state (v9.2 Req 16)
  const [entityLockChecked, setEntityLockChecked] = useState(false);
  const [acknowledgementTimestamp, setAcknowledgementTimestamp] = useState<string | null>(null);

  // Initialise editor content
  useEffect(() => {
    if (editorRef.current && state.editedText) {
      editorRef.current.innerText = state.editedText;
      updateWordCount(state.editedText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateWordCount(text: string) {
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  }

  function handleInput() {
    const text = editorRef.current?.innerText ?? '';
    updateWordCount(text);
    dispatch({ type: 'SET_EDITED_TEXT', text });
  }

  function handleEntityLockChange(checked: boolean) {
    setEntityLockChecked(checked);
    if (checked) {
      setAcknowledgementTimestamp(new Date().toISOString());
    } else {
      setAcknowledgementTimestamp(null);
    }
  }

  function handleDownload() {
    // Entity lock must be checked — button is disabled if not, but double-check
    if (!entityLockChecked) return;

    const text = editorRef.current?.innerText ?? state.editedText;
    dispatch({ type: 'SET_EDITED_TEXT', text });
    // Store acknowledgement timestamp in state via SET_EDITED_TEXT metadata
    // The timestamp is passed to export-docx via the DownloadStep
    if (acknowledgementTimestamp) {
      // Store in sessionStorage so DownloadStep can pick it up
      sessionStorage.setItem('acknowledgement_at', acknowledgementTimestamp);
    }
    dispatch({ type: 'SET_STEP', step: 'downloading' });
  }

  const isGoodWordCount = wordCount >= 400 && wordCount <= 900;

  // Officer info for Entity Lock display (Req 16.6)
  const officerName = state.officerAnswers?.officerName ?? '';
  const orderDate = state.officerAnswers?.orderDate ?? '';
  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          {kn ? 'ಆದೇಶ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಂಪಾದಿಸಿ' : 'Review and Edit Order'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI disclaimer watermark */}
        <div className="text-center py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-700">
          ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು | Drafted by Aadesh AI — Please verify before signing.
        </div>

        {/* Guardrail score */}
        {state.guardrailScore !== null && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
            state.guardrailScore >= 3 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {state.guardrailScore >= 3
              ? <CheckCircle className="h-3.5 w-3.5" />
              : <ShieldAlert className="h-3.5 w-3.5" />}
            {kn
              ? `ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ: ${state.guardrailScore}/4 ಉತ್ತೀರ್ಣ`
              : `Quality check: ${state.guardrailScore}/4 passed`}
          </div>
        )}

        {/* Editable order text */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="min-h-96 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 px-6 py-4 text-sm leading-relaxed focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif", lineHeight: '1.8' }}
          />
          <p className="absolute top-2 right-3 text-xs text-gray-300">
            {kn ? 'ಸಂಪಾದಿಸಬಹುದು' : 'Editable'}
          </p>
        </div>

        {/* Live word count */}
        <div className={`text-right text-xs ${isGoodWordCount ? 'text-green-600' : 'text-amber-600'}`}>
          {wordCount} {kn ? 'ಪದಗಳು' : 'words'}
          {isGoodWordCount ? ' ✓' : ' ⚠'}
        </div>

        {/* ── Entity Lock Verification Screen (v9.2 Req 16) ─────────────────── */}
        <div className="border-2 border-orange-300 bg-orange-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-orange-800">
              {kn ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯ / Verification Required' : 'Verification Required / ಪರಿಶೀಲನೆ ಅಗತ್ಯ'}
            </span>
          </div>

          {/* Officer name and order date (Req 16.6) */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-white rounded-lg p-3 border border-orange-200">
            <div>
              <span className="text-gray-500 block">{kn ? 'ಅಧಿಕಾರಿ ಹೆಸರು' : 'Officer Name'}</span>
              <span className="font-semibold text-gray-900">{officerName || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{kn ? 'ಆದೇಶ ದಿನಾಂಕ' : 'Order Date'}</span>
              <span className="font-semibold text-gray-900">{formattedDate || orderDate || '—'}</span>
            </div>
          </div>

          {/* Un-skippable checkbox (Req 16.1, 16.2, 16.4) */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={entityLockChecked}
              onChange={(e) => handleEntityLockChange(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-orange-400 text-orange-600 focus:ring-orange-500 flex-shrink-0 cursor-pointer"
            />
            <span className="text-xs text-orange-900 leading-relaxed">
              <span className="block font-medium" style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}>
                ನಾನು ಎಲ್ಲಾ ಸರ್ವೆ ನಂಬರ್‌ಗಳು ಮತ್ತು ಹೆಸರುಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ. ಸಹಿ ಮಾಡುವ ಅಧಿಕಾರಿಯಾಗಿ ನಾನು ಸಂಪೂರ್ಣ ಜವಾಬ್ದಾರಿಯನ್ನು ಸ್ವೀಕರಿಸುತ್ತೇನೆ.
              </span>
              <span className="block text-orange-700 mt-1">
                I have verified all survey numbers and names. I accept full responsibility as signatory.
              </span>
            </span>
          </label>

          {!entityLockChecked && (
            <p className="text-xs text-orange-600 font-medium">
              {kn
                ? '⚠ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಲು ಮೇಲಿನ ಚೆಕ್\u200Cಬಾಕ್ಸ್ ಅನ್ನು ಟಿಕ್ ಮಾಡಿ'
                : '⚠ Check the box above to enable download'}
            </p>
          )}
        </div>

        {/* Download button — disabled until entity lock checked (Req 16.3) */}
        <button
          onClick={handleDownload}
          disabled={!entityLockChecked}
          className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-colors ${
            entityLockChecked
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {kn ? 'Word (.docx) ಡೌನ್\u200Cಲೋಡ್ →' : 'Download Word (.docx) →'}
        </button>
      </CardContent>
    </Card>
  );
}
