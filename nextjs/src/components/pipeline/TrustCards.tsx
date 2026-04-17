"use client";

/**
 * TrustCards — trio of trust / legal-notice cards (Arcada P0 sprint, 2026-04-17)
 *
 * Shown at the top of the PreviewEditorStep before the editable order text.
 *
 * Cards:
 *  1. Green  shield  — Data secure / ಮಾಹಿತಿ ಸುರಕ್ಷಿತ
 *  2. Amber  triangle — Verify before download / ಡೌನ್‌ಲೋಡ್ ಮಾಡುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ
 *  3. Blue   pen     — Officer responsibility / ಅಧಿಕಾರಿ ಜವಾಬ್ದಾರಿ
 */

import React from 'react';

interface TrustCard {
  icon: string;
  bgVar: string;
  borderColor: string;
  en: string;
  kn: string;
}

const CARDS: TrustCard[] = [
  {
    icon: '🛡️',
    bgVar: 'var(--color-trust-green-bg, rgb(232,244,237))',
    borderColor: '#86efac',
    en: 'Data is encrypted and secure',
    kn: 'ಮಾಹಿತಿ ಸುರಕ್ಷಿತ ಮತ್ತು ಗೌಪ್ಯ',
  },
  {
    icon: '⚠️',
    bgVar: 'var(--color-trust-amber-bg, rgb(253,246,227))',
    borderColor: '#fcd34d',
    en: 'Verify all details before download',
    kn: 'ಡೌನ್\u200Cಲೋಡ್ ಮಾಡುವ ಮೊದಲು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
  },
  {
    icon: '✍️',
    bgVar: 'var(--color-trust-blue-bg, rgb(232,237,246))',
    borderColor: '#93c5fd',
    en: 'Officer is responsible for final order',
    kn: 'ಅಂತಿಮ ಆದೇಶಕ್ಕೆ ಅಧಿಕಾರಿ ಜವಾಬ್ದಾರರು',
  },
];

export function TrustCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {CARDS.map((card) => (
        <div
          key={card.en}
          className="flex flex-col items-center text-center gap-1.5 rounded-lg border px-3 py-3"
          style={{ background: card.bgVar, borderColor: card.borderColor }}
        >
          <span className="text-2xl" aria-hidden>
            {card.icon}
          </span>
          <span className="text-xs font-medium text-gray-800 leading-snug">
            {card.en}
          </span>
          <span
            className="text-[11px] text-gray-500 leading-snug"
            style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}
          >
            {card.kn}
          </span>
        </div>
      ))}
    </div>
  );
}
