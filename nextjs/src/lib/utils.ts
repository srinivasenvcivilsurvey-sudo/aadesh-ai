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
// ─────────────────────────────────────────────────────────────────────────────

const COMPLEXITY_THRESHOLD = 5;

export type CaseComplexity = 'simple' | 'complex';

export interface ComplexitySignal {
  complexity: CaseComplexity;
  uniqueEntities: number;
  matches: {
    amounts: string[];
    surveyKeywords: string[];
    surveyNumbers: string[];
    properNouns: string[];
  };
}

export function detectComplexity(caseDetails: string): CaseComplexity {
  return analyzeComplexity(caseDetails).complexity;
}

export function analyzeComplexity(caseDetails: string): ComplexitySignal {
  const text = caseDetails ?? '';

  const amounts = uniq(matchAll(text, /Rs\s*[\d,]+/gi));
  const surveyKeywords = uniq(matchAll(text, /survey\s+no/gi).map(s => s.toLowerCase()));
  const surveyNumbers = uniq(matchAll(text, /\b\d{1,4}\/[A-Z]?\d{1,4}\b/g));
  const properNouns = uniq(extractProperNouns(text));

  const uniqueEntities =
    amounts.length + surveyKeywords.length + surveyNumbers.length + properNouns.length;

  return {
    complexity: uniqueEntities >= COMPLEXITY_THRESHOLD ? 'complex' : 'simple',
    uniqueEntities,
    matches: { amounts, surveyKeywords, surveyNumbers, properNouns },
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
  const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) ?? [];
  return matches.filter(m => {
    const first = m.split(/\s+/)[0];
    return !PROPER_NOUN_STOPLIST.has(first);
  });
}