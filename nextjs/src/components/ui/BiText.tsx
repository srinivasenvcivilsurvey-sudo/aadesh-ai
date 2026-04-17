"use client";

/**
 * BiText — bilingual text wrapper (Arcada P0 sprint, 2026-04-17)
 *
 * Renders English + Kannada text in two display variants:
 *   stacked  — EN on top (larger), KN below (smaller, muted)
 *   inline   — "English / ಕನ್ನಡ" side-by-side with separator
 *
 * Respects LanguageContext: when locale === 'kn', Kannada is rendered larger.
 */

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface BiTextProps {
  en: string;
  kn: string;
  variant?: 'stacked' | 'inline';
  className?: string;
  enClassName?: string;
  knClassName?: string;
}

export function BiText({
  en,
  kn,
  variant = 'stacked',
  className = '',
  enClassName = '',
  knClassName = '',
}: BiTextProps) {
  const { locale } = useLanguage();
  const isKn = locale === 'kn';

  if (variant === 'inline') {
    return (
      <span className={className}>
        <span className={isKn ? 'text-muted-foreground text-sm' : `font-medium ${enClassName}`}>
          {en}
        </span>
        <span className="mx-1 text-gray-300">/</span>
        <span
          className={isKn ? `font-medium ${knClassName}` : 'text-muted-foreground text-sm'}
          style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}
        >
          {kn}
        </span>
      </span>
    );
  }

  // stacked (default)
  return (
    <span className={`flex flex-col leading-snug ${className}`}>
      <span
        className={
          isKn
            ? `text-sm text-muted-foreground ${enClassName}`
            : `font-medium ${enClassName}`
        }
      >
        {en}
      </span>
      <span
        className={
          isKn
            ? `font-medium ${knClassName}`
            : `text-sm text-muted-foreground ${knClassName}`
        }
        style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}
      >
        {kn}
      </span>
    </span>
  );
}
