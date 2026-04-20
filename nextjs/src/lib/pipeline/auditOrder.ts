/**
 * Aadesh AI — Audit Engine
 * Runs 4 guardrail checks on generated order text.
 * Wraps existing guardrails.ts logic for the new pipeline.
 *
 * Properties validated:
 *   14: Each guardrail check is correct for its criterion
 *   15: Guardrail score equals the count of passing checks
 *   16: Audit triggers at most one regeneration
 *   23: Simplified path audit runs only the word count check
 */

import {
  checkSectionCompleteness,
  checkAntiTransliteration,
  checkFactPreservation,
  checkWordCount,
} from '@/lib/guardrails';
import type { CaseSummary, GuardrailResult } from './types';

const SIMPLE_CASE_TYPES = ['withdrawal', 'suo_motu'];

/**
 * Run guardrail checks on a generated order.
 * For simplified path (withdrawal/suo_motu): only word count check.
 * For full path: all 4 checks in parallel.
 *
 * @param orderText - The generated order text
 * @param caseSummary - Structured case summary (for fact preservation check)
 * @param caseType - Case type string (determines which checks to run)
 * @returns GuardrailResult with individual check results and aggregate score
 */
export async function auditOrder(
  orderText: string,
  caseSummary: CaseSummary,
  caseType: string
): Promise<GuardrailResult> {
  const isSimplePath = SIMPLE_CASE_TYPES.includes(caseType.toLowerCase());

  if (isSimplePath) {
    return runSimpleAudit(orderText);
  }

  return runFullAudit(orderText, caseSummary, caseType);
}

// ── Full path: all 4 guardrails in parallel ───────────────────────────────────

async function runFullAudit(
  orderText: string,
  caseSummary: CaseSummary,
  caseType: string
): Promise<GuardrailResult> {
  const orderTypeForGuardrail = caseType === 'suo_motu' ? 'suo_motu' : 'appeal';

  // Build input text from key facts for fact preservation check
  const inputText = caseSummary.keyFacts.join(' ');

  const [sectionResult, purityResult, factResult, wordResult] = await Promise.all([
    Promise.resolve(checkSectionCompleteness(orderText, orderTypeForGuardrail)),
    Promise.resolve(checkAntiTransliteration(orderText)),
    Promise.resolve(checkFactPreservation(inputText, orderText)),
    Promise.resolve(checkWordCount(orderText, inputText)),
  ]);

  // V3.2.7 PATCH F — token-loop detector (20-word sliding window; fail if any sequence appears >2x)
  const repeatResult = detectTokenLoop(orderText);

  const checks = {
    sectionCompleteness: sectionResult.passed,
    kannadaPurity: purityResult.passed,
    factPreservation: factResult.passed,
    wordCount: wordResult.passed,
    noRepetition: repeatResult.passed,
  };

  const failures: string[] = [];
  if (!checks.sectionCompleteness) failures.push(sectionResult.details);
  if (!checks.kannadaPurity) failures.push(purityResult.details);
  if (!checks.factPreservation) failures.push(factResult.details);
  if (!checks.wordCount) failures.push(wordResult.details);
  if (!checks.noRepetition) failures.push(repeatResult.details);

  const score = Object.values(checks).filter(Boolean).length;

  return {
    ...checks,
    score,
    failures,
  };
}

/**
 * V3.2.7 PATCH F — token-loop / repetition detector.
 * Sarvam 105B with reasoning_effort=low has been observed repeating the same
 * sentence 15+ times in the Analysis section (Machohalli_163 first real order).
 * This detector slides a 20-word window and fails if any window appears >2 times.
 *
 * Exported for direct use by callers that want to run the check without the
 * full guardrail suite.
 */
export function detectTokenLoop(
  orderText: string,
  opts: { windowSize?: number; maxOccurrences?: number } = {}
): { passed: boolean; details: string } {
  const windowSize = opts.windowSize ?? 20;
  const maxOccurrences = opts.maxOccurrences ?? 2;

  // Tokenise on whitespace (Kannada preserves word boundaries via spaces).
  const tokens = orderText.split(/\s+/).filter(t => t.length > 0);
  if (tokens.length < windowSize * 2) {
    return { passed: true, details: 'ok (too short for repeat check)' };
  }

  const counts = new Map<string, number>();
  for (let i = 0; i <= tokens.length - windowSize; i++) {
    const window = tokens.slice(i, i + windowSize).join(' ');
    counts.set(window, (counts.get(window) ?? 0) + 1);
  }

  let worstPhrase = '';
  let worstCount = 0;
  for (const [phrase, count] of counts.entries()) {
    if (count > worstCount) {
      worstCount = count;
      worstPhrase = phrase;
    }
  }

  if (worstCount > maxOccurrences) {
    const preview = worstPhrase.slice(0, 60) + (worstPhrase.length > 60 ? '…' : '');
    return {
      passed: false,
      details: `ಪುನರಾವರ್ತನೆ ದೋಷ: ${windowSize}-ಪದ ಅನುಕ್ರಮ "${preview}" ${worstCount} ಬಾರಿ ಕಾಣಿಸಿಕೊಂಡಿದೆ (ಗರಿಷ್ಠ ${maxOccurrences}). Token-loop detected — regenerate.`,
    };
  }

  return { passed: true, details: 'ok' };
}

// ── Simplified path: word count only ─────────────────────────────────────────

async function runSimpleAudit(orderText: string): Promise<GuardrailResult> {
  const wordResult = checkWordCount(orderText, '');

  return {
    sectionCompleteness: null,
    kannadaPurity: null,
    factPreservation: null,
    wordCount: wordResult.passed,
    score: wordResult.passed ? 1 : 0,
    failures: wordResult.passed ? [] : [wordResult.details],
  };
}

/**
 * Build a correction instruction to append to the prompt on audit failure.
 * Used when the first generation fails guardrails — regenerate once with this appended.
 */
export function buildCorrectionInstruction(result: GuardrailResult): string {
  if (result.failures.length === 0) return '';

  const lines = [
    ``,
    `═══ ತಿದ್ದುಪಡಿ ಸೂಚನೆ (Correction Required) ═══`,
    `ಹಿಂದಿನ ಆದೇಶದಲ್ಲಿ ಈ ಕೆಳಗಿನ ಸಮಸ್ಯೆಗಳಿವೆ:`,
    ...result.failures.map((f, i) => `${i + 1}. ${f}`),
    ``,
    `ದಯವಿಟ್ಟು ಈ ಸಮಸ್ಯೆಗಳನ್ನು ಸರಿಪಡಿಸಿ ಸಂಪೂರ್ಣ ಆದೇಶ ಮತ್ತೆ ರಚಿಸಿ.`,
  ];

  return lines.join('\n');
}
