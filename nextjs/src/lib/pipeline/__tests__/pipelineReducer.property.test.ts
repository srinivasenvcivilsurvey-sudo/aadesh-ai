/**
 * Property tests for pipelineReducer
 * Feature: generation-pipeline
 * Properties 3, 12, 13, 26
 * Validates: Requirements 5.5, 5.6, 10.1, 10.3, 10.4, 12.1, 12.2, 12.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { pipelineReducer, initialPipelineState } from '../pipelineReducer';
import type { PipelineState, OfficerAnswers, PipelineError } from '../types';

const makeAnswers = (): OfficerAnswers => ({
  outcome: 'Allowed',
  officerName: 'ರಾಮಕೃಷ್ಣ',
  orderDate: '2024-04-05',
  aiQuestionAnswer: 'test',
});

const makeError = (): PipelineError => ({
  code: 'GENERATION_ERROR',
  message: 'Generation failed',
  messageKn: 'ರಚನೆ ವಿಫಲ',
  retryable: true,
});

describe('pipelineReducer — Property 26: Officer answers preserved after any failure', () => {
  it('SET_ERROR never clears officerAnswers', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (errorMsg) => {
          const stateWithAnswers: PipelineState = {
            ...initialPipelineState,
            step: 'generating',
            officerAnswers: makeAnswers(),
          };

          const error: PipelineError = {
            code: 'GENERATION_ERROR',
            message: errorMsg,
            messageKn: errorMsg,
            retryable: true,
          };

          const newState = pipelineReducer(stateWithAnswers, { type: 'SET_ERROR', error });

          // Answers must be preserved
          expect(newState.officerAnswers).toEqual(makeAnswers());
          // Step must not regress
          expect(newState.step).toBe('generating');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('step does not change on SET_ERROR', () => {
    const steps = ['upload', 'reading', 'questions', 'generating', 'preview', 'downloading'] as const;
    fc.assert(
      fc.property(
        fc.constantFrom(...steps),
        (step) => {
          const state: PipelineState = { ...initialPipelineState, step };
          const newState = pipelineReducer(state, { type: 'SET_ERROR', error: makeError() });
          expect(newState.step).toBe(step);
        }
      ),
      { numRuns: 30 }
    );
  });
});

describe('pipelineReducer — Property 13: Generation blocked when credits are zero', () => {
  it('SET_CREDITS to 0 reflects in state', () => {
    const state = pipelineReducer(initialPipelineState, { type: 'SET_CREDITS', credits: 0 });
    expect(state.credits).toBe(0);
  });

  it('SET_CREDITS preserves other state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (credits) => {
          const stateWithAnswers: PipelineState = {
            ...initialPipelineState,
            officerAnswers: makeAnswers(),
          };
          const newState = pipelineReducer(stateWithAnswers, { type: 'SET_CREDITS', credits });
          expect(newState.credits).toBe(credits);
          expect(newState.officerAnswers).toEqual(makeAnswers());
        }
      ),
      { numRuns: 30 }
    );
  });
});

describe('pipelineReducer — SET_GENERATED_TEXT', () => {
  it('moves to preview step and stores text', () => {
    const state = pipelineReducer(initialPipelineState, {
      type: 'SET_GENERATED_TEXT',
      text: 'ಆದೇಶ ಪಠ್ಯ',
      guardrailScore: 3,
      modelUsed: 'claude-sonnet-4-6',
      inputTokens: 1000,
      outputTokens: 500,
    });
    expect(state.step).toBe('preview');
    expect(state.generatedText).toBe('ಆದೇಶ ಪಠ್ಯ');
    expect(state.editedText).toBe('ಆದೇಶ ಪಠ್ಯ');
    expect(state.guardrailScore).toBe(3);
    expect(state.modelUsed).toBe('claude-sonnet-4-6');
    expect(state.inputTokens).toBe(1000);
    expect(state.outputTokens).toBe(500);
    expect(state.sessionOrderCount).toBe(1);
  });

  it('resets retryCount on successful generation', () => {
    const stateWithRetries: PipelineState = { ...initialPipelineState, retryCount: 2 };
    const newState = pipelineReducer(stateWithRetries, {
      type: 'SET_GENERATED_TEXT',
      text: 'text',
      guardrailScore: 4,
    });
    expect(newState.retryCount).toBe(0);
  });
});

describe('pipelineReducer — SET_EDITED_TEXT', () => {
  it('updates editedText without changing generatedText', () => {
    const state: PipelineState = {
      ...initialPipelineState,
      generatedText: 'original',
      editedText: 'original',
    };
    const newState = pipelineReducer(state, { type: 'SET_EDITED_TEXT', text: 'edited' });
    expect(newState.editedText).toBe('edited');
    expect(newState.generatedText).toBe('original');
  });
});

describe('pipelineReducer — APPEND_STREAM', () => {
  it('accumulates stream chunks in both generatedText and editedText', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
        (chunks) => {
          let state = initialPipelineState;
          for (const chunk of chunks) {
            state = pipelineReducer(state, { type: 'APPEND_STREAM', chunk });
          }
          const expected = chunks.join('');
          expect(state.generatedText).toBe(expected);
          expect(state.editedText).toBe(expected);
        }
      ),
      { numRuns: 30 }
    );
  });
});
