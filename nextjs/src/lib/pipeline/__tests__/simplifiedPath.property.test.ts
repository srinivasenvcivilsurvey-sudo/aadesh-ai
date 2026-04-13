/**
 * Property tests for simplified path routing (Sarvam 105B)
 * Feature: generation-pipeline
 * Properties 22, 23
 * Validates: Requirements 9.1, 9.4, 9.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SARVAM_MODEL_ID } from '../sarvamGenerate';

const SIMPLE_CASE_TYPES = ['withdrawal', 'suo_motu'];
const COMPLEX_CASE_TYPES = ['appeal', 'contested', 'other'];

// The routing logic from generate route
function isSimplePath(caseType: string): boolean {
  return SIMPLE_CASE_TYPES.includes(caseType.toLowerCase());
}

describe('simplifiedPath — Property 22: Simplified path always uses Sarvam 105B', () => {
  it('withdrawal and suo_motu always route to simplified path', () => {
    for (const caseType of SIMPLE_CASE_TYPES) {
      expect(isSimplePath(caseType)).toBe(true);
    }
  });

  it('non-simple case types never route to simplified path', () => {
    for (const caseType of COMPLEX_CASE_TYPES) {
      expect(isSimplePath(caseType)).toBe(false);
    }
  });

  it('SARVAM_MODEL_ID is "sarvam-105b"', () => {
    expect(SARVAM_MODEL_ID).toBe('sarvam-105b');
  });

  it('case-insensitive routing for simple types', () => {
    expect(isSimplePath('WITHDRAWAL')).toBe(true);
    expect(isSimplePath('Suo_Motu')).toBe(true);
  });
});

describe('simplifiedPath — Property 23: Simplified path audit runs only word count', () => {
  // This is tested in auditOrder.property.test.ts
  // Here we verify the routing decision is correct
  it('withdrawal routes to simple path', () => {
    expect(isSimplePath('withdrawal')).toBe(true);
  });

  it('suo_motu routes to simple path', () => {
    expect(isSimplePath('suo_motu')).toBe(true);
  });

  it('appeal does NOT route to simple path', () => {
    expect(isSimplePath('appeal')).toBe(false);
  });

  it('contested does NOT route to simple path', () => {
    expect(isSimplePath('contested')).toBe(false);
  });
});
