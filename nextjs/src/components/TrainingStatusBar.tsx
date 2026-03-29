"use client";
import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import strings, { t } from '@/lib/i18n';

interface TrainingStatusBarProps {
  fileCount: number;
  typeBreakdown?: Record<string, number>;
}

type TrainingLevel = 'untrained' | 'basic' | 'good' | 'expert';

function getTrainingLevel(count: number): TrainingLevel {
  if (count < 5) return 'untrained';
  if (count < 10) return 'basic';
  if (count < 20) return 'good';
  return 'expert';
}

function getProgressPercent(count: number): number {
  if (count === 0) return 0;
  if (count < 5) return Math.round((count / 5) * 20);
  if (count < 10) return 20 + Math.round(((count - 5) / 5) * 30);
  if (count < 20) return 50 + Math.round(((count - 10) / 10) * 30);
  if (count <= 50) return 80 + Math.round(((count - 20) / 30) * 20);
  return 100;
}

const ORDER_TYPES = [
  { key: 'appeal', kn: 'ಮೇಲ್ಮನವಿ', en: 'Appeal' },
  { key: 'suo_motu', kn: 'ಸ್ವಯಂಪ್ರೇರಿತ', en: 'Suo Motu' },
  { key: 'dismissed', kn: 'ವಜಾ', en: 'Dismissed' },
  { key: 'review', kn: 'ಪುನರ್ವಿಮರ್ಶೆ', en: 'Review' },
  { key: 'other', kn: 'ಇತರೆ', en: 'Other' },
];

export default function TrainingStatusBar({ fileCount, typeBreakdown = {} }: TrainingStatusBarProps) {
  const { locale } = useLanguage();
  const level = getTrainingLevel(fileCount);
  const percent = getProgressPercent(fileCount);

  const levelConfig = {
    untrained: {
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: '\uD83D\uDD34',
      label: t(strings.training.needMoreMin, locale),
      encourage: locale === 'kn'
        ? 'ಪ್ರಾರಂಭವಾಗಿದೆ! ಇನ್ನು ಕೆಲವು ಫೈಲ್\u200Cಗಳು ಬೇಕು'
        : 'Started! Need a few more files',
    },
    basic: {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: '\uD83D\uDFE1',
      label: t(strings.training.basicTraining, locale),
      encourage: locale === 'kn'
        ? 'ಒಳ್ಳೆಯದು! AI ಕಲಿಯುತ್ತಿದೆ'
        : 'Good! AI is learning',
    },
    good: {
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: '\uD83D\uDFE2',
      label: t(strings.training.goodTraining, locale),
      encourage: locale === 'kn'
        ? 'ಅದ್ಭುತ! AI ನಿಮ್ಮ ಶೈಲಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದೆ'
        : 'Excellent! AI understands your style',
    },
    expert: {
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      icon: '\u2B50',
      label: t(strings.training.expertTraining, locale),
      encourage: locale === 'kn'
        ? 'ಶ್ರೇಷ್ಠ! ಅತ್ಯುತ್ತಮ ಗುಣಮಟ್ಟ'
        : 'Expert! Best quality',
    },
  };

  const config = levelConfig[level];

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-5`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {t(strings.training.statusTitle, locale)}
        </h3>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className={`${config.color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Encouragement message */}
      {fileCount > 0 && (
        <p className={`text-sm font-medium ${config.textColor} mb-3`}>
          {config.encourage}
        </p>
      )}

      {/* File Count */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          {fileCount} {t(strings.upload.filesUploaded, locale)}
        </span>
        <span>{percent}%</span>
      </div>

      {/* Order Type Breakdown */}
      {fileCount > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            {t(strings.training.orderTypeBreakdown, locale)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ORDER_TYPES.map((type) => {
              const count = typeBreakdown[type.key] || 0;
              return (
                <div key={type.key} className="flex items-center gap-2 text-sm">
                  <span>{count > 0 ? '\u2705' : '\u2B1C'}</span>
                  <span className="text-gray-600">
                    {locale === 'kn' ? type.kn : type.en}: {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Limit Warning */}
      {fileCount >= 50 && (
        <div className="mt-3 text-sm text-amber-700 font-medium">
          {t(strings.upload.maxReached, locale)}
        </div>
      )}
    </div>
  );
}
