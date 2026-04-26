"use client";

/**
 * EntityLockModal — Legal Shield Layer 3
 * Un-dismissable modal for officer to confirm extracted case entities
 * before AI generation. Every confirmed field is attested with a
 * SHA-256 hash server-side and written to audit_log.
 *
 * Behaviour contract:
 *  - No X button, no ESC dismiss, no overlay click dismiss
 *  - All fields must be touched
 *  - Changed fields must carry a conflict reason + optional free text
 *  - Typed-name fuzzy match against officerAnswers.officerName
 *  - Total field dwell time > 15 000 ms before submit unlocks
 */

import React, { useState, useCallback, useRef } from 'react';
import type { PipelineAction, PipelineState, CaseSummary } from '@/lib/pipeline/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EntityLockModalProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  state: PipelineState;
  userId: string;
}

type ConflictCategory =
  | 'Matches Aadhaar'
  | 'Matches sale deed'
  | 'Matches survey sketch'
  | "Matches appellant's statement"
  | 'Matches mutation register'
  | 'Other (specify)';

interface FieldState {
  value: string;
  touched: boolean;
  conflictCategory: ConflictCategory | '';
  conflictOtherText: string;
}

type FieldKey = 'petitioner' | 'respondent' | 'reliefSought' | `keyFact_${number}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fuzzyMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase();
  return norm(a).includes(norm(b)) || norm(b).includes(norm(a));
}

function buildInitialFields(caseSummary: CaseSummary): Record<FieldKey, FieldState> {
  const fields: Record<string, FieldState> = {};

  fields['petitioner'] = {
    value: caseSummary.parties.petitioner,
    touched: false,
    conflictCategory: '',
    conflictOtherText: '',
  };
  fields['respondent'] = {
    value: caseSummary.parties.respondent,
    touched: false,
    conflictCategory: '',
    conflictOtherText: '',
  };
  fields['reliefSought'] = {
    value: caseSummary.reliefSought,
    touched: false,
    conflictCategory: '',
    conflictOtherText: '',
  };
  caseSummary.keyFacts.forEach((fact, idx) => {
    fields[`keyFact_${idx}`] = {
      value: fact,
      touched: false,
      conflictCategory: '',
      conflictOtherText: '',
    };
  });

  return fields as Record<FieldKey, FieldState>;
}

function buildOriginalValues(caseSummary: CaseSummary): Record<FieldKey, string> {
  const orig: Record<string, string> = {
    petitioner: caseSummary.parties.petitioner,
    respondent: caseSummary.parties.respondent,
    reliefSought: caseSummary.reliefSought,
  };
  caseSummary.keyFacts.forEach((fact, idx) => {
    orig[`keyFact_${idx}`] = fact;
  });
  return orig as Record<FieldKey, string>;
}

const CONFLICT_CATEGORIES: ConflictCategory[] = [
  'Matches Aadhaar',
  'Matches sale deed',
  'Matches survey sketch',
  "Matches appellant's statement",
  'Matches mutation register',
  'Other (specify)',
];

const NOTO_SANS_KANNADA: React.CSSProperties = {
  fontFamily: "'Noto Sans Kannada', sans-serif",
};

// ── Main Component ────────────────────────────────────────────────────────────

// FIX: 2026-04-26 - Keep unused userId out of destructuring because Next build fails on unused props.
export function EntityLockModal({ dispatch, locale, state }: EntityLockModalProps) {
  const kn = locale === 'kn';
  const caseSummary = state.caseSummary;

  const [fields, setFields] = useState<Record<FieldKey, FieldState>>(() =>
    caseSummary ? buildInitialFields(caseSummary) : ({} as Record<FieldKey, FieldState>)
  );

  const originalValues = useRef<Record<FieldKey, string>>(
    caseSummary ? buildOriginalValues(caseSummary) : ({} as Record<FieldKey, string>)
  );

  // Dwell time tracking: fieldKey → accumulated ms
  const [fieldTimings, setFieldTimings] = useState<Record<string, number>>({});
  const focusStart = useRef<Record<string, number>>({});

  const [typedName, setTypedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Dwell time handlers ────────────────────────────────────────────────────

  const handleFocus = useCallback((key: FieldKey) => {
    focusStart.current[key] = Date.now();
  }, []);

  const handleBlur = useCallback((key: FieldKey) => {
    const start = focusStart.current[key];
    if (start === undefined) return;
    const elapsed = Date.now() - start;
    delete focusStart.current[key];
    setFieldTimings(prev => ({ ...prev, [key]: (prev[key] ?? 0) + elapsed }));
  }, []);

  // ── Field update ───────────────────────────────────────────────────────────

  const updateField = useCallback((key: FieldKey, patch: Partial<FieldState>) => {
    setFields(prev => ({
      ...prev,
      [key]: { ...prev[key], ...patch, touched: true },
    }));
  }, []);

  // ── Submit gate ────────────────────────────────────────────────────────────

  const fieldKeys = Object.keys(fields) as FieldKey[];

  const allTouched = fieldKeys.every(k => fields[k].touched);

  const changedFieldsWithoutReason = fieldKeys.filter(k => {
    const f = fields[k];
    const isChanged = f.value.trim() !== (originalValues.current[k] ?? '').trim();
    if (!isChanged) return false;
    if (!f.conflictCategory) return true;
    if (f.conflictCategory === 'Other (specify)' && f.conflictOtherText.trim().length < 1) return true;
    return false;
  });

  const nameMatches =
    typedName.trim().length > 0 &&
    fuzzyMatch(typedName, state.officerAnswers?.officerName ?? '');

  const totalDwellMs = Object.values(fieldTimings).reduce((a, b) => a + b, 0);
  const dwellOk = totalDwellMs >= 15_000;

  const canSubmit =
    allTouched &&
    changedFieldsWithoutReason.length === 0 &&
    nameMatches &&
    dwellOk &&
    !isSubmitting;

  // ── Submit handler ─────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!canSubmit || !state.receiptId) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const confirmed_fields: Record<string, string> = {};
    const conflict_reasons: Record<string, string> = {};

    for (const key of fieldKeys) {
      const f = fields[key];
      confirmed_fields[key] = f.value;
      const isChanged = f.value.trim() !== (originalValues.current[key] ?? '').trim();
      if (isChanged && f.conflictCategory) {
        conflict_reasons[key] =
          f.conflictCategory === 'Other (specify)'
            ? `Other: ${f.conflictOtherText.trim()}`
            : f.conflictCategory;
      }
    }

    try {
      const { getAuthToken } = await import('@/lib/pipeline/getAuthToken');
      const authToken = getAuthToken();
      const res = await fetch('/api/pipeline/entity-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          receipt_id: state.receiptId,
          confirmed_fields,
          conflict_reasons,
          field_timings: fieldTimings,
          typed_name: typedName.trim(),
          attested_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Attestation failed');
      }

      const data = (await res.json()) as { attestation_hash: string };
      dispatch({ type: 'SET_ATTESTATION', attestationHash: data.attestation_hash });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSubmitError(
        kn
          ? `ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ: ${msg} / Attestation failed: ${msg}`
          : `Attestation failed: ${msg} / ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ: ${msg}`
      );
      setIsSubmitting(false);
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderField(key: FieldKey, label: string, labelKn: string) {
    const f = fields[key];
    if (!f) return null;

    const isChanged = f.value.trim() !== (originalValues.current[key] ?? '').trim();

    return (
      <div key={key} className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          <span style={NOTO_SANS_KANNADA}>{labelKn}</span>
          {' / '}
          <span>{label}</span>
        </label>

        <textarea
          rows={2}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
          value={f.value}
          onFocus={() => handleFocus(key)}
          onBlur={() => handleBlur(key)}
          onChange={e => updateField(key, { value: e.target.value })}
          style={NOTO_SANS_KANNADA}
        />

        {isChanged && (
          <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-800 mb-2">
              <span style={NOTO_SANS_KANNADA}>ಮಾರ್ಪಾಡಿಗೆ ಕಾರಣ / </span>
              Reason for change (required)
            </p>
            <select
              className="w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              value={f.conflictCategory}
              onChange={e =>
                updateField(key, { conflictCategory: e.target.value as ConflictCategory | '' })
              }
            >
              <option value="">— Select reason —</option>
              {CONFLICT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {f.conflictCategory === 'Other (specify)' && (
              <input
                type="text"
                maxLength={30}
                placeholder="Specify reason (max 30 characters)"
                className="mt-2 w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={f.conflictOtherText}
                onChange={e =>
                  updateField(key, { conflictOtherText: e.target.value.slice(0, 30) })
                }
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Guard: no caseSummary ──────────────────────────────────────────────────

  if (!caseSummary) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="rounded-lg bg-white p-8 shadow-2xl">
          <p className="text-red-600">Case summary not loaded. / ಕೇಸ್ ಸಾರಾಂಶ ಲೋಡ್ ಆಗಿಲ್ಲ.</p>
        </div>
      </div>
    );
  }

  // ── Reason why submit is disabled ─────────────────────────────────────────

  const submitDisabledReason = !allTouched
    ? kn
      ? 'ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ / Touch all fields first'
      : 'Touch all fields first / ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ'
    : changedFieldsWithoutReason.length > 0
    ? kn
      ? 'ಮಾರ್ಪಾಡಿಗೆ ಕಾರಣ ನೀಡಿ / Provide reason for all changes'
      : 'Provide reason for all changes / ಮಾರ್ಪಾಡಿಗೆ ಕಾರಣ ನೀಡಿ'
    : !nameMatches
    ? kn
      ? 'ನಿಮ್ಮ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ / Type your registered name'
      : 'Type your registered name to attest / ನಿಮ್ಮ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ'
    : !dwellOk
    ? kn
      ? 'ದಯವಿಟ್ಟು ಕ್ಷೇತ್ರಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪರಿಶೀಲಿಸಿ (ಕನಿಷ್ಠ 15 ಸೆಕೆಂಡ್)'
      : 'Review all fields carefully — 15 seconds minimum'
    : '';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-2 ring-red-700">

        {/* Header — no close button */}
        <div className="flex-shrink-0 bg-red-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white" style={NOTO_SANS_KANNADA}>
            {kn
              ? 'ಕಾನೂನು ಹೊರ ರಕ್ಷಣೆ — ಘಟಕ ದೃಢೀಕರಣ'
              : 'Legal Shield — Entity Lock & Attestation'}
          </h2>
          <p className="mt-1 text-sm text-red-200" style={NOTO_SANS_KANNADA}>
            {kn
              ? 'ಎಲ್ಲ ಘಟಕಗಳನ್ನು ದೃಢೀಕರಿಸಿ. ಈ ಹಂತ ಬಿಟ್ಟು ಹೋಗಲು ಸಾಧ್ಯವಿಲ್ಲ.'
              : 'Confirm all extracted case entities. This step cannot be skipped or dismissed.'}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Parties */}
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span style={NOTO_SANS_KANNADA}>ಪಕ್ಷಕಾರರು / </span>Parties
          </h3>
          {renderField('petitioner', 'Petitioner / Appellant', 'ಮೇಲ್ಮನವಿದಾರರು')}
          {renderField('respondent', 'Respondent', 'ಎದುರುದಾರರು')}

          {/* Key Facts */}
          <h3 className="mb-3 mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span style={NOTO_SANS_KANNADA}>ಪ್ರಮುಖ ಅಂಶಗಳು / </span>Key Facts
          </h3>
          {caseSummary.keyFacts.map((_, idx) =>
            renderField(`keyFact_${idx}`, `Fact ${idx + 1}`, `ಅಂಶ ${idx + 1}`)
          )}

          {/* Relief Sought */}
          <h3 className="mb-3 mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span style={NOTO_SANS_KANNADA}>ಪರಿಹಾರ / </span>Relief Sought
          </h3>
          {renderField('reliefSought', 'Relief Sought', 'ಕೋರಿದ ಪರಿಹಾರ')}

          {/* Legal wording placeholder */}
          <div className="mt-6 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <p style={NOTO_SANS_KANNADA} className="mb-1 font-semibold text-gray-600">
              [LEGAL_WORDING_PLACEHOLDER_KN]
            </p>
            <p className="text-gray-500 text-xs">[LEGAL_WORDING_PLACEHOLDER_EN]</p>
          </div>

          {/* Typed-name attestation */}
          <div className="mt-6">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              <span style={NOTO_SANS_KANNADA}>ನಿಮ್ಮ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ / </span>
              Type your name to attest
            </label>
            <input
              type="text"
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
                typedName && !nameMatches
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                  : nameMatches
                  ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder={kn ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು...' : 'Your full name...'}
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              style={NOTO_SANS_KANNADA}
            />
            {typedName.length > 0 && !nameMatches && (
              <p className="mt-1 text-xs text-red-600" style={NOTO_SANS_KANNADA}>
                {kn
                  ? 'ಹೆಸರು ಹೊಂದಾಣಿಕೆ ಆಗಿಲ್ಲ. ಅಧಿಕಾರಿ ದಾಖಲಾತಿಯ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ.'
                  : 'Name does not match officer records. Type your registered officer name.'}
              </p>
            )}
            {nameMatches && (
              <p className="mt-1 text-xs text-green-700" style={NOTO_SANS_KANNADA}>
                {kn ? 'ಹೆಸರು ದೃಢೀಕರಿಸಲಾಗಿದೆ ✓' : 'Name verified ✓ / ಹೆಸರು ದೃಢೀಕರಿಸಲಾಗಿದೆ'}
              </p>
            )}
          </div>

          {/* Dwell-time progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span style={NOTO_SANS_KANNADA}>
                {kn ? 'ಪರಿಶೀಲನೆ ಸಮಯ / Review time' : 'Review time / ಪರಿಶೀಲನೆ ಸಮಯ'}
              </span>
              <span>
                {Math.min(Math.round(totalDwellMs / 1000), 15)}s / 15s
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  dwellOk ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min((totalDwellMs / 15_000) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Inline submit error — does NOT dispatch SET_ERROR, stays on this step */}
          {submitError && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span style={NOTO_SANS_KANNADA}>{submitError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          {submitDisabledReason && (
            <p className="mb-2 text-xs text-amber-700" style={NOTO_SANS_KANNADA}>
              {submitDisabledReason}
            </p>
          )}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isSubmitting ? (
              <span style={NOTO_SANS_KANNADA}>
                {kn ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Attesting... / ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...'}
              </span>
            ) : (
              <span style={NOTO_SANS_KANNADA}>
                {kn
                  ? 'ತಾರ್ಕಿಕ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ →'
                  : 'Continue to Reasoning → / ತಾರ್ಕಿಕ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
