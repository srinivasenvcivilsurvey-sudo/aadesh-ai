"use client";

/**
 * OfficerReasoningStep — Legal Shield Layer 3.5
 * Forces the officer to articulate their legal reasoning before
 * AI generation begins. Three required inputs; all client-side
 * validated before submit unlocks.
 *
 * Inputs:
 *  1. Key legal issue (textarea, min 40 chars, must reference case entities)
 *  2. Documents relied upon (multi-select checkboxes, at least 1 required)
 *  3. Decision reasoning (textarea, min 80 chars, must reference case facts)
 *
 * On success: dispatches SET_REASONING which moves state to 'generating'.
 * On error: shows inline error, stays on 'reasoning' step.
 */

import React, { useState, useCallback } from 'react';
import type { PipelineAction, PipelineState } from '@/lib/pipeline/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OfficerReasoningStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  state: PipelineState;
  userId: string;
}

type DocumentOption =
  | 'RTC'
  | 'Sale Deed'
  | 'Aadhaar'
  | 'Survey Sketch'
  | 'Mutation Register'
  | 'Khata Extract'
  | 'Tax Receipt'
  | 'Other';

const DOCUMENT_OPTIONS: DocumentOption[] = [
  'RTC',
  'Sale Deed',
  'Aadhaar',
  'Survey Sketch',
  'Mutation Register',
  'Khata Extract',
  'Tax Receipt',
  'Other',
];

const DOCUMENT_OPTION_KN: Record<DocumentOption, string> = {
  RTC: 'ಆರ್‌ಟಿಸಿ',
  'Sale Deed': 'ಮಾರಾಟ ಪತ್ರ',
  Aadhaar: 'ಆಧಾರ್',
  'Survey Sketch': 'ಸರ್ವೆ ನಕ್ಷೆ',
  'Mutation Register': 'ಮ್ಯುಟೇಶನ್ ರಿಜಿಸ್ಟರ್',
  'Khata Extract': 'ಖಾತಾ ಉದ್ಧರಣ',
  'Tax Receipt': 'ತೆರಿಗೆ 영수증',
  Other: 'ಇತರ',
};

const NOTO_SANS_KANNADA: React.CSSProperties = {
  fontFamily: "'Noto Sans Kannada', sans-serif",
};

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Extracts candidate entity tokens from caseSummary for validation.
 * Includes party name words, survey numbers from keyFacts, and
 * the keyword "survey" / "ಸರ್ವೆ".
 */
function extractEntityTokens(state: PipelineState): string[] {
  const tokens: string[] = ['survey', 'ಸರ್ವೆ'];
  const cs = state.caseSummary;
  if (!cs) return tokens;

  const addNameTokens = (s: string) => {
    s.trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length >= 3)
      .forEach(t => tokens.push(t));
  };

  addNameTokens(cs.parties.petitioner);
  addNameTokens(cs.parties.respondent);

  cs.keyFacts.forEach(fact => {
    // Extract digit sequences (survey numbers, case numbers, etc.)
    const nums = fact.match(/\d+/g);
    if (nums) nums.forEach(n => tokens.push(n));
  });

  return [...new Set(tokens)];
}

function containsEntityRef(text: string, tokens: string[]): boolean {
  const lower = text.toLowerCase();
  return tokens.some(t => lower.includes(t));
}

// ── Main Component ────────────────────────────────────────────────────────────

export function OfficerReasoningStep({
  dispatch,
  locale,
  state,
  userId: _userId,
}: OfficerReasoningStepProps) {
  const kn = locale === 'kn';

  const [keyIssue, setKeyIssue] = useState('');
  const [keyIssueError, setKeyIssueError] = useState<string | null>(null);
  const [keyIssueTouched, setKeyIssueTouched] = useState(false);

  const [selectedDocs, setSelectedDocs] = useState<Set<DocumentOption>>(new Set());
  const [otherDocText, setOtherDocText] = useState('');
  const [docsError, setDocsError] = useState<string | null>(null);

  const [decisionReasoning, setDecisionReasoning] = useState('');
  const [reasoningError, setReasoningError] = useState<string | null>(null);
  const [reasoningTouched, setReasoningTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const entityTokens = extractEntityTokens(state);

  // ── Field validators ───────────────────────────────────────────────────────

  const validateKeyIssue = useCallback(
    (value: string): string | null => {
      if (value.trim().length < 40) {
        return kn
          ? 'ಕನಿಷ್ಠ 40 ಅಕ್ಷರಗಳು ಅಗತ್ಯ / Minimum 40 characters required'
          : 'Minimum 40 characters required / ಕನಿಷ್ಠ 40 ಅಕ್ಷರಗಳು ಅಗತ್ಯ';
      }
      if (!containsEntityRef(value, entityTokens)) {
        return kn
          ? 'ಮೇಲ್ಮನವಿದಾರ, ಎದುರುದಾರ, ಅಥವಾ ಸರ್ವೆ ಸಂಖ್ಯೆ ಉಲ್ಲೇಖಿಸಿ / Must reference party name or survey number'
          : 'Must reference appellant name, respondent name, or survey number / ಮೇಲ್ಮನವಿದಾರ ಅಥವಾ ಸರ್ವೆ ಸಂಖ್ಯೆ ಉಲ್ಲೇಖಿಸಿ';
      }
      return null;
    },
    [entityTokens, kn]
  );

  const validateDocs = useCallback(
    (docs: Set<DocumentOption>, otherText: string): string | null => {
      if (docs.size === 0) {
        return kn
          ? 'ಕನಿಷ್ಠ ಒಂದು ದಾಖಲೆ ಆಯ್ಕೆ ಮಾಡಿ / Select at least one document'
          : 'Select at least one document / ಕನಿಷ್ಠ ಒಂದು ದಾಖಲೆ ಆಯ್ಕೆ ಮಾಡಿ';
      }
      if (docs.has('Other') && otherText.trim().length < 20) {
        return kn
          ? '"ಇತರ" ಆಯ್ಕೆ ಮಾಡಿದ್ದರೆ ಕನಿಷ್ಠ 20 ಅಕ್ಷರ ವಿವರಿಸಿ / Describe "Other" (min 20 chars)'
          : 'If "Other" selected, describe it (min 20 characters) / ಕನಿಷ್ಠ 20 ಅಕ್ಷರ ವಿವರಿಸಿ';
      }
      return null;
    },
    [kn]
  );

  const validateReasoning = useCallback(
    (value: string): string | null => {
      if (value.trim().length < 80) {
        return kn
          ? 'ಕನಿಷ್ಠ 80 ಅಕ್ಷರಗಳು ಅಗತ್ಯ / Minimum 80 characters required'
          : 'Minimum 80 characters required / ಕನಿಷ್ಠ 80 ಅಕ್ಷರಗಳು ಅಗತ್ಯ';
      }
      if (!containsEntityRef(value, entityTokens)) {
        return kn
          ? 'ಪ್ರಕರಣದ ಸಂಗತಿ (ಸರ್ವೆ ಸಂಖ್ಯೆ ಅಥವಾ ಪಕ್ಷಕಾರ ಹೆಸರು) ಉಲ್ಲೇಖಿಸಿ / Must reference a case fact'
          : 'Must reference at least one case fact (survey number or party name) / ಪ್ರಕರಣದ ಸಂಗತಿ ಉಲ್ಲೇಖಿಸಿ';
      }
      return null;
    },
    [entityTokens, kn]
  );

  // ── Computed gate ──────────────────────────────────────────────────────────

  const keyIssueValid = validateKeyIssue(keyIssue) === null;
  const docsValid = validateDocs(selectedDocs, otherDocText) === null;
  const reasoningValid = validateReasoning(decisionReasoning) === null;
  const canSubmit = keyIssueValid && docsValid && reasoningValid && !isSubmitting;

  // ── Document toggle ────────────────────────────────────────────────────────

  function toggleDoc(doc: DocumentOption) {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(doc)) {
        next.delete(doc);
      } else {
        next.add(doc);
      }
      setDocsError(validateDocs(next, otherDocText));
      return next;
    });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    // Force-show all errors on submit attempt
    const ki = validateKeyIssue(keyIssue);
    const dv = validateDocs(selectedDocs, otherDocText);
    const rv = validateReasoning(decisionReasoning);

    setKeyIssueError(ki);
    setKeyIssueTouched(true);
    setDocsError(dv);
    setReasoningError(rv);
    setReasoningTouched(true);

    if (ki || dv || rv) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const documents_relied: string[] = Array.from(selectedDocs).map(doc =>
      doc === 'Other' ? `Other: ${otherDocText.trim()}` : doc
    );

    try {
      const { getAuthToken } = await import('@/lib/pipeline/getAuthToken');
      const authToken = getAuthToken();

      const res = await fetch('/api/pipeline/reasoning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          receipt_id: state.receiptId,
          attestation_hash: state.attestationHash,
          key_issue: keyIssue.trim(),
          documents_relied,
          decision_reasoning: decisionReasoning.trim(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Reasoning capture failed');
      }

      const data = (await res.json()) as { reasoning_hash: string };
      dispatch({ type: 'SET_REASONING', reasoningHash: data.reasoning_hash });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSubmitError(
        kn
          ? `ತಾರ್ಕಿಕ ದಾಖಲಾತಿ ವಿಫಲ: ${msg} / Reasoning capture failed`
          : `Reasoning capture failed: ${msg} / ತಾರ್ಕಿಕ ದಾಖಲಾತಿ ವಿಫಲ`
      );
      setIsSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border-2 border-indigo-700 bg-white shadow-xl">

        {/* Header */}
        <div className="rounded-t-xl bg-indigo-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white" style={NOTO_SANS_KANNADA}>
            {kn
              ? 'ಕಾನೂನು ಹೊರ ರಕ್ಷಣೆ — ಅಧಿಕಾರಿ ತಾರ್ಕಿಕತೆ'
              : 'Legal Shield — Officer Reasoning Capture'}
          </h2>
          <p className="mt-1 text-sm text-indigo-200" style={NOTO_SANS_KANNADA}>
            {kn
              ? 'AI ಆದೇಶ ರಚನೆ ಮೊದಲು ನಿಮ್ಮ ಕಾನೂನು ತಾರ್ಕಿಕತೆ ದಾಖಲಿಸಿ.'
              : 'Record your legal reasoning before AI order generation begins.'}
          </p>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* ── Input 1: Key Legal Issue ─────────────────────────────────── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              <span className="text-red-600">*</span>{' '}
              <span style={NOTO_SANS_KANNADA}>ಪ್ರಮುಖ ಕಾನೂನು ಸಮಸ್ಯೆ / </span>
              Key Legal Issue
            </label>
            <p className="mb-2 text-xs text-gray-500" style={NOTO_SANS_KANNADA}>
              {kn
                ? 'ಮೇಲ್ಮನವಿದಾರ, ಎದುರುದಾರ, ಅಥವಾ ಸರ್ವೆ ಸಂಖ್ಯೆ ಉಲ್ಲೇಖಿಸಿ. ಕನಿಷ್ಠ 40 ಅಕ್ಷರ.'
                : 'Must reference appellant, respondent, or survey number. Minimum 40 characters.'}
            </p>
            <textarea
              rows={3}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 resize-y ${
                keyIssueTouched && keyIssueError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                  : keyIssueValid && keyIssue.length > 0
                  ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder={
                kn
                  ? 'ಈ ಪ್ರಕರಣದಲ್ಲಿ ನಿರ್ಧಾರ ಮಾಡಬೇಕಾದ ಕಾನೂನು ಸಮಸ್ಯೆ ಏನು?'
                  : 'What is the key legal issue to be decided in this case?'
              }
              value={keyIssue}
              onChange={e => {
                setKeyIssue(e.target.value);
                if (keyIssueTouched) setKeyIssueError(validateKeyIssue(e.target.value));
              }}
              onBlur={() => {
                setKeyIssueTouched(true);
                setKeyIssueError(validateKeyIssue(keyIssue));
              }}
              style={NOTO_SANS_KANNADA}
            />
            <div className="mt-1 flex items-start justify-between gap-2">
              <div className="flex-1">
                {keyIssueTouched && keyIssueError && (
                  <p className="text-xs text-red-600" style={NOTO_SANS_KANNADA}>
                    {keyIssueError}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  keyIssue.length >= 40 ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {keyIssue.length} / 40+
              </span>
            </div>
          </div>

          {/* ── Input 2: Documents Relied Upon ──────────────────────────── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              <span className="text-red-600">*</span>{' '}
              <span style={NOTO_SANS_KANNADA}>ಆಧಾರ ದಾಖಲೆಗಳು / </span>
              Documents Relied Upon
            </label>
            <p className="mb-2 text-xs text-gray-500" style={NOTO_SANS_KANNADA}>
              {kn ? 'ಕನಿಷ್ಠ ಒಂದು ಆಯ್ಕೆ ಅಗತ್ಯ.' : 'Select at least one document.'}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DOCUMENT_OPTIONS.map(doc => (
                <label
                  key={doc}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors select-none ${
                    selectedDocs.has(doc)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 shrink-0 rounded accent-indigo-600"
                    checked={selectedDocs.has(doc)}
                    onChange={() => toggleDoc(doc)}
                  />
                  <span style={NOTO_SANS_KANNADA}>{kn ? DOCUMENT_OPTION_KN[doc] : doc}</span>
                </label>
              ))}
            </div>

            {selectedDocs.has('Other') && (
              <div className="mt-3">
                <label
                  className="mb-1 block text-xs font-medium text-gray-600"
                  style={NOTO_SANS_KANNADA}
                >
                  {kn
                    ? '"ಇತರ" ದಾಖಲೆ ವಿವರಿಸಿ (ಕನಿಷ್ಠ 20 ಅಕ್ಷರ)'
                    : 'Describe "Other" document (min 20 chars)'}
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={
                    kn ? 'ದಾಖಲೆ ಹೆಸರು ಮತ್ತು ವಿವರ...' : 'Document name and details...'
                  }
                  value={otherDocText}
                  onChange={e => {
                    setOtherDocText(e.target.value);
                    setDocsError(validateDocs(selectedDocs, e.target.value));
                  }}
                  style={NOTO_SANS_KANNADA}
                />
                <span
                  className={`mt-0.5 block text-xs tabular-nums ${
                    otherDocText.length >= 20 ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {otherDocText.length} / 20+
                </span>
              </div>
            )}

            {docsError && (
              <p className="mt-1 text-xs text-red-600" style={NOTO_SANS_KANNADA}>
                {docsError}
              </p>
            )}
          </div>

          {/* ── Input 3: Decision Reasoning ─────────────────────────────── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              <span className="text-red-600">*</span>{' '}
              <span style={NOTO_SANS_KANNADA}>ನಿರ್ಧಾರ ತಾರ್ಕಿಕತೆ / </span>
              Decision Reasoning
            </label>
            <p className="mb-2 text-xs text-gray-500" style={NOTO_SANS_KANNADA}>
              {kn
                ? 'ಪ್ರಕರಣದ ಸಂಗತಿ (ಸರ್ವೆ ಸಂಖ್ಯೆ ಅಥವಾ ಪಕ್ಷಕಾರ ಹೆಸರು) ಉಲ್ಲೇಖಿಸಿ. ಕನಿಷ್ಠ 80 ಅಕ್ಷರ.'
                : 'Must reference case facts (survey number or party name). Minimum 80 characters.'}
            </p>
            <textarea
              rows={4}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 resize-y ${
                reasoningTouched && reasoningError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                  : reasoningValid && decisionReasoning.length > 0
                  ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder={
                kn
                  ? 'ನಿರ್ಧಾರಕ್ಕೆ ತಾರ್ಕಿಕ ಆಧಾರ ವಿವರಿಸಿ...'
                  : 'Explain the legal basis for your decision...'
              }
              value={decisionReasoning}
              onChange={e => {
                setDecisionReasoning(e.target.value);
                if (reasoningTouched) setReasoningError(validateReasoning(e.target.value));
              }}
              onBlur={() => {
                setReasoningTouched(true);
                setReasoningError(validateReasoning(decisionReasoning));
              }}
              style={NOTO_SANS_KANNADA}
            />
            <div className="mt-1 flex items-start justify-between gap-2">
              <div className="flex-1">
                {reasoningTouched && reasoningError && (
                  <p className="text-xs text-red-600" style={NOTO_SANS_KANNADA}>
                    {reasoningError}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  decisionReasoning.length >= 80 ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {decisionReasoning.length} / 80+
              </span>
            </div>
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span style={NOTO_SANS_KANNADA}>{submitError}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full rounded-md bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isSubmitting ? (
              <span style={NOTO_SANS_KANNADA}>
                {kn ? 'ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving... / ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...'}
              </span>
            ) : (
              <span style={NOTO_SANS_KANNADA}>
                {kn
                  ? 'AI ಆದೇಶ ರಚನೆ ಪ್ರಾರಂಭಿಸಿ →'
                  : 'Generate AI Order → / AI ಆದೇಶ ರಚನೆ ಪ್ರಾರಂಭಿಸಿ'}
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
