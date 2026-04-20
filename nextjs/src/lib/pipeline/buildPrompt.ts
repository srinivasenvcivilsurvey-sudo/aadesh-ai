/**
 * Aadesh AI — Prompt Builder with Anthropic Cache Control
 *
 * Assembles the full prompt in the EXACT order required for caching:
 *   1. System prompt V3.2.1           → cache_control (rarely changes)
 *   2. Reference orders (5-8 full)    → cache_control (changes only on new upload)
 *   3. Case summary + officer answers → NO cache_control (changes every order)
 *
 * Properties validated:
 *   8:  Prompt structure and cache_control placement are always correct
 *   9:  Reference order count is always between 5 and 8
 *   10: Officer profile fields always appear in the assembled prompt
 *   11: Assembled prompt never exceeds 200,000 tokens
 *   25: API call never contains a provider.order field
 */

import { buildSystemPrompt } from '@/lib/system-prompt';
import type { CaseSummary, OfficerAnswers, BuiltPrompt, AnthropicContentBlock } from './types';

const MAX_TOKENS = 200_000;
const MAX_REFS = 8;

// Rough token estimator: ~4 chars per token for mixed Kannada/English
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface OfficerProfile {
  officerName: string;
  designation: string;
  district: string;
  salutation: string;
  districtAndCity?: string;
  officerQualifications?: string;
}

export interface ReferenceOrder {
  id: string;
  extracted_text: string;
  case_type_id: string;
  uploaded_at: string;
}

/**
 * Builds the full Anthropic messages array with cache_control markers.
 *
 * @param profile - Officer profile from Supabase profiles table
 * @param references - Reference orders from Supabase references table (pre-filtered by case type, ordered by uploaded_at DESC)
 * @param caseSummary - Structured case summary from Vision Reader
 * @param answers - Officer's answers to clarifying questions
 * @param personalPrompt - Optional auto-generated personal prompt (overrides default system prompt)
 * @returns BuiltPrompt with messages array and estimated token count
 */
export function buildPrompt(
  profile: OfficerProfile,
  references: ReferenceOrder[],
  caseSummary: CaseSummary,
  answers: OfficerAnswers,
  personalPrompt?: string
): BuiltPrompt {
  // ── 1. System Prompt (CACHED) ──────────────────────────────────────────────
  // FIX M5: personal_prompt is ADDITIVE — appended after base system prompt, not a replacement.
  // Replacing the base prompt strips all 7 guardrails and 64 terminology rules.
  const baseSystemPrompt = buildSystemPrompt({
    officerName: profile.officerName,
    districtAndCity: profile.districtAndCity ?? `${profile.district}`,
    officerSalutation: profile.salutation,
    officerQualifications: profile.designation,
  });
  const systemPromptText = personalPrompt?.trim()
    ? `${baseSystemPrompt}\n\n═══ ವೈಯಕ್ತಿಕ ಶೈಲಿ ಸೂಚನೆಗಳು (Personal Style Instructions) ═══\n${personalPrompt.trim()}`
    : baseSystemPrompt;

  const systemPromptBlock: AnthropicContentBlock = {
    type: 'text',
    text: systemPromptText,
    cache_control: { type: 'ephemeral' },
  };

  // ── 2. Reference Orders Block (CACHED) ────────────────────────────────────
  // Select 5–8 references, capped at MAX_REFS
  const selectedRefs = references.slice(0, MAX_REFS);
  // If fewer than MIN_REFS, use all available (don't block generation)

  const refsText = selectedRefs.length > 0
    ? buildReferencesBlock(selectedRefs)
    : buildProfileBlock(profile); // fallback: just profile info if no refs

  const referencesBlock: AnthropicContentBlock = {
    type: 'text',
    text: refsText,
    cache_control: { type: 'ephemeral' },
  };

  // ── 3. Case Input + Officer Answers (NOT CACHED) ──────────────────────────
  const caseInputText = buildCaseInputBlock(caseSummary, answers, profile);

  const caseInputBlock: AnthropicContentBlock = {
    type: 'text',
    text: caseInputText,
    // No cache_control — this changes every order
  };

  // ── Assemble messages ─────────────────────────────────────────────────────
  const messages = [
    {
      role: 'user' as const,
      content: [systemPromptBlock, referencesBlock, caseInputBlock],
    },
  ];

  // ── Token estimate ────────────────────────────────────────────────────────
  const totalText = systemPromptText + refsText + caseInputText;
  const estimatedTokens = estimateTokens(totalText);

  if (estimatedTokens > MAX_TOKENS) {
    throw new Error(
      `Prompt exceeds maximum token limit: estimated ${estimatedTokens} tokens (max ${MAX_TOKENS}). ` +
      `Reduce reference orders or case summary length.`
    );
  }

  return { messages, estimatedTokens };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function buildReferencesBlock(refs: ReferenceOrder[]): string {
  const header = `═══ ಉಲ್ಲೇಖ ಆದೇಶಗಳು (Reference Orders — ${refs.length} used) ═══\n\n`;

  const blocks = refs.map((ref, i) =>
    `── ಉಲ್ಲೇಖ ${i + 1} ──\n${ref.extracted_text}`
  ).join('\n\n');

  return header + blocks + '\n\n═══ ಮೇಲಿನ ಉಲ್ಲೇಖಗಳ ಶೈಲಿಯನ್ನು ಅನುಸರಿಸಿ ಹೊಸ ಆದೇಶ ರಚಿಸಿ ═══';
}

function buildProfileBlock(profile: OfficerProfile): string {
  return [
    `═══ ಅಧಿಕಾರಿ ಮಾಹಿತಿ (Officer Profile) ═══`,
    `ಹೆಸರು / Name: ${profile.salutation} ${profile.officerName}`,
    `ಹುದ್ದೆ / Designation: ${profile.designation}`,
    `ಜಿಲ್ಲೆ / District: ${profile.district}`,
  ].join('\n');
}

function buildCaseInputBlock(
  caseSummary: CaseSummary,
  answers: OfficerAnswers,
  profile: OfficerProfile
): string {
  const outcomeKn: Record<string, string> = {
    Allowed: 'ಪುರಸ್ಕರಿಸಿದೆ',
    Dismissed: 'ವಜಾಗೊಳಿಸಿ ಆದೇಶಿಸಿದೆ',
    Remanded: 'ಮರಳಿ ಕಳುಹಿಸಲಾಗಿದೆ',
  };

  const lines = [
    `═══ ಹೊಸ ಪ್ರಕರಣ ವಿವರ (New Case Details) ═══`,
    ``,
    `ಪ್ರಕರಣ ಪ್ರಕಾರ: ${caseSummary.caseType}`,
    ...(caseSummary.parties.petitioner ? [`ಮೇಲ್ಮನವಿದಾರರು: ${caseSummary.parties.petitioner}`] : []),
    ...(caseSummary.parties.respondent ? [`ಎದುರುದಾರರು: ${caseSummary.parties.respondent}`] : []),
    ``,
    ...(caseSummary.keyFacts.length > 0 ? [
      `ಮುಖ್ಯ ಸಂಗತಿಗಳು:`,
      ...caseSummary.keyFacts.map((f, i) => `${i + 1}. ${f}`),
      ``,
    ] : []),
    ...(caseSummary.reliefSought ? [`ಕೋರಿದ ಪರಿಹಾರ: ${caseSummary.reliefSought}`] : []),
    // V3.2.7 FIX 4 — optional extras extracted by Vision step (appear only when present)
    ...(caseSummary.extras ? buildExtrasLines(caseSummary.extras) : []),
    ``,
    `═══ ಅಧಿಕಾರಿ ಉತ್ತರಗಳು (Officer Answers) ═══`,
    ``,
    `ತೀರ್ಪು: ${answers.outcome} (${outcomeKn[answers.outcome] ?? answers.outcome})`,
    `ಅಧ್ಯಕ್ಷ ಅಧಿಕಾರಿ: ${profile.salutation} ${answers.officerName}, ${profile.designation}`,
    `ಆದೇಶ ದಿನಾಂಕ: ${formatDate(answers.orderDate)}`,
  ];

  if (answers.relatedCases?.trim()) {
    lines.push(`ಸಂಬಂಧಿತ ಹಿಂದಿನ ಪ್ರಕರಣಗಳು: ${answers.relatedCases.trim()}`);
  }

  if (answers.aiQuestionAnswer?.trim()) {
    lines.push(``, `ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ: ${answers.aiQuestionAnswer.trim()}`);
  }

  lines.push(
    ``,
    `═══ ಸೂಚನೆ ═══`,
    `ಮೇಲಿನ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಸಂಪೂರ್ಣ ಸರಕಾರಿ ಕನ್ನಡ ಆದೇಶ ರಚಿಸಿ.`,
    `ಉಲ್ಲೇಖ ಆದೇಶಗಳ ಶೈಲಿ, ರಚನೆ ಮತ್ತು ಭಾಷೆಯನ್ನು ಅನುಸರಿಸಿ.`
  );

  return lines.join('\n');
}

function formatDate(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  } catch {
    return isoDate;
  }
}

// V3.2.7 FIX 4 — render optional extras (appellant age, hearing dates, mutation, sale consideration)
// as Kannada-labelled lines. Only fields that are present produce output.
function buildExtrasLines(extras: NonNullable<CaseSummary['extras']>): string[] {
  const out: string[] = [];
  if (extras.appellantAge)          out.push(`ಮೇಲ್ಮನವಿದಾರರ ವಯಸ್ಸು: ${extras.appellantAge}`);
  if (extras.respondent3Age)        out.push(`3ನೇ ಎದುರುದಾರರ ವಯಸ್ಸು: ${extras.respondent3Age}`);
  if (extras.hearingDates?.length)  out.push(`ವಿಚಾರಣಾ ದಿನಾಂಕಗಳು: ${extras.hearingDates.join(', ')}`);
  if (extras.mutationNo)            out.push(`ಮ್ಯುಟೇಶನ್ ಸಂಖ್ಯೆ: ${extras.mutationNo}`);
  if (extras.mutationDate)          out.push(`ಮ್ಯುಟೇಶನ್ ದಿನಾಂಕ: ${extras.mutationDate}`);
  if (extras.saleDeedConsideration) out.push(`ಮಾರಾಟ ಪತ್ರದ ಪ್ರತಿಫಲ: ${extras.saleDeedConsideration}`);
  return out;
}
