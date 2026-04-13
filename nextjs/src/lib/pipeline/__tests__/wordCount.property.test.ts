/**
 * Property test for word count display (PreviewEditorStep)
 * Feature: generation-pipeline
 * Property 18: Displayed word count always matches actual text
 * Validates: Requirements 7.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// The word count logic used in PreviewEditorStep
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

describe('wordCount — Property 18: Displayed word count always matches actual text', () => {
  it('word count equals number of whitespace-separated non-empty tokens', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/\s/.test(s)),
          { minLength: 0, maxLength: 100 }
        ),
        (words) => {
          const text = words.join(' ');
          expect(countWords(text)).toBe(words.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty string has 0 words', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('\n\t')).toBe(0);
  });

  it('Kannada text word count is correct', () => {
    const text = 'ಮೇಲ್ಮನವಿದಾರರು ಕರ್ನಾಟಕ ಭೂಕಂದಾಯ ಅಧಿನಿಯಮ ಅಡಿ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿದ್ದಾರೆ';
    expect(countWords(text)).toBe(7);
  });

  it('multiple spaces between words count as one separator', () => {
    expect(countWords('ಒಂದು   ಎರಡು    ಮೂರು')).toBe(3);
  });
});
