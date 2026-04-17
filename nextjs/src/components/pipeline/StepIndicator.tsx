"use client";

/**
 * StepIndicator — 6-step pipeline progress indicator (Arcada P0 sprint, 2026-04-17)
 *
 * Props:
 *   currentStep  — 1-based index of the active step (1 = upload … 6 = download)
 *
 * Visual states:
 *   completed  — filled green circle + white ✓
 *   active     — filled gov-blue circle + white step number
 *   future     — gray outline circle + gray step number
 *
 * Below each circle: bilingual label (EN bold / KN small muted)
 * Progress bar fills left-to-right as steps complete.
 */

import React from 'react';

interface Step {
  en: string;
  kn: string;
}

const STEPS: Step[] = [
  { en: 'Upload',    kn: 'ಅಪ್\u200Cಲೋಡ್' },
  { en: 'Reading',   kn: 'ಓದುತ್ತಿದೆ' },
  { en: 'Questions', kn: 'ಪ್ರಶ್ನೆಗಳು' },
  { en: 'Generate',  kn: 'ರಚಿಸುತ್ತಿದೆ' },
  { en: 'Review',    kn: 'ಪರಿಶೀಲಿಸಿ' },
  { en: 'Download',  kn: 'ಡೌನ್\u200Cಲೋಡ್' },
];

interface StepIndicatorProps {
  currentStep: number; // 1–6
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progressPct =
    STEPS.length <= 1
      ? 0
      : ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full space-y-3 pb-1">
      {/* Circles row */}
      <div className="flex items-start justify-between">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={step.en} className="flex flex-col items-center flex-1 gap-1.5">
              {/* Circle */}
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 select-none',
                  isDone
                    ? 'bg-green-500 text-white shadow-sm'
                    : isActive
                    ? 'text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-400',
                ].join(' ')}
                style={
                  isActive
                    ? { background: 'var(--color-gov-blue, #1a3a6b)' }
                    : undefined
                }
              >
                {isDone ? '✓' : stepNum}
              </div>

              {/* EN label */}
              <span
                className={[
                  'text-xs font-medium leading-tight text-center hidden sm:block',
                  isActive
                    ? 'text-[#1a3a6b] font-semibold'
                    : isDone
                    ? 'text-green-600'
                    : 'text-gray-400',
                ].join(' ')}
              >
                {step.en}
              </span>

              {/* KN label */}
              <span
                className="text-[10px] leading-tight text-center text-gray-400 hidden sm:block"
                style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}
              >
                {step.kn}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="relative h-1.5 bg-gray-200 rounded-full mx-4">
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'var(--color-gov-blue, #1a3a6b)',
          }}
        />
      </div>

      {/* Step counter */}
      <p className="text-[11px] text-gray-400 text-right pr-1">
        <span className="hidden sm:inline">Step </span>
        {currentStep} / {STEPS.length}
      </p>
    </div>
  );
}
