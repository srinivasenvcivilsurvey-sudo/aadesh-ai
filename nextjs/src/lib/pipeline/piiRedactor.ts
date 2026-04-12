/**
 * PII Redactor — Aadesh AI v9.2
 *
 * Masks personally identifiable information (names, survey numbers, village names)
 * before sending case content to the Anthropic API, then re-injects real values
 * after receiving the AI output. All processing happens on the India VPS.
 *
 * The redaction map is held only in server memory for the duration of the request.
 * It is NEVER written to any database or log.
 *
 * Requirements: 13.1–13.6
 */

// ── Kannada Unicode ranges ────────────────────────────────────────────────────
// Kannada block: U+0C80–U+0CFF
// Vowels: ಅ (U+0C85) – ಔ (U+0C94)
// Consonants: ಕ (U+0C95) – ಹ (U+0CB9)
// Dependent vowel signs: ಾ (U+0CBE) – ೌ (U+0CCC)
// Virama: ್ (U+0CCD)
// Digits: ೦ (U+0CE6) – ೯ (U+0CEF)

const KANNADA_CHAR = '[\u0C80-\u0CFF]';
const KANNADA_WORD = `${KANNADA_CHAR}+`;

// Village name suffixes (common in Karnataka land records)
const VILLAGE_SUFFIXES = ['ಹಳ್ಳಿ', 'ಪುರ', 'ನಗರ', 'ಗ್ರಾಮ', 'ಕೊಪ್ಪ', 'ಕೊಪ್ಪಲು', 'ಬೆಟ್ಟ', 'ಕೆರೆ'];

// Common Kannada stop-words that should NOT be treated as names
const KANNADA_STOP_WORDS = new Set([
  'ಮತ್ತು', 'ಅಥವಾ', 'ಆದರೆ', 'ಏಕೆಂದರೆ', 'ಆದ್ದರಿಂದ', 'ಆದ್ದರಿಂದಲೇ',
  'ಇದು', 'ಅದು', 'ಅವರು', 'ಇವರು', 'ಅವಳು', 'ಇವಳು', 'ಅವನು', 'ಇವನು',
  'ಅದರ', 'ಇದರ', 'ಅವರ', 'ಇವರ', 'ಅವಳ', 'ಇವಳ', 'ಅವನ', 'ಇವನ',
  'ಇಲ್ಲ', 'ಇಲ್ಲಿ', 'ಅಲ್ಲಿ', 'ಇಲ್ಲಿಗೆ', 'ಅಲ್ಲಿಗೆ',
  'ಮೇಲೆ', 'ಕೆಳಗೆ', 'ಮುಂದೆ', 'ಹಿಂದೆ', 'ಒಳಗೆ', 'ಹೊರಗೆ',
  'ಸರ್ಕಾರ', 'ಸರ್ಕಾರದ', 'ಸರ್ಕಾರಿ', 'ಕರ್ನಾಟಕ', 'ಭಾರತ',
  'ಜಿಲ್ಲೆ', 'ತಾಲ್ಲೂಕು', 'ಹೋಬಳಿ', 'ಗ್ರಾಮ', 'ನಗರ', 'ಪಟ್ಟಣ',
  'ಅರ್ಜಿ', 'ಅರ್ಜಿದಾರ', 'ಪ್ರತಿವಾದಿ', 'ಮನವಿ', 'ಆದೇಶ', 'ತೀರ್ಪು',
  'ಕಾಯ್ದೆ', 'ನಿಯಮ', 'ವಿಭಾಗ', 'ಅಧಿಕಾರಿ', 'ಕಚೇರಿ', 'ನ್ಯಾಯಾಲಯ',
  'ದಿನಾಂಕ', 'ವರ್ಷ', 'ತಿಂಗಳು', 'ವಾರ', 'ದಿನ',
  'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು', 'ಏಳು', 'ಎಂಟು', 'ಒಂಬತ್ತು', 'ಹತ್ತು',
  'ಶ್ರೀ', 'ಶ್ರೀಮತಿ', 'ಕುಮಾರಿ', 'ಸ್ವ', 'ಮಾನ್ಯ',
]);

// ── Redaction result ──────────────────────────────────────────────────────────

export interface RedactionResult {
  redacted: string;
  map: Map<string, string>;
}

// ── Main redact function ──────────────────────────────────────────────────────

/**
 * Redacts PII from Kannada text before sending to Anthropic API.
 * Returns the redacted text and a map of placeholder → original value.
 * The map must be passed to reInjectPII after receiving AI output.
 */
export function redactPII(text: string): RedactionResult {
  const map = new Map<string, string>();
  let nameCounter = 1;
  let surveyCounter = 1;
  let villageCounter = 1;

  let result = text;

  // ── 1. Redact survey numbers ──────────────────────────────────────────────
  // FIX 2026-04-12: Removed bare N/N/N pattern — it was masking dates like 12/3/2025.
  // Now only match survey numbers preceded by Kannada context words.
  // ✓ "ಸ.ನಂ 45/3" → survey number redacted correctly
  // ✓ "12/3/2025" → NOT redacted (preserved as date for accuracy)
  const surveyPatterns = [
    /(ಸರ್ವೆ\s*ನಂ|ಸ\.ನಂ|ಸರ್ವೆ\s*ನಂಬರ್)[\s.:]*(\d+\/\d+(?:\/\d+)?)/g,
  ];

  for (const pattern of surveyPatterns) {
    result = result.replace(pattern, (match) => {
      // Check if already replaced
      if (match.includes('[SURVEY_')) return match;
      const placeholder = `[SURVEY_${surveyCounter++}]`;
      map.set(placeholder, match);
      return placeholder;
    });
  }

  // ── 2. Redact village names ───────────────────────────────────────────────
  // Words ending in village suffixes
  const villageSuffixPattern = new RegExp(
    `(${KANNADA_CHAR}+(?:${VILLAGE_SUFFIXES.join('|')}))`,
    'g'
  );

  result = result.replace(villageSuffixPattern, (match) => {
    if (match.includes('[VILLAGE_')) return match;
    if (match.length < 4) return match; // too short to be a village name
    const placeholder = `[VILLAGE_${villageCounter++}]`;
    map.set(placeholder, match);
    return placeholder;
  });

  // ── 3. Redact Kannada names ───────────────────────────────────────────────
  // Kannada words of 3+ characters that are not stop-words
  // Look for capitalized-context patterns: after ಶ್ರೀ/ಶ್ರೀಮತಿ, or standalone proper nouns
  const nameContextPattern = new RegExp(
    `(?:ಶ್ರೀ|ಶ್ರೀಮತಿ|ಕುಮಾರಿ|ಸ್ವ\\.?|ಮಾನ್ಯ)\\s+(${KANNADA_WORD}(?:\\s+${KANNADA_WORD}){0,3})`,
    'g'
  );

  result = result.replace(nameContextPattern, (match, nameGroup) => {
    if (match.includes('[NAME_')) return match;
    const prefix = match.slice(0, match.indexOf(nameGroup));
    const placeholder = `[NAME_${nameCounter++}]`;
    map.set(placeholder, nameGroup.trim());
    return prefix + placeholder;
  });

  // FIX 2026-04-12: Removed standalone Kannada word masking — it was killing
  // revenue terms like "ಮಾಲೀಕ" (owner), "ಭೋಗ್ಯದಾರ" (lessee) which are critical
  // for generation accuracy. Now ONLY mask names following honorifics.
  // ✓ "ಮಾಲೀಕ" alone → NOT redacted (revenue term preserved)
  // ✓ "ಶ್ರೀ ರಾಮಕೃಷ್ಣ" → name after honorific IS redacted

  return { redacted: result, map };
}

// ── Re-injection function ─────────────────────────────────────────────────────

/**
 * Re-injects original PII values into AI output using the redaction map.
 * Any placeholder with no map entry is left visible for officer correction.
 * Anomalous placeholders are returned in the anomalies array for logging.
 */
export function reInjectPII(
  text: string,
  map: Map<string, string>
): { result: string; anomalies: string[] } {
  const anomalies: string[] = [];
  let result = text;

  // Replace all known placeholders
  for (const [placeholder, original] of map.entries()) {
    result = result.split(placeholder).join(original);
  }

  // Detect any remaining placeholders that have no map entry
  const remainingPlaceholders = result.match(/\[(NAME|SURVEY|VILLAGE)_\d+\]/g) ?? [];
  for (const p of remainingPlaceholders) {
    if (!map.has(p)) {
      anomalies.push(p);
    }
  }

  return { result, anomalies };
}
