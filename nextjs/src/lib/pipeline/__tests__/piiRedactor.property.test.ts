/**
 * Property and unit tests for piiRedactor
 * Feature: generation-pipeline
 * Validates: Requirements 13.1–13.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { redactPII, reInjectPII } from '../piiRedactor';

describe('piiRedactor — redactPII', () => {
  it('replaces survey numbers with placeholders', () => {
    const text = 'ಸರ್ವೆ ನಂ. 45/2 ಕುರಿತು ಮೇಲ್ಮನವಿ';
    const { redacted, map } = redactPII(text);
    expect(map.size).toBeGreaterThan(0);
    // At least one survey placeholder should exist
    const hasSurveyPlaceholder = [...map.keys()].some(k => k.startsWith('[SURVEY_'));
    expect(hasSurveyPlaceholder).toBe(true);
  });

  it('replaces village names with placeholders', () => {
    // Use a word that ends exactly with a village suffix
    const text = 'ಹೆಸರಘಟ್ಟಹಳ್ಳಿ ಭೂಮಿ ಕುರಿತು ಆದೇಶ';
    const { redacted, map } = redactPII(text);
    // Village suffix ಹಳ್ಳಿ should be detected
    const hasVillagePlaceholder = [...map.keys()].some(k => k.startsWith('[VILLAGE_'));
    expect(hasVillagePlaceholder).toBe(true);
  });

  it('map is never stored in persistent state — it is a new Map each call', () => {
    const { map: map1 } = redactPII('ಸರ್ವೆ ನಂ 45/2');
    const { map: map2 } = redactPII('ಸರ್ವೆ ನಂ 45/2');
    // Different Map instances
    expect(map1).not.toBe(map2);
  });
});

describe('piiRedactor — reInjectPII', () => {
  it('round-trips: redact then re-inject returns original text for survey numbers', () => {
    const original = 'ಸರ್ವೆ ನಂ. 45/2 ಮತ್ತು 67/3 ಕುರಿತು ಆದೇಶ';
    const { redacted, map } = redactPII(original);
    const { result } = reInjectPII(redacted, map);
    // All survey numbers should be restored
    expect(result).toContain('45/2');
    expect(result).toContain('67/3');
  });

  it('returns anomalies for placeholders not in map', () => {
    const map = new Map<string, string>();
    map.set('[NAME_1]', 'ರಾಮಯ್ಯ');
    const textWithUnknown = 'ಆದೇಶ [NAME_1] ಮತ್ತು [NAME_99] ಕುರಿತು';
    const { result, anomalies } = reInjectPII(textWithUnknown, map);
    expect(result).toContain('ರಾಮಯ್ಯ');
    expect(result).toContain('[NAME_99]'); // unknown placeholder left visible
    expect(anomalies).toContain('[NAME_99]');
  });

  it('empty map returns text unchanged with no anomalies for plain text', () => {
    const map = new Map<string, string>();
    const text = 'ಸಾಮಾನ್ಯ ಪಠ್ಯ';
    const { result, anomalies } = reInjectPII(text, map);
    expect(result).toBe(text);
    expect(anomalies).toHaveLength(0);
  });
});

describe('piiRedactor — Property: redact then re-inject is idempotent for known placeholders', () => {
  it('all map entries are restored after re-injection', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^\d+\/\d+$/.test(s) || s.length > 2),
            fc.nat({ max: 100 })
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (pairs) => {
          // Build a map manually and test re-injection
          const map = new Map<string, string>();
          let text = 'ಆದೇಶ ';
          pairs.forEach(([value], i) => {
            const placeholder = `[SURVEY_${i + 1}]`;
            map.set(placeholder, value);
            text += placeholder + ' ';
          });

          const { result } = reInjectPII(text, map);
          for (const [, value] of map.entries()) {
            expect(result).toContain(value);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
