import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charsetLength));
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart Routing — Case Complexity Detection
// Counts unique entities in case input. ≥ COMPLEXITY_THRESHOLD → 'complex'.
// Signals: monetary amounts (Rs/₹), survey numbers, case refs (RP/CMP/WP…),
// hearing dates, and proper nouns (party/place names).
// ─────────────────────────────────────────────────────────────────────────────

const COMPLEXITY_THRESHOLD = 5;

export type CaseComplexity = 'simple' | 'complex';

export interface ComplexitySignal {
  complexity: CaseComplexity;
  uniqueEntities: number;
  matches: {
    amounts: string[];
    surveyNumbers: string[];
    caseRefs: string[];
    dates: string[];
    properNouns: string[];
  };
}

export function detectComplexity(caseDetails: string): CaseComplexity {
  return analyzeComplexity(caseDetails).complexity;
}

export function analyzeComplexity(caseDetails: string): ComplexitySignal {
  const text = caseDetails ?? '';

  // Monetary amounts: Rs 1,23,456 / ₹50000
  const amounts = uniq(matchAll(text, /(?:Rs\.?\s*|₹)\s*[\d,]+(?:\.\d+)?/gi));

  // Survey numbers: 123/A4, Survey No 45/2
  const surveyNumbers = uniq(
    matchAll(text, /\b(?:survey\s*(?:no\.?|number)?\s*)?\d{1,5}\/[A-Z0-9]{1,5}/gi)
      .map(s => s.toLowerCase()),
  );

  // Case reference numbers: RP/23/2025, CMP 45/2024, WP 1234/2023
  const caseRefs = uniq(
    matchAll(text, /\b(?:RP|CMP|MFA|WP|CRZ|RFA|LA|LR)[-/]?\d+\/\d{2,4}/gi)
      .map(s => s.toUpperCase()),
  );

  // Distinct hearing dates: 12/04/2024, 5-1-2025
  const dates = uniq(matchAll(text, /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g));

  // Proper nouns: 2+ consecutive Title Case words (party/place names)
  const properNouns = uniq(extractProperNouns(text));

  const uniqueEntities =
    amounts.length + surveyNumbers.length + caseRefs.length +
    dates.length + properNouns.length;

  return {
    complexity: uniqueEntities >= COMPLEXITY_THRESHOLD ? 'complex' : 'simple',
    uniqueEntities,
    matches: { amounts, surveyNumbers, caseRefs, dates, properNouns },
  };
}

function matchAll(text: string, pattern: RegExp): string[] {
  return text.match(pattern) ?? [];
}

function uniq(items: string[]): string[] {
  return Array.from(new Set(items));
}

const PROPER_NOUN_STOPLIST = new Set([
  'The', 'This', 'That', 'And', 'But', 'Or', 'If', 'Then', 'When',
  'Where', 'Why', 'How', 'What', 'Who', 'Which', 'Whose', 'It',
  'In', 'On', 'At', 'Of', 'For', 'To', 'By', 'With', 'From',
  'A', 'An', 'I', 'We', 'You', 'He', 'She', 'They',
]);

function extractProperNouns(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})+\b/g) ?? [];
  return matches.filter(m => {
    const first = m.split(/\s+/)[0];
    return !PROPER_NOUN_STOPLIST.has(first);
  });
}
