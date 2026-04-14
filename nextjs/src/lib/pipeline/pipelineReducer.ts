/**
 * Aadesh AI — Pipeline State Reducer
 * Manages the full pipeline state machine client-side.
 * Property 26: Officer answers are preserved after any pipeline failure.
 */

import type { PipelineState, PipelineAction } from './types';

export const initialPipelineState: PipelineState = {
  step: 'upload',
  caseType: null,
  caseSummary: null,
  aiQuestions: [],
  officerAnswers: null,
  generatedText: '',
  editedText: '',
  guardrailScore: null,
  orderId: null,
  error: null,
  retryCount: 0,
  credits: 0,
  sessionOrderCount: 0,
  modelUsed: null,
  inputTokens: null,
  outputTokens: null,
  promptVersion: 'V3.2.1',
};

export function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, error: null };

    case 'SET_CASE_SUMMARY':
      return {
        ...state,
        caseSummary: action.caseSummary,
        aiQuestions: action.aiQuestions,
        caseType: action.caseType,
        step: 'questions',
        error: null,
      };

    case 'SET_ANSWERS':
      return {
        ...state,
        officerAnswers: action.answers,
        step: 'generating',
        error: null,
      };

    case 'APPEND_STREAM':
      // FIX C7: only update generatedText during streaming — editedText synced on SET_GENERATED_TEXT
      // Updating editedText here clobbers any in-progress user edits during correction stream
      return {
        ...state,
        generatedText: state.generatedText + action.chunk,
      };

    case 'SET_GENERATED_TEXT':
      return {
        ...state,
        generatedText: action.text,
        editedText: action.text,
        guardrailScore: action.guardrailScore,
        modelUsed: action.modelUsed ?? state.modelUsed,
        inputTokens: action.inputTokens ?? state.inputTokens,
        outputTokens: action.outputTokens ?? state.outputTokens,
        step: 'preview',
        error: null,
        retryCount: 0,
        sessionOrderCount: state.sessionOrderCount + 1,
      };

    case 'SET_EDITED_TEXT':
      return { ...state, editedText: action.text };

    case 'SET_ERROR':
      // CRITICAL: preserve officerAnswers on any error (Property 26)
      return {
        ...state,
        error: action.error,
        // Do NOT change step — stay at current step so officer can retry
        // Do NOT clear officerAnswers
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_CREDITS':
      return { ...state, credits: action.credits };

    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };

    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };

    case 'SET_ORDER_ID':
      return { ...state, orderId: action.orderId };

    // FIX B11: INCREMENT_SESSION_ORDER_COUNT removed — SET_GENERATED_TEXT (above) already increments.
    // Dispatching both would double-count session orders.

    default:
      return state;
  }
}
