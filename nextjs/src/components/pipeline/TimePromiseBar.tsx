"use client";

/**
 * TimePromiseBar — bilingual 2-minute time promise (Arcada P0 sprint, 2026-04-17)
 *
 * Amber/gold banner shown during the Generating step.
 * Communicates: "Your draft will be ready in ~2 minutes"
 * Respects locale from LanguageContext — KN text rendered larger when locale === 'kn'.
 */

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

export function TimePromiseBar() {
  const { locale } = useLanguage();
  const isKn = locale === 'kn';

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-4 py-3 mb-4 border"
      style={{
        background: 'var(--color-trust-amber-bg, rgb(253,246,227))',
        borderColor: 'var(--color-gov-gold, #c9a84c)',
      }}
    >
      {/* Clock icon */}
      <span className="text-2xl flex-shrink-0" aria-hidden>⏱️</span>

      <div className="flex flex-col leading-snug">
        {/* Primary line — locale-priority first */}
        <span
          className={isKn ? 'font-semibold text-amber-900 text-base' : 'font-medium text-amber-900 text-sm'}
          style={isKn ? { fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" } : undefined}
        >
          {isKn ? 'ಸುಮಾರು 2 ನಿಮಿಷಗಳಲ್ಲಿ ಕರಡು ಸಿದ್ಧವಾಗುತ್ತದೆ' : 'Draft ready in ~2 minutes'}
        </span>

        {/* Secondary line — other language, muted */}
        <span
          className="text-xs text-amber-700"
          style={!isKn ? { fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" } : undefined}
        >
          {isKn ? 'Draft ready in ~2 minutes' : 'ಸುಮಾರು 2 ನಿಮಿಷಗಳಲ್ಲಿ ಕರಡು ಸಿದ್ಧವಾಗುತ್ತದೆ'}
        </span>
      </div>
    </div>
  );
}
