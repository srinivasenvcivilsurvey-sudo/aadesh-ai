/**
 * Property tests for buildPrompt
 * Feature: generation-pipeline
 * Properties 8, 9, 10, 11, 25
 * Validates: Requirements 4.1–4.6, 11.1, 11.2, 11.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildPrompt, type OfficerProfile, type ReferenceOrder } from '../buildPrompt';
import type { CaseSummary, OfficerAnswers } from '../types';

const makeProfile = (overrides?: Partial<OfficerProfile>): OfficerProfile => ({
  officerName: 'ರಾಮಕೃಷ್ಣ',
  designation: 'ಕ.ಆ.ಸೇ',
  district: 'ಬೆಂಗಳೂರು',
  salutation: 'ಶ್ರೀ',
  ...overrides,
});

const makeRef = (i: number): ReferenceOrder => ({
  id: `ref-${i}`,
  extracted_text: `ಉಲ್ಲೇಖ ಆದೇಶ ${i} — ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ ${i}/2024`,
  case_type_id: 'appeal',
  uploaded_at: new Date(2024, 0, i).toISOString(),
});

const makeSummary = (): CaseSummary => ({
  caseType: 'appeal',
  parties: { petitioner: 'ಅರ್ಜಿದಾರ', respondent: 'ಎದುರುದಾರ' },
  keyFacts: ['ಸರ್ವೆ ನಂ 45/2', 'ಗ್ರಾಮ ಹೆಸರಘಟ್ಟ'],
  reliefSought: 'ಪೋಡಿ ರದ್ದು',
});

const makeAnswers = (): OfficerAnswers => ({
  outcome: 'Allowed',
  officerName: 'ರಾಮಕೃಷ್ಣ',
  orderDate: '2024-04-05',
  aiQuestionAnswer: 'ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ',
});

describe('buildPrompt — Property 8: Prompt structure and cache_control placement', () => {
  it('always has exactly 2 cache_control markers, in correct positions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        (refCount) => {
          const refs = Array.from({ length: refCount }, (_, i) => makeRef(i + 1));
          const { messages } = buildPrompt(makeProfile(), refs, makeSummary(), makeAnswers());

          expect(messages).toHaveLength(1);
          const content = messages[0].content;
          expect(content.length).toBeGreaterThanOrEqual(3);

          // First block: system prompt — must have cache_control
          expect(content[0].cache_control).toEqual({ type: 'ephemeral' });
          // Second block: references — must have cache_control
          expect(content[1].cache_control).toEqual({ type: 'ephemeral' });
          // Third block: case input — must NOT have cache_control
          expect(content[2].cache_control).toBeUndefined();
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('buildPrompt — Property 9: Reference order count is between 1 and 8', () => {
  it('caps references at 8 even when more are provided', () => {
    const refs = Array.from({ length: 15 }, (_, i) => makeRef(i + 1));
    const { messages } = buildPrompt(makeProfile(), refs, makeSummary(), makeAnswers());
    const refsBlock = messages[0].content[1].text;
    // Count "── ಉಲ್ಲೇಖ" markers
    const refMatches = refsBlock.match(/── ಉಲ್ಲೇಖ \d+/g) ?? [];
    expect(refMatches.length).toBeLessThanOrEqual(8);
  });

  it('includes all refs when fewer than 8 are provided', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 7 }),
        (refCount) => {
          const refs = Array.from({ length: refCount }, (_, i) => makeRef(i + 1));
          const { messages } = buildPrompt(makeProfile(), refs, makeSummary(), makeAnswers());
          const refsBlock = messages[0].content[1].text;
          const refMatches = refsBlock.match(/── ಉಲ್ಲೇಖ \d+/g) ?? [];
          expect(refMatches.length).toBe(refCount);
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('buildPrompt — Property 10: Officer profile fields appear in prompt', () => {
  it('profile fields appear in the assembled prompt for known values', () => {
    const profile = makeProfile({ officerName: 'ರಾಮಕೃಷ್ಣ', district: 'ಬೆಂಗಳೂರು' });
    const { messages } = buildPrompt(profile, [makeRef(1)], makeSummary(), makeAnswers());
    // System prompt block (index 0) contains officer name via buildSystemPrompt
    const systemBlock = messages[0].content[0].text;
    expect(systemBlock).toContain('ರಾಮಕೃಷ್ಣ');
    expect(systemBlock).toContain('ಬೆಂಗಳೂರು');
  });

  it('case input block contains the officer name from answers', () => {
    const answers = { ...makeAnswers(), officerName: 'ಕೃಷ್ಣಪ್ಪ' };
    const { messages } = buildPrompt(makeProfile(), [makeRef(1)], makeSummary(), answers);
    const caseBlock = messages[0].content[2].text;
    expect(caseBlock).toContain('ಕೃಷ್ಣಪ್ಪ');
  });
});

describe('buildPrompt — Property 11: Assembled prompt never exceeds 200,000 tokens', () => {
  it('stays within token limit for normal inputs', () => {
    const refs = Array.from({ length: 8 }, (_, i) => makeRef(i + 1));
    const { estimatedTokens } = buildPrompt(makeProfile(), refs, makeSummary(), makeAnswers());
    expect(estimatedTokens).toBeLessThanOrEqual(200_000);
  });
});

describe('buildPrompt — Property 25: No provider.order field in assembled request', () => {
  it('never includes provider.order in the messages array', () => {
    const refs = Array.from({ length: 5 }, (_, i) => makeRef(i + 1));
    const { messages } = buildPrompt(makeProfile(), refs, makeSummary(), makeAnswers());
    const serialized = JSON.stringify(messages);
    expect(serialized).not.toContain('"provider"');
    expect(serialized).not.toContain('"order"');
  });
});

describe('buildPrompt — Unit tests', () => {
  it('handles zero references gracefully', () => {
    expect(() => buildPrompt(makeProfile(), [], makeSummary(), makeAnswers())).not.toThrow();
  });

  it('case input block contains outcome and order date', () => {
    const answers = makeAnswers();
    const { messages } = buildPrompt(makeProfile(), [], makeSummary(), answers);
    const caseBlock = messages[0].content[2].text;
    expect(caseBlock).toContain(answers.outcome);
    expect(caseBlock).toContain('05-04-2024'); // formatted date
  });
});
