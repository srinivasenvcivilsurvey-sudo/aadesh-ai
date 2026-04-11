"use client";

import React, { useReducer, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { pipelineReducer, initialPipelineState } from '@/lib/pipeline/pipelineReducer';
import { FileUploadStep } from '@/components/pipeline/FileUploadStep';
import { VisionReadingStep } from '@/components/pipeline/VisionReadingStep';
import { QuestionsStep } from '@/components/pipeline/QuestionsStep';
import { GeneratingStep } from '@/components/pipeline/GeneratingStep';
import { PreviewEditorStep } from '@/components/pipeline/PreviewEditorStep';
import { DownloadStep } from '@/components/pipeline/DownloadStep';
import type { PipelineStep } from '@/lib/pipeline/types';

// Simple case types that skip Vision reading
const SIMPLE_CASE_TYPES = new Set(['withdrawal', 'suo_motu']);

const STEP_LABELS: Record<PipelineStep, { en: string; kn: string }> = {
  upload:      { en: 'Upload',    kn: 'ಅಪ್\u200Cಲೋಡ್' },
  reading:     { en: 'Reading',   kn: 'ಓದುತ್ತಿದೆ' },
  questions:   { en: 'Questions', kn: 'ಪ್ರಶ್ನೆಗಳು' },
  generating:  { en: 'Generate',  kn: 'ರಚಿಸಿ' },
  preview:     { en: 'Review',    kn: 'ಪರಿಶೀಲಿಸಿ' },
  downloading: { en: 'Download',  kn: 'ಡೌನ್\u200Cಲೋಡ್' },
};

const STEP_ORDER: PipelineStep[] = ['upload', 'reading', 'questions', 'generating', 'preview', 'downloading'];

export default function PipelinePage() {
  const { user, loading } = useGlobal();
  const { locale } = useLanguage();
  const [state, dispatch] = useReducer(pipelineReducer, initialPipelineState);

  const kn = locale === 'kn';
  const isSimplePath = SIMPLE_CASE_TYPES.has(state.caseType ?? '');
  const officerName = state.officerAnswers?.officerName ?? user?.email?.split('@')[0] ?? '';

  const currentStepIndex = STEP_ORDER.indexOf(state.step);

  // onComplete for GeneratingStep — refresh profile after generation
  const handleGenerationComplete = useCallback(() => {
    // GeneratingStep already dispatches SET_GENERATED_TEXT which moves to 'preview'
    // Nothing extra needed here
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">
        {kn ? 'ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ' : 'Please log in to continue'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}>
          {kn ? 'ಹೊಸ ಆದೇಶ ತಯಾರಿಸಿ' : 'Generate New Order'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {kn ? 'AI ಸಹಾಯದಿಂದ ಸರಕಾರಿ ಕನ್ನಡ ಆದೇಶ ಕರಡು' : 'AI-assisted Sarakari Kannada order draft'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          {STEP_ORDER.map((step, i) => {
            const label = STEP_LABELS[step];
            const isDone = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone    ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-primary-600 text-white' :
                              'bg-gray-200 text-gray-400'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${isCurrent ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                  {kn ? label.kn : label.en}
                </span>
              </div>
            );
          })}
        </div>
        {/* Connector line */}
        <div className="relative h-1 bg-gray-200 rounded-full mx-3">
          <div
            className="absolute top-0 left-0 h-1 bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStepIndex / (STEP_ORDER.length - 1)) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right">
          {kn ? `ಹಂತ ${currentStepIndex + 1} / ${STEP_ORDER.length}` : `Step ${currentStepIndex + 1} of ${STEP_ORDER.length}`}
        </p>
      </div>

      {/* Step renderer */}
      {state.step === 'upload' && (
        <FileUploadStep
          dispatch={dispatch}
          locale={locale}
          isSimplePath={isSimplePath}
        />
      )}

      {state.step === 'reading' && (
        <VisionReadingStep
          dispatch={dispatch}
          locale={locale}
        />
      )}

      {state.step === 'questions' && (
        <QuestionsStep
          dispatch={dispatch}
          locale={locale}
          aiQuestions={state.aiQuestions}
          officerName={officerName}
          isSimplePath={isSimplePath}
        />
      )}

      {state.step === 'generating' && (
        <GeneratingStep
          dispatch={dispatch}
          locale={locale}
          state={state}
          userId={user.id}
          onComplete={handleGenerationComplete}
        />
      )}

      {state.step === 'preview' && (
        <PreviewEditorStep
          dispatch={dispatch}
          locale={locale}
          state={state}
        />
      )}

      {state.step === 'downloading' && (
        <DownloadStep
          dispatch={dispatch}
          locale={locale}
          state={state}
          userId={user.id}
          officerName={officerName}
        />
      )}
    </div>
  );
}
