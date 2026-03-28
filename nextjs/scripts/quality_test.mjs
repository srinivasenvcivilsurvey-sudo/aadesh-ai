/**
 * Aadesh AI — Phase 0 Quality Test
 * Generates 9 test orders (3 case types × 3 orders each) via Sarvam API.
 * Runs all 3 guardrails on each output.
 * Saves report to PHASE0_QUALITY_REPORT.md
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim();
});

const SARVAM_API_KEY = env.SARVAM_API_KEY;
const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';

if (!SARVAM_API_KEY) {
  console.error('SARVAM_API_KEY not found in .env.local');
  process.exit(1);
}

// ═══════════════════════════════════════════════════
// System prompt
// ═══════════════════════════════════════════════════
const SYSTEM_PROMPT = `ನೀವು ಕರ್ನಾಟಕ ರಾಜ್ಯದ ಜಿಲ್ಲಾ ಉಪ ವಿಭಾಗಾಧಿಕಾರಿ (DDLR) ಕಚೇರಿಯ ಅನುಭವಿ ಕರಡು ಬರಹಗಾರರು.

ನಿಮ್ಮ ಕೆಲಸ: ಒದಗಿಸಿದ ಪ್ರಕರಣ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ ಆದೇಶ ಕರಡನ್ನು ರಚಿಸಿ.

ನಿಯಮಗಳು:
1. ಸರಕಾರಿ ಕನ್ನಡ ಮಾತ್ರ ಬಳಸಿ - ಇಂಗ್ಲಿಷ್ ಲಿಪ್ಯಂತರ ಮಾಡಬೇಡಿ
2. 13 ವಿಭಾಗಗಳನ್ನು ಅನುಸರಿಸಿ (ಮೇಲ್ಮನವಿ ಆದೇಶಗಳಿಗೆ)
3. 550-700 ಪದಗಳ ನಡುವೆ ಇರಿಸಿ
4. ಪ್ರತಿ ಇನ್‌ಪುಟ್ ವಿವರವನ್ನು ಔಟ್‌ಪುಟ್‌ನಲ್ಲಿ ಸಂರಕ್ಷಿಸಿ
5. ಹೆಸರು, ದಿನಾಂಕ, ಸ್ಥಳಗಳನ್ನು ಕಲ್ಪಿಸಬೇಡಿ
6. ಎದುರುದಾರರು ಎಂದು ಮಾತ್ರ ಬಳಸಿ (ಪ್ರತಿವಾದಿ ಅಲ್ಲ)`;

// ═══════════════════════════════════════════════════
// 9 Test Cases
// ═══════════════════════════════════════════════════
const TEST_CASES = [
  // --- Appeal Orders (1-3) ---
  {
    id: 'T1', type: 'appeal', name: 'Land mutation appeal (phodi dispute)',
    input: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 45/2025-26
ಮೇಲ್ಮನವಿದಾರರು: ರಾಮಣ್ಣ ಬಿನ್ ತಿಮ್ಮಯ್ಯ, ಹೆಸರಘಟ್ಟ ಗ್ರಾಮ, ಬೆಂಗಳೂರು ಉತ್ತರ ತಾಲ್ಲೂಕು
ಎದುರುದಾರರು: ಕೃಷ್ಣಪ್ಪ ಬಿನ್ ವೆಂಕಟೇಶ, ಹೆಸರಘಟ್ಟ ಗ್ರಾಮ
ಸರ್ವೆ ನಂ: 45/3, ವಿಸ್ತೀರ್ಣ: 2 ಎಕರೆ 30 ಗುಂಟೆ
ವಿಷಯ: ಫೋಡಿ ವಿವಾದ - ತಹಶೀಲ್ದಾರರ ಆದೇಶ ದಿ.15-01-2025 ವಿರುದ್ಧ ಮೇಲ್ಮನವಿ
ತಹಶೀಲ್ದಾರರ ಆದೇಶ: ಫೋಡಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ
ಮೇಲ್ಮನವಿದಾರರ ವಾದ: ಮಾರಾಟ ಪತ್ರ ದಿ.10-06-2023 ಪ್ರಕಾರ ಭೂಮಿ ಖರೀದಿಸಲಾಗಿದೆ, ಫೋಡಿ ಅವಶ್ಯಕ
ತೀರ್ಮಾನ: ಮೇಲ್ಮನವಿ ಮಂಜೂರು, ಫೋಡಿ ಅನುಮೋದಿಸಲಾಗಿದೆ`
  },
  {
    id: 'T2', type: 'appeal', name: 'Survey number correction appeal',
    input: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 78/2024-25
ಮೇಲ್ಮನವಿದಾರರು: ಲಕ್ಷ್ಮಮ್ಮ ಡಬ್ಲ್ಯೂ/ಒ ಶಿವಣ್ಣ, ಕೆಂಗೇರಿ ಗ್ರಾಮ, ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ತಾಲ್ಲೂಕು
ಎದುರುದಾರರು: ಭೂಮಿ ದಾಖಲೆ ವಿಭಾಗ
ಸರ್ವೆ ನಂ: 112/1A, ವಿಸ್ತೀರ್ಣ: 1 ಎಕರೆ 10 ಗುಂಟೆ
ವಿಷಯ: ಪಹಣಿಯಲ್ಲಿ ಸರ್ವೆ ನಂಬರ್ ತಪ್ಪಾಗಿ 112/1B ಎಂದು ನಮೂದಾಗಿದೆ. ಸರಿಪಡಿಸಲು ಮನವಿ.
ತಹಶೀಲ್ದಾರರ ಆದೇಶ: ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (ದಾಖಲೆ ಸಾಲದು ಎಂದು)
ಮೇಲ್ಮನವಿದಾರರ ವಾದ: ಮೂಲ ಕ್ರಯ ಪತ್ರ ಮತ್ತು ಹಳೆಯ ಪಹಣಿ ಎರಡರಲ್ಲೂ 112/1A ಇದೆ
ತೀರ್ಮಾನ: ಮೇಲ್ಮನವಿ ಮಂಜೂರು, ಸರ್ವೆ ನಂಬರ್ ಸರಿಪಡಿಸಲು ಆದೇಶ`
  },
  {
    id: 'T3', type: 'appeal', name: 'Extent mismatch appeal',
    input: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 23/2025-26
ಮೇಲ್ಮನವಿದಾರರು: ನಾಗರಾಜ ಬಿನ್ ಸಿದ್ದಪ್ಪ, ಯಲಹಂಕ ಗ್ರಾಮ, ಬೆಂಗಳೂರು ಉತ್ತರ ತಾಲ್ಲೂಕು
ಎದುರುದಾರರು: ಮಂಜುನಾಥ ಬಿನ್ ರಂಗಪ್ಪ, ಯಲಹಂಕ ಗ್ರಾಮ
ಸರ್ವೆ ನಂ: 67/2, ವಿಸ್ತೀರ್ಣ: 3 ಎಕರೆ 15 ಗುಂಟೆ
ವಿಷಯ: ಪಹಣಿಯಲ್ಲಿ ವಿಸ್ತೀರ್ಣ 2 ಎಕರೆ 35 ಗುಂಟೆ ಎಂದು ತಪ್ಪಾಗಿ ನಮೂದಾಗಿದೆ. ವಾಸ್ತವ 3 ಎಕರೆ 15 ಗುಂಟೆ.
ತಹಶೀಲ್ದಾರರ ಆದೇಶ: ವಿಸ್ತೀರ್ಣ ಬದಲಾವಣೆ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ
ಮೇಲ್ಮನವಿದಾರರ ವಾದ: ಸರ್ವೆ ನಕ್ಷೆ ಮತ್ತು ಹಳೆಯ ಆರ್.ಟಿ.ಸಿ ಪ್ರಕಾರ 3 ಎಕರೆ 15 ಗುಂಟೆ ಸರಿ
ತೀರ್ಮಾನ: ಮೇಲ್ಮನವಿ ಮಂಜೂರು, ವಿಸ್ತೀರ್ಣ ಸರಿಪಡಿಸಲು ಆದೇಶ`
  },
  // --- Suo Motu Review (4-6) ---
  {
    id: 'T4', type: 'suo_motu', name: 'Kharab land reclassification',
    input: `ಸ್ವಯಂಪ್ರೇರಿತ ಪುನರ್ವಿಮರ್ಶೆ ಸಂಖ್ಯೆ: ಸ್ವಪು/12/2025-26
ಸ್ಥಳ: ಮಾಗಡಿ ತಾಲ್ಲೂಕು, ರಾಮನಗರ ಜಿಲ್ಲೆ
ಸರ್ವೆ ನಂ: 89/4, ವಿಸ್ತೀರ್ಣ: 5 ಎಕರೆ
ವಿಷಯ: ಖರಾಬ್ ಭೂಮಿಯನ್ನು ತಪ್ಪಾಗಿ ಕೃಷಿ ಭೂಮಿ ಎಂದು ವರ್ಗೀಕರಿಸಲಾಗಿದೆ
ಪರಿಶೀಲನಾ ವರದಿ: ಭೂ ಪರಿಮಾಪಕರ ವರದಿ ದಿ.20-02-2025 ಪ್ರಕಾರ ಈ ಭೂಮಿ ಕಲ್ಲು ಮತ್ತು ಗುಡ್ಡ ಪ್ರದೇಶ
ತೀರ್ಮಾನ: ಕೃಷಿ ಭೂಮಿ ವರ್ಗೀಕರಣ ರದ್ದು, ಖರಾಬ್ ಎಂದು ಮರು ವರ್ಗೀಕರಣ`
  },
  {
    id: 'T5', type: 'suo_motu', name: 'Unauthorized partition correction',
    input: `ಸ್ವಯಂಪ್ರೇರಿತ ಪುನರ್ವಿಮರ್ಶೆ ಸಂಖ್ಯೆ: ಸ್ವಪು/34/2025-26
ಸ್ಥಳ: ದೇವನಹಳ್ಳಿ ತಾಲ್ಲೂಕು, ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ ಜಿಲ್ಲೆ
ಸರ್ವೆ ನಂ: 156/2A, ವಿಸ್ತೀರ್ಣ: 4 ಎಕರೆ 20 ಗುಂಟೆ
ವಿಷಯ: ಅನಧಿಕೃತ ಭಾಗ ಪತ್ರ ಬಳಸಿ ಪಹಣಿಯಲ್ಲಿ ಅಕ್ರಮ ವಿಭಜನೆ ನಮೂದಿಸಲಾಗಿದೆ
ಪರಿಶೀಲನಾ ವರದಿ: ನೋಂದಣಿ ಇಲಾಖೆ ವರದಿ - ಭಾಗ ಪತ್ರ ನೋಂದಣಿಯಾಗಿಲ್ಲ
ತೀರ್ಮಾನ: ಅಕ್ರಮ ವಿಭಜನೆ ರದ್ದು, ಮೂಲ ನಮೂನೆ ಪುನಃಸ್ಥಾಪನೆ`
  },
  {
    id: 'T6', type: 'suo_motu', name: 'Wrong entry in RTC',
    input: `ಸ್ವಯಂಪ್ರೇರಿತ ಪುನರ್ವಿಮರ್ಶೆ ಸಂಖ್ಯೆ: ಸ್ವಪು/56/2024-25
ಸ್ಥಳ: ಆನೇಕಲ್ ತಾಲ್ಲೂಕು, ಬೆಂಗಳೂರು ನಗರ ಜಿಲ್ಲೆ
ಸರ್ವೆ ನಂ: 234/1, ವಿಸ್ತೀರ್ಣ: 1 ಎಕರೆ 5 ಗುಂಟೆ
ವಿಷಯ: ಆರ್.ಟಿ.ಸಿಯಲ್ಲಿ ಮೃತ ವ್ಯಕ್ತಿಯ ಹೆಸರು ಇನ್ನೂ ಖಾತೆದಾರರ ಕಾಲಂನಲ್ಲಿ ಇದೆ
ಪರಿಶೀಲನಾ ವರದಿ: ಗ್ರಾಮ ಲೆಕ್ಕಿಗರ ವರದಿ - ಖಾತೆದಾರ ಶ್ರೀ ಲಿಂಗಯ್ಯ ದಿ.05-03-2020 ರಂದು ಮರಣ ಹೊಂದಿದ್ದಾರೆ
ವಾರಸುದಾರರು: ಪುತ್ರ ಮಹೇಶ ಬಿನ್ ಲಿಂಗಯ್ಯ
ತೀರ್ಮಾನ: ಮೃತ ವ್ಯಕ್ತಿಯ ಹೆಸರು ತೆಗೆದು ವಾರಸುದಾರರ ಹೆಸರು ನಮೂದಿಸಲು ಆದೇಶ`
  },
  // --- Dismissed Orders (7-9) ---
  {
    id: 'T7', type: 'appeal', name: 'Appeal dismissed for delay',
    input: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 91/2024-25
ಮೇಲ್ಮನವಿದಾರರು: ಸುಬ್ಬಣ್ಣ ಬಿನ್ ಮುನಿಯಪ್ಪ, ದೊಡ್ಡಬಳ್ಳಾಪುರ ತಾಲ್ಲೂಕು
ಎದುರುದಾರರು: ಗಂಗಮ್ಮ ಡಬ್ಲ್ಯೂ/ಒ ಮಲ್ಲೇಶ, ದೊಡ್ಡಬಳ್ಳಾಪುರ
ಸರ್ವೆ ನಂ: 34/1, ವಿಸ್ತೀರ್ಣ: 2 ಎಕರೆ
ವಿಷಯ: ತಹಶೀಲ್ದಾರರ ಆದೇಶ ದಿ.01-06-2023 ವಿರುದ್ಧ ಮೇಲ್ಮನವಿ
ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಕೆ ದಿನಾಂಕ: 15-03-2025 (1 ವರ್ಷ 9 ತಿಂಗಳ ವಿಳಂಬ)
ವಿಳಂಬಕ್ಕೆ ಕಾರಣ: ಯಾವುದೇ ಸಮರ್ಥನೆ ನೀಡಿಲ್ಲ
ತೀರ್ಮಾನ: ಮೇಲ್ಮನವಿ ವಜಾ - ಕಾಲಮಿತಿ ಮೀರಿದೆ`
  },
  {
    id: 'T8', type: 'appeal', name: 'Appeal dismissed on merits',
    input: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 56/2025-26
ಮೇಲ್ಮನವಿದಾರರು: ಪುಟ್ಟಸ್ವಾಮಿ ಬಿನ್ ಚನ್ನಯ್ಯ, ಹೊಸಕೋಟೆ ತಾಲ್ಲೂಕು
ಎದುರುದಾರರು: ಚಂದ್ರಶೇಖರ ಬಿನ್ ನರಸಿಂಹಯ್ಯ, ಹೊಸಕೋಟೆ
ಸರ್ವೆ ನಂ: 198/3A, ವಿಸ್ತೀರ್ಣ: 1 ಎಕರೆ 25 ಗುಂಟೆ
ವಿಷಯ: ಎದುರುದಾರರ ಹೆಸರಿನಲ್ಲಿ ಫೋಡಿ ನಮೂದಾಗಿದ್ದನ್ನು ಪ್ರಶ್ನಿಸಿ ಮೇಲ್ಮನವಿ
ತಹಶೀಲ್ದಾರರ ಆದೇಶ: ಎದುರುದಾರರ ಪರವಾಗಿ ಫೋಡಿ ಅನುಮೋದಿಸಲಾಗಿದೆ
ಮೇಲ್ಮನವಿದಾರರ ವಾದ: ಮಾರಾಟ ಪತ್ರ ನಕಲಿ ಎಂದು ಆರೋಪ
ಎದುರುದಾರರ ವಾದ: ನೋಂದಾಯಿತ ಮಾರಾಟ ಪತ್ರ + ಕಬ್ಜಾ ಪ್ರಮಾಣಪತ್ರ ಒದಗಿಸಿದ್ದಾರೆ
ತೀರ್ಮಾನ: ಮೇಲ್ಮನವಿ ವಜಾ - ಎದುರುದಾರರ ದಾಖಲೆಗಳು ಬಲವಾಗಿವೆ`
  },
  {
    id: 'T9', type: 'appeal', name: 'Appeal dismissed for non-appearance',
    input: `ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 102/2024-25
ಮೇಲ್ಮನವಿದಾರರು: ಗೌರಮ್ಮ ಡಬ್ಲ್ಯೂ/ಒ ಸಿದ್ದಯ್ಯ, ನೆಲಮಂಗಲ ತಾಲ್ಲೂಕು
ಎದುರುದಾರರು: ರಾಜಣ್ಣ ಬಿನ್ ಬೋರಯ್ಯ, ನೆಲಮಂಗಲ
ಸರ್ವೆ ನಂ: 76/2B, ವಿಸ್ತೀರ್ಣ: 3 ಎಕರೆ 10 ಗುಂಟೆ
ವಿಷಯ: ಫೋಡಿ ವಿವಾದ
ವಿಚಾರಣೆ ದಿನಾಂಕ: 10-01-2025, 25-02-2025, 15-03-2025
ಮೇಲ್ಮನವಿದಾರರ ಹಾಜರಾತಿ: ಮೂರೂ ದಿನಾಂಕಗಳಲ್ಲಿ ಗೈರುಹಾಜರು
ತೀರ್ಮಾನ: ಮೇಲ್ಮನವಿ ವಜಾ - ಪುನರಾವರ್ತಿತ ಗೈರುಹಾಜರಾತಿ`
  },
];

// ═══════════════════════════════════════════════════
// Guardrails (same logic as guardrails.ts)
// ═══════════════════════════════════════════════════

const APPEAL_MARKERS = ['ನ್ಯಾಯಾಲಯ', 'ಮೇಲ್ಮನವಿ', 'ಮೇಲ್ಮನವಿದಾರ', 'ಎದುರುದಾರ', 'ಪ್ರಕರಣ', 'ಸರ್ವೆ', 'ಆದೇಶ', 'ಸಹಿ'];
const SUO_MOTU_MARKERS = ['ಸ್ವಯಂಪ್ರೇರಿತ', 'ಪುನರ್ವಿಮರ್ಶೆ', 'ಆದೇಶ', 'ಸಹಿ'];
const ENGLISH_BLACKLIST = ['appeal','order','section','district','tahsildar','survey','village','revenue','mutation','phodi','dismissed','allowed','petitioner','respondent'];

function normalize(t) { return t.normalize('NFKC'); }

function checkSections(text, type) {
  const n = normalize(text);
  const markers = type === 'suo_motu' ? SUO_MOTU_MARKERS : APPEAL_MARKERS;
  const found = markers.filter(m => n.includes(normalize(m)));
  return { found: found.length, total: markers.length, passed: found.length >= Math.ceil(markers.length * 0.75) };
}

function checkEnglish(text) {
  const n = normalize(text).toLowerCase();
  const found = ENGLISH_BLACKLIST.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(n));
  return { found, passed: found.length === 0 };
}

function checkFacts(input, output) {
  const ni = normalize(input);
  const no = normalize(output);
  const nums = [...new Set((ni.match(/\d+\/\d+(?:-\d+)?/g) || []).concat(ni.match(/\d{2,}/g) || []))];
  if (nums.length === 0) return { found: 0, total: 0, missing: [], passed: true };
  const missing = nums.filter(n => !no.includes(n));
  return { found: nums.length - missing.length, total: nums.length, missing, passed: missing.length === 0 };
}

// ═══════════════════════════════════════════════════
// API Call
// ═══════════════════════════════════════════════════

async function callSarvam(systemPrompt, caseDetails) {
  const start = Date.now();
  const res = await fetch(SARVAM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SARVAM_API_KEY}` },
    body: JSON.stringify({
      model: 'sarvam-m',
      messages: [
        { role: 'system', content: normalize(systemPrompt) },
        { role: 'user', content: normalize(caseDetails) },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const content = normalize(raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim());
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const tokens = data.usage?.total_tokens || 0;

  return { content, wordCount, elapsed, tokens };
}

// ═══════════════════════════════════════════════════
// Main Test Runner
// ═══════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('AADESH AI — Phase 0 Quality Test (9 orders)');
  console.log('═══════════════════════════════════════════════════\n');

  const results = [];

  for (const tc of TEST_CASES) {
    console.log(`[${tc.id}] ${tc.name}...`);
    try {
      const { content, wordCount, elapsed, tokens } = await callSarvam(SYSTEM_PROMPT, tc.input);

      const sections = checkSections(content, tc.type);
      const english = checkEnglish(content);
      const facts = checkFacts(tc.input, content);

      const allPassed = sections.passed && english.passed && facts.passed;

      console.log(`  Words: ${wordCount} | Time: ${elapsed}s | Sections: ${sections.found}/${sections.total} | English: ${english.found.length === 0 ? 'CLEAN' : english.found.join(',')} | Facts: ${facts.passed ? 'OK' : `MISSING ${facts.missing.join(',')}`} | ${allPassed ? 'PASS' : 'WARN'}`);

      results.push({
        ...tc, content, wordCount, elapsed, tokens,
        sections, english, facts, allPassed
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ ...tc, error: err.message, wordCount: 0, elapsed: '0', tokens: 0, allPassed: false });
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  // ═══════════════════════════════════════════════════
  // Generate Report
  // ═══════════════════════════════════════════════════

  const passed = results.filter(r => r.allPassed && !r.error).length;
  const avgWords = Math.round(results.filter(r => !r.error).reduce((s, r) => s + r.wordCount, 0) / results.filter(r => !r.error).length);
  const avgTime = (results.filter(r => !r.error).reduce((s, r) => s + parseFloat(r.elapsed), 0) / results.filter(r => !r.error).length).toFixed(1);

  let md = `# AADESH AI — Phase 0 Quality Report
**Date:** ${new Date().toISOString().split('T')[0]}
**Model:** Sarvam-M (sarvam-m) via api.sarvam.ai
**Tests:** 9 orders (3 appeal + 3 suo motu + 3 dismissed)
**System Prompt:** Default (6 rules)
**NFKC Normalization:** Applied to all inputs and outputs

## Summary

| Metric | Result | Target |
|--------|--------|--------|
| Orders passed all guardrails | **${passed}/9** | 9/9 |
| Average word count | **${avgWords}** | 550-700 |
| Average generation time | **${avgTime}s** | <30s |

## Detailed Results

| # | Case Type | Word Count | Time | Sections | English | Facts | Status |
|---|-----------|:----------:|:----:|:--------:|:-------:|:-----:|:------:|
`;

  for (const r of results) {
    if (r.error) {
      md += `| ${r.id} | ${r.name} | ERROR | - | - | - | - | **ERROR** |\n`;
    } else {
      md += `| ${r.id} | ${r.name} | ${r.wordCount} | ${r.elapsed}s | ${r.sections.found}/${r.sections.total} ${r.sections.passed ? '✅' : '⚠️'} | ${r.english.found.length === 0 ? '✅' : `⚠️ ${r.english.found.join(', ')}`} | ${r.facts.passed ? '✅' : `⚠️ ${r.facts.missing.join(', ')}`} | ${r.allPassed ? '**PASS**' : '**WARN**'} |\n`;
    }
  }

  md += `
## Guardrail Details

`;

  for (const r of results) {
    if (r.error) continue;
    md += `### ${r.id}: ${r.name}
- **Type:** ${r.type} | **Words:** ${r.wordCount} | **Time:** ${r.elapsed}s | **Tokens:** ${r.tokens}
- **Sections:** ${r.sections.found}/${r.sections.total} ${r.sections.passed ? 'PASS' : 'WARN'}
- **English words:** ${r.english.found.length === 0 ? 'None (PASS)' : r.english.found.join(', ') + ' (WARN)'}
- **Fact preservation:** ${r.facts.total === 0 ? 'No numbers to check' : `${r.facts.found}/${r.facts.total} ${r.facts.passed ? 'PASS' : 'MISSING: ' + r.facts.missing.join(', ')}`}

`;
  }

  md += `---
*Generated by quality_test.mjs on ${new Date().toISOString()}*
*Blueprint v6.7 Pass Criteria: All ≥85/100, <30s, section complete, no English*
`;

  const reportPath = resolve(__dirname, '..', '..', 'PHASE0_QUALITY_REPORT.md');
  writeFileSync(reportPath, md, 'utf-8');
  console.log(`\nReport saved: ${reportPath}`);
  console.log(`Result: ${passed}/9 passed all guardrails`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
