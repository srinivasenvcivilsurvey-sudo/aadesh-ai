/**
 * Aadesh AI — Officer Answer Validation
 * Property 7: Required answer fields block submission when empty.
 */

import type { OfficerAnswers } from './types';

export interface AnswerValidationResult {
  valid: boolean;
  missingFields: string[];
}

const REQUIRED_FIELDS: Array<{
  key: keyof OfficerAnswers;
  labelEn: string;
  labelKn: string;
}> = [
  { key: 'outcome',     labelEn: 'Outcome',       labelKn: 'ತೀರ್ಪು' },
  { key: 'officerName', labelEn: 'Officer Name',   labelKn: 'ಅಧಿಕಾರಿ ಹೆಸರು' },
  { key: 'orderDate',   labelEn: 'Order Date',     labelKn: 'ಆದೇಶ ದಿನಾಂಕ' },
];

/**
 * Validates that all required officer answer fields are filled.
 * A field is considered empty if it is null, undefined, or whitespace-only.
 *
 * @param answers - Partial officer answers object
 * @returns { valid, missingFields } — missingFields contains bilingual labels
 */
export function validateAnswers(
  answers: Partial<OfficerAnswers>
): AnswerValidationResult {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = answers[field.key];
    if (value === null || value === undefined || String(value).trim() === '') {
      missingFields.push(`${field.labelKn} / ${field.labelEn}`);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}
