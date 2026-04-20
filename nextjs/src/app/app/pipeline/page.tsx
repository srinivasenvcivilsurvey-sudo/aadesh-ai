"use client";

import React, { useReducer, useCallback, useState, useEffect } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { pipelineReducer, initialPipelineState } from '@/lib/pipeline/pipelineReducer';
import { FileUploadStep } from '@/components/pipeline/FileUploadStep';
import { VisionReadingStep } from '@/components/pipeline/VisionReadingStep';
import { QuestionsStep } from '@/components/pipeline/QuestionsStep';
import { EntityLockModal } from '@/components/pipeline/EntityLockModal';
import { OfficerReasoningStep } from '@/components/pipeline/OfficerReasoningStep';
import { GeneratingStep } from '@/components/pipeline/GeneratingStep';
import { PreviewEditorStep } from '@/components/pipeline/PreviewEditorStep';
import { DownloadStep } from '@/components/pipeline/DownloadStep';
import { PipelineErrorBoundary } from '@/components/pipeline/PipelineErrorBoundary';
import { StepIndicator } from '@/components/pipeline/StepIndicator';
import { createSPAClient } from '@/lib/supabase/client';
import type { PipelineStep } from '@/lib/pipeline/types';

// Simple case types that skip Vision reading
const SIMPLE_CASE_TYPES = new Set(['withdrawal', 'suo_motu']);

const STEP_ORDER: PipelineStep[] = ['upload', 'reading', 'questions', 'entity_lock', 'reasoning', 'generating', 'preview', 'downloading'];

export default function PipelinePage() {
  const { user, loading } = useGlobal();
  const { locale } = useLanguage();
  const [state, dispatch] = useReducer(pipelineReducer, initialPipelineState);

  const kn = locale === 'kn';
  const isSimplePath = SIMPLE_CASE_TYPES.has(state.caseType ?? '');
  const officerName = state.officerAnswers?.officerName ?? user?.email?.split('@')[0] ?? '';

  const currentStepIndex = STEP_ORDER.indexOf(state.step);

  // ── Reference count gate ───────────────────────────────────────────────────
  const [refCount, setRefCount] = useState<number | null>(null);
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createSPAClient();
    supabase
      .from('references')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => {
        setRefCount(count ?? 0);
        setRefLoading(false);
      });
  }, [user?.id]);

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

  if (refLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (refCount !== null && refCount < 5) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-3xl">📂</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            {kn ? 'ಮೊದಲು ಉಲ್ಲೇಖ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ' : 'Upload Reference Orders First'}
          </h1>
          <p className="text-sm text-gray-500">
            {kn
              ? 'AI ತರಬೇತಿಗಾಗಿ ನಿಮ್ಮ ಕನಿಷ್ಠ 5 ಹಳೆಯ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ'
              : 'Upload at least 5 past orders to train AI on your writing style'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{kn ? 'ಪ್ರಗತಿ' : 'Progress'}</span>
            <span>{kn ? `${refCount} / 5 ಅಪ್\u200Cಲೋಡ್ ಆಗಿದೆ` : `${refCount} / 5 uploaded`}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (refCount / 5) * 100)}%` }}
            />
          </div>
        </div>

        <a
          href="/app/my-references"
          className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors"
        >
          {kn ? 'ಉಲ್ಲೇಖಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಲು ಹೋಗಿ →' : 'Go to Upload References →'}
        </a>

        {/* What happens after upload */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-blue-800">
            {kn ? 'ಅಪ್\u200Cಲೋಡ್ ನಂತರ ಏನಾಗುತ್ತದೆ?' : 'What happens after upload?'}
          </p>
          <p className="text-xs text-blue-700">
            {kn
              ? 'AI ನಿಮ್ಮ ಹಳೆಯ ಆದೇಶಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ, ಅದೇ ಶೈಲಿಯಲ್ಲಿ ಹೊಸ ಆದೇಶಗಳನ್ನು ರಚಿಸುತ್ತದೆ'
              : 'AI will analyze your past orders and generate new orders in the same style'}
          </p>
          <ul className="space-y-1 pt-1">
            {[
              { kn: 'ನಿಮ್ಮ ನಿಖರ ರೂಪವನ್ನು ಹೊಂದಿಸುತ್ತದೆ', en: 'Matches your exact format' },
              { kn: 'ನಿಮ್ಮ ಕಾನೂನು ಭಾಷೆಯನ್ನು ಬಳಸುತ್ತದೆ', en: 'Uses your legal language' },
              { kn: 'ಕರಡು ಸಮಯ ಗಂಟೆಗಳಿಂದ ನಿಮಿಷಗಳಿಗೆ ಕಡಿಮೆ', en: 'Drafting time: hours → minutes' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-blue-800">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>{kn ? item.kn : item.en}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sample Output preview */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {kn ? 'ಮಾದರಿ ಔಟ್\u200Cಪುಟ್' : 'Sample Output'}
          </p>
          <div className="text-xs text-gray-600 space-y-1 font-mono leading-relaxed">
            <p className="font-semibold text-gray-700">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
            <p>ಜಿಲ್ಲಾ ನೋಂದಣಿ ಕಚೇರಿ, ಮೈಸೂರು</p>
            <p className="mt-1">ವಿಷಯ: ಭೂ ದಾಖಲೆ ತಿದ್ದುಪಡಿ ಬಗ್ಗೆ ಆದೇಶ</p>
            <p className="mt-1 text-gray-500 italic">
              {kn ? '...ನಿಮ್ಮ ಶೈಲಿಯಲ್ಲಿ ಸಂಪೂರ್ಣ ಆದೇಶ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ' : '...full order generated in your style appears here'}
            </p>
          </div>
        </div>
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

      {/* Step indicator (Arcada P0 sprint, 2026-04-17) */}
      <StepIndicator currentStep={currentStepIndex + 1} />

      {/* Step renderer */}
      <PipelineErrorBoundary onReset={() => dispatch({ type: 'SET_STEP', step: 'upload' })} locale={locale}>
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

      {state.step === 'entity_lock' && (
        <EntityLockModal
          dispatch={dispatch}
          locale={locale}
          state={state}
          userId={user.id}
        />
      )}

      {state.step === 'reasoning' && (
        <OfficerReasoningStep
          dispatch={dispatch}
          locale={locale}
          state={state}
          userId={user.id}
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
      </PipelineErrorBoundary>
    </div>
  );
}
