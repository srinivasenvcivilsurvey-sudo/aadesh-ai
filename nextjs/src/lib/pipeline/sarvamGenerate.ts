/**
 * Aadesh AI — Sarvam 105B Generation (Simplified Path)
 * Used for withdrawal and suo_motu cases — FREE tier, no PDF upload needed.
 *
 * Properties validated:
 *   22: Simplified path always uses Sarvam 105B and records it
 *   23: Simplified path audit runs only the word count check
 */

import { generateOrder } from '@/lib/sarvam';
import { buildSystemPrompt } from '@/lib/system-prompt';
import type { CaseSummary, OfficerAnswers } from './types';
import type { OfficerProfile } from './buildPrompt';

export const SARVAM_MODEL_ID = 'sarvam-105b';

export interface SarvamGenerateResult {
  content: string;
  modelUsed: typeof SARVAM_MODEL_ID;
  wordCount: number;
}

/**
 * Generate a withdrawal or suo_motu order using Sarvam 105B.
 * Target: 300–500 words. No PDF upload required — officer fills text form.
 *
 * @param caseSummary - Structured case summary (from text form, not Vision)
 * @param answers - Officer's answers to clarifying questions
 * @param profile - Officer profile for system prompt placeholders
 * @param apiKey - Sarvam API key
 */
export async function sarvamGenerate(
  caseSummary: CaseSummary,
  answers: OfficerAnswers,
  profile: OfficerProfile,
  apiKey: string,
  personalPrompt?: string
): Promise<SarvamGenerateResult> {
  // FIX M5: personal_prompt is ADDITIVE — appended after base system prompt.
  const baseSystemPrompt = buildSystemPrompt({
    officerName: answers.officerName,
    districtAndCity: profile.districtAndCity ?? profile.district,
    officerSalutation: profile.salutation,
    officerQualifications: profile.designation,
  });
  const systemPrompt = personalPrompt?.trim()
    ? `${baseSystemPrompt}\n\n═══ ವೈಯಕ್ತಿಕ ಶೈಲಿ ಸೂಚನೆಗಳು (Personal Style Instructions) ═══\n${personalPrompt.trim()}`
    : baseSystemPrompt;

  const caseDetails = buildSimpleCaseDetails(caseSummary, answers);

  const result = await generateOrder(
    {
      orderType: caseSummary.caseType.toLowerCase().includes('withdrawal') ? 'withdrawal' : 'suo_motu',
      caseDetails,
      systemPrompt,
    },
    apiKey
  );

  return {
    content: result.content,
    modelUsed: SARVAM_MODEL_ID,
    wordCount: result.wordCount,
  };
}

function buildSimpleCaseDetails(caseSummary: CaseSummary, answers: OfficerAnswers): string {
  const lines = [
    `ಪ್ರಕರಣ ಪ್ರಕಾರ: ${caseSummary.caseType}`,
    `ತೀರ್ಪು: ${answers.outcome}`,
    `ಆದೇಶ ದಿನಾಂಕ: ${answers.orderDate}`,
  ];

  // Add parties only if available (from Vision reading or officer input)
  if (caseSummary.parties.petitioner) {
    lines.push(`ಮೇಲ್ಮನವಿದಾರರು: ${caseSummary.parties.petitioner}`);
  }
  if (caseSummary.parties.respondent) {
    lines.push(`ಎದುರುದಾರರು: ${caseSummary.parties.respondent}`);
  }
  if (caseSummary.reliefSought) {
    lines.push(`ಕೋರಿದ ಪರಿಹಾರ: ${caseSummary.reliefSought}`);
  }

  // Key facts from Vision reading (if available)
  if (caseSummary.keyFacts.length > 0) {
    lines.push('', 'ಮುಖ್ಯ ಸಂಗತಿಗಳು:');
    caseSummary.keyFacts.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
  }

  if (answers.relatedCases?.trim()) {
    lines.push('', `ಸಂಬಂಧಿತ ಪ್ರಕರಣಗಳು: ${answers.relatedCases.trim()}`);
  }

  // For simple path, aiQuestionAnswer contains the officer's full case details
  if (answers.aiQuestionAnswer?.trim()) {
    lines.push('', `ಪ್ರಕರಣ ವಿವರಗಳು / Case Details:`, answers.aiQuestionAnswer.trim());
  }

  return lines.join('\n');
}
