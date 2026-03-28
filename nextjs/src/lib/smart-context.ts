/**
 * Smart-Context Agent — selects the best reference orders for generation context.
 * Blueprint v6.7: "Select top 5 references. NEVER more than 8. Ensure total < 16K tokens."
 *
 * Priority:
 *   1. Same order type (appeal → appeal refs)
 *   2. Keyword match (village, survey number)
 *   3. Most recent uploads
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { normalizeNFKC } from './sarvam';

const MAX_REFS = 5;
const MAX_CONTEXT_CHARS = 40_000; // ~10K tokens safe limit for context portion

// Demo reference excerpts for users with no uploads
const DEMO_REFERENCES = [
  {
    type: 'appeal',
    excerpt: `ಕರ್ನಾಟಕ ಭೂ ಕಂದಾಯ ಕಾಯಿದೆ 1964 ರ ಕಲಂ 136 ರಡಿಯಲ್ಲಿ ಸಲ್ಲಿಸಲಾದ ಮೇಲ್ಮನವಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.
ಮೇಲ್ಮನವಿದಾರರು ಸರ್ವೆ ನಂ. ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಫೋಡಿ ಮಾಡಿ ಪ್ರತ್ಯೇಕ ಪಹಣಿ ಸೃಜಿಸಲು ಕೋರಿದ್ದಾರೆ.
ತಹಸೀಲ್ದಾರ್ ಅವರ ಆದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿ, ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಮೇಲ್ಮನವಿಯನ್ನು ಮಂಜೂರು/ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.
ಕಡತವನ್ನು ತಹಸೀಲ್ದಾರ್ ಅವರಿಗೆ ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ.
ಭೂಮಿ ದಾಖಲೆಗಳ ಉಪ ನಿರ್ದೇಶಕರು, ಸಹಿ.`,
  },
  {
    type: 'appeal',
    excerpt: `ಉಪ ನಿರ್ದೇಶಕರ ನ್ಯಾಯಾಲಯ, ಭೂದಾಖಲೆಗಳು.
ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: /2024-25
ಮೇಲ್ಮನವಿದಾರರು: ವಿರುದ್ಧ ಎದುರುದಾರರು.
ಪ್ರಕರಣದ ಸಂಕ್ಷಿಪ್ತ ವಿವರ: ಮೇಲ್ಮನವಿದಾರರು ಪಹಣಿಯಲ್ಲಿ ಹೆಸರು ಸೇರ್ಪಡೆ/ತಿದ್ದುಪಡಿಗಾಗಿ ತಹಸೀಲ್ದಾರರ ಆದೇಶದ ವಿರುದ್ಧ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿದ್ದಾರೆ.
ಆದೇಶ: ಮೇಲ್ಮನವಿಯನ್ನು ವಿಚಾರಣೆಗೆ ತೆಗೆದುಕೊಂಡು, ಉಭಯ ಪಕ್ಷಗಳ ವಾದ-ಪ್ರತಿವಾದಗಳನ್ನು ಆಲಿಸಿ ಆದೇಶ ಮಾಡಲಾಗಿದೆ.`,
  },
  {
    type: 'suo_motu',
    excerpt: `ಸ್ವಯಂಪ್ರೇರಿತ ಪುನರ್ವಿಮರ್ಶೆ ಆದೇಶ.
ಭೂ ಕಂದಾಯ ಕಾಯಿದೆ 1964 ರ ಕಲಂ 128-ಎ ರಡಿಯಲ್ಲಿ.
ಕಛೇರಿ ವತಿಯಿಂದ ಪಹಣಿಯಲ್ಲಿ ಆದ ತಪ್ಪನ್ನು ಸ್ವಯಂಪ್ರೇರಿತವಾಗಿ ಪುನರ್ವಿಮರ್ಶೆ ಮಾಡಿ ಸರಿಪಡಿಸಲಾಗಿದೆ.
ಖರಾಬ್ ಭೂಮಿಯ ವರ್ಗೀಕರಣ ಬದಲಾವಣೆ ಕುರಿತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.
ಸಂಬಂಧಪಟ್ಟ ಗ್ರಾಮ ಲೆಕ್ಕಿಗರಿಗೆ ಪಹಣಿ ತಿದ್ದುಪಡಿ ಮಾಡಲು ಸೂಚಿಸಲಾಗಿದೆ.`,
  },
  {
    type: 'suo_motu',
    excerpt: `ಉಪ ನಿರ್ದೇಶಕರ ಕಛೇರಿ, ಭೂದಾಖಲೆಗಳು.
ಸ್ವಯಂಪ್ರೇರಿತ ಪ್ರಕರಣ.
ಪಹಣಿಯಲ್ಲಿ ಅನಧಿಕೃತ ಭೋಗ್ಯ / ಹಿಸ್ಸಾ ಆಗಿರುವುದನ್ನು ಪರಿಶೀಲಿಸಿ ಸರಿಪಡಿಸಲಾಗಿದೆ.
ತಹಸೀಲ್ದಾರರ ವರದಿ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ.`,
  },
  {
    type: 'appeal',
    excerpt: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: /2023-24
ಮೇಲ್ಮನವಿದಾರರು ಸರ್ವೆ ನಂಬರ್ ಕುರಿತು ವಿಸ್ತೀರ್ಣ ತಿದ್ದುಪಡಿಗಾಗಿ ಸಲ್ಲಿಸಿದ ಮೇಲ್ಮನವಿ.
ಎದುರುದಾರರ ಆಕ್ಷೇಪಣೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.
ಸರ್ವೆ ದಾಖಲೆಗಳು, ಭೂ ಪರಿವರ್ತನೆ ಆದೇಶಗಳು ಮತ್ತು ಪಹಣಿ ಉಲ್ಲೇಖಿಸಲಾಗಿದೆ.
ಸಂಬಂಧಪಟ್ಟ ಅಧಿಕಾರಿಗಳಿಗೆ ಅಗತ್ಯ ಸೂಚನೆ ನೀಡಲಾಗಿದೆ.`,
  },
];

export interface SmartContextResult {
  referenceExcerpts: string[];
  refsUsed: number;
  totalRefs: number;
  source: 'user' | 'demo';
}

/**
 * Fetch and rank the best reference orders for context.
 * Falls back to demo references if user has no uploads.
 */
export async function getSmartContext(
  adminClient: SupabaseClient,
  userId: string,
  orderType: string,
  caseDetails: string
): Promise<SmartContextResult> {
  // Try to get user's reference orders from the database
  const { data: refs } = await adminClient
    .from('references')
    .select('id, extracted_text, detected_type, word_count')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (refs && refs.length > 0) {
    return selectUserRefs(refs, orderType, caseDetails);
  }

  // Fallback: try Supabase Storage files (if references table doesn't exist yet)
  const { data: files } = await adminClient.storage
    .from('files')
    .list(userId, { limit: 50 });

  if (files && files.length > 0) {
    // User has files but no reference DB entries — use demo as context
    return selectDemoRefs(orderType);
  }

  // No uploads at all — use demo references
  return selectDemoRefs(orderType);
}

function selectUserRefs(
  refs: Array<{ id: string; extracted_text: string | null; detected_type: string | null; word_count: number | null }>,
  orderType: string,
  caseDetails: string
): SmartContextResult {
  // Score each reference
  const scored = refs
    .filter(r => r.extracted_text && r.extracted_text.length > 100)
    .map(r => {
      let score = 0;

      // Priority 1: Same order type (+10)
      if (r.detected_type === orderType) score += 10;

      // Priority 2: Keyword overlap with case details (+1 per match)
      const normalizedRef = normalizeNFKC(r.extracted_text || '').toLowerCase();
      const keywords = normalizeNFKC(caseDetails).toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);

      for (const kw of keywords) {
        if (normalizedRef.includes(kw)) score += 1;
      }

      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score);

  // Take top 5, respect token budget
  const selected: string[] = [];
  let totalChars = 0;

  for (const ref of scored) {
    if (selected.length >= MAX_REFS) break;
    const text = ref.extracted_text || '';
    if (totalChars + text.length > MAX_CONTEXT_CHARS) break;
    selected.push(text);
    totalChars += text.length;
  }

  return {
    referenceExcerpts: selected,
    refsUsed: selected.length,
    totalRefs: refs.length,
    source: 'user',
  };
}

function selectDemoRefs(orderType: string): SmartContextResult {
  // Prioritize same type, then include others
  const sameType = DEMO_REFERENCES.filter(r => r.type === orderType);
  const otherType = DEMO_REFERENCES.filter(r => r.type !== orderType);
  const ordered = [...sameType, ...otherType].slice(0, MAX_REFS);

  return {
    referenceExcerpts: ordered.map(r => r.excerpt),
    refsUsed: ordered.length,
    totalRefs: DEMO_REFERENCES.length,
    source: 'demo',
  };
}

/**
 * Build the context block to inject into the user message.
 */
export function buildContextBlock(refs: SmartContextResult): string {
  if (refs.referenceExcerpts.length === 0) return '';

  const header = refs.source === 'demo'
    ? '═══ ಡೆಮೊ ಉಲ್ಲೇಖ ಆದೇಶಗಳು (Demo Reference Orders) ═══'
    : `═══ ಉಲ್ಲೇಖ ಆದೇಶಗಳು (${refs.refsUsed}/${refs.totalRefs} used) ═══`;

  const blocks = refs.referenceExcerpts.map((excerpt, i) =>
    `── ಉಲ್ಲೇಖ ${i + 1} ──\n${excerpt}`
  ).join('\n\n');

  return `${header}\n\n${blocks}\n\n═══ ಮೇಲಿನ ಉಲ್ಲೇಖಗಳ ಶೈಲಿಯನ್ನು ಅನುಸರಿಸಿ ಹೊಸ ಆದೇಶ ರಚಿಸಿ ═══\n\n`;
}
