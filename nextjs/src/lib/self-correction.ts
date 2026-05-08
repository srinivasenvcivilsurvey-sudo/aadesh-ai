/**
 * Self-Correction Pass — Stage 8 of the 19-stage pipeline.
 * Server-side only.
 */

import Anthropic from '@anthropic-ai/sdk';
import { normalizeNFKC } from './sarvam';

export interface SelfCorrectionResult {
  finalContent: string;
  correctionApplied: boolean;
  correctionScore: number;
  reviewerNotes: string;
  model: string;
}

interface ReviewerJson {
  needs_correction: boolean;
  score: number;
  notes: string;
  corrected_order: string;
}

const REVIEWER_SYSTEM_PROMPT = `ನೀವು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಆದೇಶ ಪರಿಶೀಲಕರು (Karnataka Government Order Reviewer).
ನಿಮ್ಮ ಕೆಲಸ: DDLR (Deputy Director of Land Records) ಕಚೇರಿಯ ಆದೇಶದ ಪರಿಶೀಲನೆ.

You receive ONE Kannada order draft plus the original case input. Audit the draft
against the checklist and return STRICT JSON only — no markdown, no fences:

{
  "needs_correction": boolean,
  "score": integer 0..100,
  "notes": "short bilingual note (≤200 chars)",
  "corrected_order": "<full corrected Kannada text — same as draft if needs_correction is false>"
}

Checklist:
1. Sarakari Kannada legal format — court header, parties block, prayer, finding, order, signature.
2. Every named entity (people, survey nos., villages, dates, amounts) in the draft MUST appear in the case input. No hallucinated facts.
3. NO English transliterations from this 64-term blacklist: appeal, order, section, district, tahsildar, survey, village, revenue, mutation, phodi, dismissed, allowed, petitioner, respondent, government, officer, commissioner, deputy, sub-division, taluk, hobli, panchayat, land, record, rights, register, whereas, hereby, therefore, accordingly. Replace with Kannada equivalents.
4. Respondent terminology consistent (ಎದುರುದಾರ).
5. Word count reasonable for case type.

Score guidance: 95+ = no correction needed. 70-94 = light fixes. < 70 = rewrite (preserve facts).
If needs_correction is false, set corrected_order to the original draft EXACTLY.`;

export async function runSelfCorrection(params: {
  draft: string;
  caseInput: string;
  orderType: 'appeal' | 'suo_motu' | 'contested' | 'withdrawal';
  anthropicKey?: string;
}): Promise<SelfCorrectionResult> {
  const fallback: SelfCorrectionResult = {
    finalContent: params.draft,
    correctionApplied: false,
    correctionScore: 0,
    reviewerNotes: 'reviewer skipped (no key or error)',
    model: 'none',
  };

  const apiKey =
    params.anthropicKey && params.anthropicKey !== 'your_key_here'
      ? params.anthropicKey
      : undefined;
  if (!apiKey) return fallback;

  try {
    const client = new Anthropic({ apiKey });
    const userMsg =
      `Order type: ${params.orderType}\n\n` +
      `=== CASE INPUT ===\n${params.caseInput}\n\n` +
      `=== DRAFT ORDER ===\n${params.draft}\n\n` +
      `Audit the draft and return the JSON object specified.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: REVIEWER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
    );
    if (!textBlock) return fallback;

    const parsed = parseReviewerJson(textBlock.text);
    if (!parsed) {
      return {
        ...fallback,
        reviewerNotes: 'reviewer returned non-JSON; kept draft',
        model: 'claude-sonnet-4-6',
      };
    }

    const corrected = normalizeNFKC(parsed.corrected_order || params.draft);
    const drafted = normalizeNFKC(params.draft);
    const correctionApplied = parsed.needs_correction && corrected !== drafted;

    return {
      finalContent: correctionApplied ? corrected : params.draft,
      correctionApplied,
      correctionScore: clampScore(parsed.score),
      reviewerNotes: (parsed.notes ?? '').slice(0, 500),
      model: 'claude-sonnet-4-6',
    };
  } catch (err) {
    console.error(
      '[self-correction] reviewer failed:',
      err instanceof Error ? err.message : err
    );
    return fallback;
  }
}

function parseReviewerJson(raw: string): ReviewerJson | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<ReviewerJson>;
    if (
      typeof parsed.needs_correction !== 'boolean' ||
      typeof parsed.score !== 'number' ||
      typeof parsed.corrected_order !== 'string'
    ) {
      return null;
    }
    return {
      needs_correction: parsed.needs_correction,
      score: parsed.score,
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      corrected_order: parsed.corrected_order,
    };
  } catch {
    return null;
  }
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}
