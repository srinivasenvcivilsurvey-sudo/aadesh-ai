/**
 * Property and unit tests for auditOrder
 * Feature: generation-pipeline
 * Properties 14, 15, 16, 23
 * Validates: Requirements 6.2–6.7, 9.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { auditOrder } from '../auditOrder';
import type { CaseSummary } from '../types';

const makeSummary = (keyFacts: string[] = ['ಸರ್ವೆ ನಂ 45/2']): CaseSummary => ({
  caseType: 'appeal',
  parties: { petitioner: 'ಅರ್ಜಿದಾರ', respondent: 'ಎದುರುದಾರ' },
  keyFacts,
  reliefSought: 'ಪೋಡಿ ರದ್ದು',
});

// A minimal valid appeal order with all required sections
const VALID_APPEAL_ORDER = `
ನ್ಯಾಯಾಲಯ ಶೀರ್ಷಿಕೆ
ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 123/2024
ಮೇಲ್ಮನವಿದಾರರು: ರಾಮಯ್ಯ
ಎದುರುದಾರರು: ಕೃಷ್ಣಪ್ಪ
ಸರ್ವೆ ನಂ 45/2 ಕುರಿತು ಮೇಲ್ಮನವಿ
ಪ್ರಸ್ತಾವನೆ: ಮೇಲ್ಮನವಿದಾರರು ಕರ್ನಾಟಕ ಭೂಕಂದಾಯ ಅಧಿನಿಯಮ ಅಡಿ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿದ್ದಾರೆ
ನ್ಯಾಯಾಲಯದ ಅಭಿಪ್ರಾಯ: ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ
ಆದೇಶ: ಮೇಲ್ಮನವಿಯನ್ನು ಪುರಸ್ಕರಿಸಿದೆ
ಸಹಿ/-
ಅಧಿಕಾರಿ ಹೆಸರು
`.repeat(30); // ~600+ words

describe('auditOrder — Property 14: Each guardrail check is correct', () => {
  it('kannadaPurity is false when Latin words appear in body', async () => {
    const orderWithEnglish = VALID_APPEAL_ORDER + '\nappeal dismissed by court';
    const result = await auditOrder(orderWithEnglish, makeSummary(), 'appeal');
    expect(result.kannadaPurity).toBe(false);
  });

  it('factPreservation is false when key facts are missing from output', async () => {
    // Use a unique fact that definitely won't appear in the base order text
    const uniqueFact = 'ಸರ್ವೆ ನಂ 999/888';
    const result = await auditOrder(VALID_APPEAL_ORDER, makeSummary([uniqueFact]), 'appeal');
    expect(result.factPreservation).toBe(false);
  });

  it('factPreservation is true when all key facts appear in output', async () => {
    const result = await auditOrder(VALID_APPEAL_ORDER, makeSummary(['ಸರ್ವೆ ನಂ 45/2']), 'appeal');
    expect(result.factPreservation).toBe(true);
  });
});

describe('auditOrder — Property 15: Guardrail score equals count of passing checks', () => {
  it('score always equals number of true checks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        async (includeEnglish) => {
          const text = includeEnglish
            ? VALID_APPEAL_ORDER + '\nappeal'
            : VALID_APPEAL_ORDER;
          const result = await auditOrder(text, makeSummary(['ಸರ್ವೆ ನಂ 45/2']), 'appeal');

          const trueCount = [
            result.sectionCompleteness,
            result.kannadaPurity,
            result.factPreservation,
            result.wordCount,
          ].filter(v => v === true).length;

          expect(result.score).toBe(trueCount);
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('auditOrder — Property 23: Simplified path runs only word count check', () => {
  it('returns null for non-wordCount checks on withdrawal cases', async () => {
    const result = await auditOrder(VALID_APPEAL_ORDER, makeSummary(), 'withdrawal');
    expect(result.sectionCompleteness).toBeNull();
    expect(result.kannadaPurity).toBeNull();
    expect(result.factPreservation).toBeNull();
    expect(result.wordCount).not.toBeNull();
  });

  it('returns null for non-wordCount checks on suo_motu cases', async () => {
    const result = await auditOrder(VALID_APPEAL_ORDER, makeSummary(), 'suo_motu');
    expect(result.sectionCompleteness).toBeNull();
    expect(result.kannadaPurity).toBeNull();
    expect(result.factPreservation).toBeNull();
  });
});

describe('auditOrder — Unit tests', () => {
  it('word count check passes for text with 550+ words', async () => {
    const longText = 'ಕನ್ನಡ '.repeat(600);
    const result = await auditOrder(longText, makeSummary([]), 'appeal');
    expect(result.wordCount).toBe(true);
  });

  it('word count check fails for text with fewer than 400 words', async () => {
    const shortText = 'ಕನ್ನಡ '.repeat(100);
    const result = await auditOrder(shortText, makeSummary([]), 'appeal');
    expect(result.wordCount).toBe(false);
  });

  it('score is 0-4 for full path', async () => {
    const result = await auditOrder(VALID_APPEAL_ORDER, makeSummary(), 'appeal');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(4);
  });
});
