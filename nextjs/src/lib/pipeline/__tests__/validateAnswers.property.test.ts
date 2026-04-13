/**
 * Property tests for validateAnswers
 * Feature: generation-pipeline
 * Property 7: Required answer fields block submission when empty
 * Validates: Requirements 3.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateAnswers } from '../validateAnswers';
import type { OfficerAnswers } from '../types';

const validOutcomes = ['Allowed', 'Dismissed', 'Remanded'] as const;

describe('validateAnswers — Property 7: Required fields block submission when empty', () => {
  it('returns valid=true when all required fields are filled', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validOutcomes),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (outcome, officerName, orderDate) => {
          const answers: Partial<OfficerAnswers> = {
            outcome,
            officerName,
            orderDate,
            aiQuestionAnswer: 'some answer',
          };
          const result = validateAnswers(answers);
          expect(result.valid).toBe(true);
          expect(result.missingFields).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns valid=false when outcome is missing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (officerName, orderDate) => {
          const result = validateAnswers({ officerName, orderDate, aiQuestionAnswer: '' });
          expect(result.valid).toBe(false);
          expect(result.missingFields.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('returns valid=false when officerName is empty or whitespace', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validOutcomes),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('', '   ', '\t', '\n'),
        (outcome, orderDate, emptyName) => {
          const result = validateAnswers({ outcome, officerName: emptyName, orderDate, aiQuestionAnswer: '' });
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('returns valid=false when orderDate is missing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validOutcomes),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (outcome, officerName) => {
          const result = validateAnswers({ outcome, officerName, aiQuestionAnswer: '' });
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('missingFields count equals number of missing required fields', () => {
    // All three missing
    const result = validateAnswers({});
    expect(result.missingFields).toHaveLength(3);
    expect(result.valid).toBe(false);
  });
});
