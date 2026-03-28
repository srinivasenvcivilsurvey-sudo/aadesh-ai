/**
 * Aadesh AI — 3 MVP Guardrails (Blueprint v6.7, Section C)
 * All cost ₹0 — pure regex/string logic, no API calls.
 * ALL text must be NFKC-normalized before calling these functions.
 */

import { normalizeNFKC } from './sarvam';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface GuardrailResult {
  id: string;
  name: string;
  nameKn: string;
  passed: boolean;
  details: string;
  detailsKn: string;
}

export interface GuardrailReport {
  results: GuardrailResult[];
  allPassed: boolean;
  summary: string;
  summaryKn: string;
}

// ═══════════════════════════════════════════════════════════
// GUARDRAIL 1: Section Completeness
// ═══════════════════════════════════════════════════════════

// Key Kannada markers that MUST appear in a DDLR appeal order
const APPEAL_SECTION_MARKERS = [
  { marker: 'ನ್ಯಾಯಾಲಯ', name: 'Court Header' },
  { marker: 'ಮೇಲ್ಮನವಿ', name: 'Appeal Reference' },
  { marker: 'ಮೇಲ್ಮನವಿದಾರ', name: 'Appellant' },
  { marker: 'ಎದುರುದಾರ', name: 'Respondent' },
  { marker: 'ಪ್ರಕರಣ', name: 'Case Details' },
  { marker: 'ಸರ್ವೆ', name: 'Survey Number' },
  { marker: 'ಆದೇಶ', name: 'Order Section' },
  { marker: 'ಸಹಿ', name: 'Signature' },
];

const SUO_MOTU_SECTION_MARKERS = [
  { marker: 'ಸ್ವಯಂಪ್ರೇರಿತ', name: 'Suo Motu Reference' },
  { marker: 'ಪುನರ್ವಿಮರ್ಶೆ', name: 'Review Reference' },
  { marker: 'ಆದೇಶ', name: 'Order Section' },
  { marker: 'ಸಹಿ', name: 'Signature' },
];

export function checkSectionCompleteness(
  orderText: string,
  orderType: 'appeal' | 'suo_motu'
): GuardrailResult {
  const normalized = normalizeNFKC(orderText);
  const markers = orderType === 'appeal' ? APPEAL_SECTION_MARKERS : SUO_MOTU_SECTION_MARKERS;
  const total = markers.length;

  const found = markers.filter(m => normalized.includes(normalizeNFKC(m.marker)));
  const missing = markers.filter(m => !normalized.includes(normalizeNFKC(m.marker)));
  const foundCount = found.length;
  const passed = foundCount >= Math.ceil(total * 0.75); // Pass if ≥75% sections found

  const missingNames = missing.map(m => m.name).join(', ');

  return {
    id: 'section-completeness',
    name: 'Section Completeness',
    nameKn: 'ವಿಭಾಗ ಪೂರ್ಣತೆ',
    passed,
    details: passed
      ? `${foundCount}/${total} sections found`
      : `${foundCount}/${total} sections found. Missing: ${missingNames}`,
    detailsKn: passed
      ? `${foundCount}/${total} ವಿಭಾಗಗಳು`
      : `${foundCount}/${total} ವಿಭಾಗಗಳು. ಕಾಣೆ: ${missingNames}`,
  };
}

// ═══════════════════════════════════════════════════════════
// GUARDRAIL 2: Anti-Transliteration
// ═══════════════════════════════════════════════════════════

// English words that should NEVER appear in Kannada output
const ENGLISH_BLACKLIST = [
  'appeal', 'order', 'section', 'district', 'tahsildar',
  'survey', 'village', 'revenue', 'mutation', 'phodi',
  'dismissed', 'allowed', 'petitioner', 'respondent',
  'government', 'officer', 'commissioner', 'deputy',
  'sub-division', 'taluk', 'hobli', 'panchayat',
  'land', 'record', 'rights', 'register',
  'whereas', 'hereby', 'therefore', 'accordingly',
];

export function checkAntiTransliteration(orderText: string): GuardrailResult {
  const normalized = normalizeNFKC(orderText).toLowerCase();

  // Find all English blacklist words present in the output
  const foundEnglish = ENGLISH_BLACKLIST.filter(word =>
    // Match whole words only (word boundaries)
    new RegExp(`\\b${word}\\b`, 'i').test(normalized)
  );

  const passed = foundEnglish.length === 0;

  return {
    id: 'anti-transliteration',
    name: 'Kannada Only',
    nameKn: 'ಕನ್ನಡ ಮಾತ್ರ',
    passed,
    details: passed
      ? 'No English words detected'
      : `English words found: ${foundEnglish.join(', ')}`,
    detailsKn: passed
      ? 'ಆಂಗ್ಲ ಪದಗಳು ಕಂಡುಬಂದಿಲ್ಲ'
      : `ಆಂಗ್ಲ ಪದಗಳು: ${foundEnglish.join(', ')}`,
  };
}

// ═══════════════════════════════════════════════════════════
// GUARDRAIL 3: Fact-vs-Output Check
// ═══════════════════════════════════════════════════════════

/**
 * Extract numbers/identifiers from text that look like case numbers or survey numbers.
 * Patterns: "123/2025", "45/2024-25", "ಸಿ.ಆರ್.123", standalone numbers like "234"
 */
function extractNumbers(text: string): string[] {
  const normalized = normalizeNFKC(text);
  const patterns = [
    /\d+\/\d+(?:-\d+)?/g,            // Case numbers: 123/2025, 45/2024-25
    /(?:ಸಂ|ನಂ|no|No)[\.\s:]*\d+/g,  // ಸಂ.123, No.456
    /\d{2,}/g,                         // Any number with 2+ digits (survey numbers, etc.)
  ];

  const results: string[] = [];
  for (const pattern of patterns) {
    const matches = normalized.match(pattern);
    if (matches) results.push(...matches);
  }
  return [...new Set(results)]; // deduplicate
}

export function checkFactPreservation(
  inputText: string,
  outputText: string
): GuardrailResult {
  const normalizedInput = normalizeNFKC(inputText);
  const normalizedOutput = normalizeNFKC(outputText);

  const inputNumbers = extractNumbers(normalizedInput);

  if (inputNumbers.length === 0) {
    return {
      id: 'fact-preservation',
      name: 'Fact Check',
      nameKn: 'ಸಂಖ್ಯೆ ಪರಿಶೀಲನೆ',
      passed: true,
      details: 'No case/survey numbers to verify in input',
      detailsKn: 'ಇನ್‌ಪುಟ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲು ಸಂಖ್ಯೆಗಳಿಲ್ಲ',
    };
  }

  const missing = inputNumbers.filter(num => !normalizedOutput.includes(num));
  const found = inputNumbers.length - missing.length;
  const passed = missing.length === 0;

  return {
    id: 'fact-preservation',
    name: 'Fact Check',
    nameKn: 'ಸಂಖ್ಯೆ ಪರಿಶೀಲನೆ',
    passed,
    details: passed
      ? `All ${found} numbers preserved in output`
      : `${found}/${inputNumbers.length} numbers found. Missing: ${missing.join(', ')}`,
    detailsKn: passed
      ? `${found} ಸಂಖ್ಯೆಗಳು ಸರಿಯಾಗಿವೆ`
      : `${found}/${inputNumbers.length} ಸಂಖ್ಯೆಗಳು. ಕಾಣೆ: ${missing.join(', ')}`,
  };
}

// ═══════════════════════════════════════════════════════════
// GUARDRAIL 4: Word Count Check
// ═══════════════════════════════════════════════════════════

export function checkWordCount(orderText: string): GuardrailResult {
  const normalized = normalizeNFKC(orderText);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const minWords = 550;
  const maxWords = 750;
  const passed = wordCount >= minWords && wordCount <= maxWords;

  return {
    id: 'word-count',
    name: 'Word Count',
    nameKn: 'ಪದ ಎಣಿಕೆ',
    passed,
    details: passed
      ? `${wordCount} words (target: ${minWords}-${maxWords})`
      : `${wordCount} words (target: ${minWords}-${maxWords})`,
    detailsKn: passed
      ? `${wordCount} ಪದಗಳು (ಗುರಿ: ${minWords}-${maxWords})`
      : `${wordCount} ಪದಗಳು (ಗುರಿ: ${minWords}-${maxWords})`,
  };
}

// ═══════════════════════════════════════════════════════════
// COMBINED GUARDRAIL RUNNER
// ═══════════════════════════════════════════════════════════

export function runGuardrails(
  orderText: string,
  orderType: 'appeal' | 'suo_motu',
  inputText: string
): GuardrailReport {
  const results: GuardrailResult[] = [
    checkSectionCompleteness(orderText, orderType),
    checkAntiTransliteration(orderText),
    checkFactPreservation(inputText, orderText),
    checkWordCount(orderText),
  ];

  const allPassed = results.every(r => r.passed);
  const passCount = results.filter(r => r.passed).length;

  return {
    results,
    allPassed,
    summary: `${passCount}/${results.length} guardrails passed`,
    summaryKn: `${passCount}/${results.length} ರಕ್ಷಣೆಗಳು ಉತ್ತೀರ್ಣ`,
  };
}
