/**
 * Property and unit tests for parseCaseSummary (vision-read route)
 * Feature: generation-pipeline
 * Properties 4, 5, 6
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Inline the parseCaseSummary logic for testing (mirrors the route implementation)
interface ParsedVisionResponse {
  caseType: string;
  parties: { petitioner: string; respondent: string };
  keyFacts: string[];
  reliefSought: string;
  questions: string[];
}

function parseCaseSummary(rawResponse: string): ParsedVisionResponse {
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Vision response');

  let parsed: Partial<ParsedVisionResponse>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Invalid JSON in Vision response');
  }

  if (!parsed.caseType || typeof parsed.caseType !== 'string' || !parsed.caseType.trim())
    throw new Error('Missing or empty caseType');
  if (!parsed.parties?.petitioner || !parsed.parties?.respondent)
    throw new Error('Missing parties');
  if (!Array.isArray(parsed.keyFacts) || parsed.keyFacts.length === 0)
    throw new Error('Missing or empty keyFacts');
  if (!parsed.reliefSought || typeof parsed.reliefSought !== 'string' || !parsed.reliefSought.trim())
    throw new Error('Missing or empty reliefSought');
  if (!Array.isArray(parsed.questions) || parsed.questions.length < 4 || parsed.questions.length > 5)
    throw new Error(`questions array must have 4-5 items, got ${parsed.questions?.length ?? 0}`);

  return parsed as ParsedVisionResponse;
}

const makeValidResponse = (questions: string[]) => JSON.stringify({
  caseType: 'contested_appeal',
  parties: { petitioner: 'ರಾಮಯ್ಯ', respondent: 'ಕೃಷ್ಣಪ್ಪ' },
  keyFacts: ['ಸರ್ವೆ ನಂ 45/2', 'ಗ್ರಾಮ ಹೆಸರಘಟ್ಟ'],
  reliefSought: 'ಪೋಡಿ ರದ್ದು',
  questions,
});

describe('parseCaseSummary — Property 5: Case summary always contains all required fields', () => {
  it('throws when caseType is missing', () => {
    const json = JSON.stringify({
      parties: { petitioner: 'A', respondent: 'B' },
      keyFacts: ['fact'],
      reliefSought: 'relief',
      questions: ['q1', 'q2', 'q3', 'q4'],
    });
    expect(() => parseCaseSummary(json)).toThrow();
  });

  it('throws when parties is missing', () => {
    const json = JSON.stringify({
      caseType: 'appeal',
      keyFacts: ['fact'],
      reliefSought: 'relief',
      questions: ['q1', 'q2', 'q3', 'q4'],
    });
    expect(() => parseCaseSummary(json)).toThrow();
  });

  it('throws when keyFacts is empty', () => {
    const json = JSON.stringify({
      caseType: 'appeal',
      parties: { petitioner: 'A', respondent: 'B' },
      keyFacts: [],
      reliefSought: 'relief',
      questions: ['q1', 'q2', 'q3', 'q4'],
    });
    expect(() => parseCaseSummary(json)).toThrow();
  });

  it('throws when reliefSought is empty', () => {
    const json = JSON.stringify({
      caseType: 'appeal',
      parties: { petitioner: 'A', respondent: 'B' },
      keyFacts: ['fact'],
      reliefSought: '',
      questions: ['q1', 'q2', 'q3', 'q4'],
    });
    expect(() => parseCaseSummary(json)).toThrow();
  });

  it('succeeds with all required fields present', () => {
    const result = parseCaseSummary(makeValidResponse(['q1', 'q2', 'q3', 'q4']));
    expect(result.caseType).toBe('contested_appeal');
    expect(result.parties.petitioner).toBe('ರಾಮಯ್ಯ');
    expect(result.keyFacts).toHaveLength(2);
    expect(result.reliefSought).toBe('ಪೋಡಿ ರದ್ದು');
  });
});

describe('parseCaseSummary — Property 6: Vision_Reader returns 4 to 5 questions', () => {
  it('accepts exactly 4 questions', () => {
    const result = parseCaseSummary(makeValidResponse(['q1', 'q2', 'q3', 'q4']));
    expect(result.questions).toHaveLength(4);
  });

  it('accepts exactly 5 questions', () => {
    const result = parseCaseSummary(makeValidResponse(['q1', 'q2', 'q3', 'q4', 'q5']));
    expect(result.questions).toHaveLength(5);
  });

  it('throws when fewer than 4 questions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        (count) => {
          const questions = Array.from({ length: count }, (_, i) => `q${i + 1}`);
          expect(() => parseCaseSummary(makeValidResponse(questions))).toThrow();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('throws when more than 5 questions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 20 }),
        (count) => {
          const questions = Array.from({ length: count }, (_, i) => `q${i + 1}`);
          expect(() => parseCaseSummary(makeValidResponse(questions))).toThrow();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('throws on invalid JSON', () => {
    expect(() => parseCaseSummary('not json')).toThrow();
    expect(() => parseCaseSummary('')).toThrow();
  });

  it('extracts JSON from markdown code blocks', () => {
    const wrapped = '```json\n' + makeValidResponse(['q1', 'q2', 'q3', 'q4']) + '\n```';
    const result = parseCaseSummary(wrapped);
    expect(result.caseType).toBe('contested_appeal');
  });
});
