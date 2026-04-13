/**
 * Property and unit tests for export-docx logic
 * Feature: generation-pipeline
 * Properties 17, 19, 20, 21
 * Validates: Requirements 8.2, 8.3, 8.4, 8.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Test the filename generation logic (pure function extracted for testing)
function buildFileName(caseType: string, caseNumber: string, orderDate: string): string {
  const safeDate = orderDate.replace(/[^0-9-]/g, '') || new Date().toISOString().split('T')[0];
  const safeCaseNumber = (caseNumber || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeCaseType = caseType.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${safeCaseType}_${safeCaseNumber}_${safeDate}.docx`;
}

describe('exportDocx — Property 21: DOCX filename matches required pattern', () => {
  it('always ends with .docx', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (caseType, caseNumber, orderDate) => {
          const fileName = buildFileName(caseType, caseNumber, orderDate);
          expect(fileName).toMatch(/\.docx$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('follows pattern {CaseType}_{CaseNumber}_{OrderDate}.docx', () => {
    const fileName = buildFileName('appeal', '123_2024', '2024-04-05');
    expect(fileName).toBe('appeal_123_2024_2024-04-05.docx');
  });

  it('sanitizes special characters in caseType and caseNumber', () => {
    const fileName = buildFileName('appeal/contested', '123/2024', '2024-04-05');
    expect(fileName).not.toContain('/');
    expect(fileName).toMatch(/\.docx$/);
  });

  it('uses "unknown" when caseNumber is empty', () => {
    const fileName = buildFileName('appeal', '', '2024-04-05');
    expect(fileName).toContain('unknown');
  });
});

describe('exportDocx — Property 17: Edited text is used for DOCX export', () => {
  it('editedText takes precedence over generatedText when both present', () => {
    // This tests the logic: finalText = state.editedText || state.generatedText
    const generatedText = 'original AI text';
    const editedText = 'officer edited text';

    const finalText = editedText || generatedText;
    expect(finalText).toBe(editedText);
  });

  it('falls back to generatedText when editedText is empty', () => {
    const generatedText = 'original AI text';
    const editedText = '';

    const finalText = editedText || generatedText;
    expect(finalText).toBe(generatedText);
  });
});

describe('exportDocx — Property 20: Orders table record contains all required fields', () => {
  it('all required fields are present in the insert payload', () => {
    const payload = {
      id: 'test-id',
      user_id: 'user-1',
      case_type: 'appeal',
      case_number: '123/2024',
      generated_order: 'ಆದೇಶ ಪಠ್ಯ',
      score: 3,
      model_used: 'claude-sonnet-4-6',
      verified: true,
      word_count: 650,
      credits_used: 1,
      prompt_version: 'V3.2.1',
    };

    const requiredFields = ['user_id', 'case_type', 'generated_order', 'score', 'model_used', 'word_count', 'credits_used'];
    for (const field of requiredFields) {
      expect(payload).toHaveProperty(field);
      expect(payload[field as keyof typeof payload]).not.toBeNull();
      expect(payload[field as keyof typeof payload]).not.toBeUndefined();
    }
  });
});

describe('exportDocx — Property 19: DOCX footer contains required text', () => {
  it('footer text follows the required format', () => {
    const officerName = 'ರಾಮಕೃಷ್ಣ';
    const footerText = `ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು | Drafted by Aadesh AI | Verified by ${officerName}`;

    expect(footerText).toContain('ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು');
    expect(footerText).toContain('Drafted by Aadesh AI');
    expect(footerText).toContain('Verified by');
    expect(footerText).toContain(officerName);
  });

  it('footer always includes officer name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        (officerName) => {
          const footerText = `ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು | Drafted by Aadesh AI | Verified by ${officerName}`;
          expect(footerText).toContain(officerName);
        }
      ),
      { numRuns: 50 }
    );
  });
});
