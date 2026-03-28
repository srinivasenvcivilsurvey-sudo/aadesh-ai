"use client";
import React from 'react';

interface HowItWorksProps {
  locale: 'kn' | 'en';
}

export default function HowItWorks({ locale }: HowItWorksProps) {
  const steps = [
    {
      number: 1,
      titleKn: 'ಆದೇಶಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ',
      titleEn: 'Upload Your Orders',
      descKn: 'ನಿಮ್ಮ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ',
      descEn: 'Upload your best finalized orders',
      color: '#1a365d',
      accent: '#ed8936',
    },
    {
      number: 2,
      titleKn: 'AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ',
      titleEn: 'AI Learns Your Style',
      descKn: 'AI ನಿಮ್ಮ ಬರವಣಿಗೆ ಶೈಲಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ',
      descEn: 'AI analyzes your writing style',
      color: '#1a365d',
      accent: '#ed8936',
    },
    {
      number: 3,
      titleKn: 'ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಹೊಸ ಆದೇಶ',
      titleEn: 'New Order in Seconds',
      descKn: 'ಹೊಸ ಪ್ರಕರಣಕ್ಕೆ ಕರಡು ತಕ್ಷಣ ಸಿದ್ಧ',
      descEn: 'Draft ready instantly for new cases',
      color: '#1a365d',
      accent: '#ed8936',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">
            {locale === 'kn' ? 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' : 'How It Works'}
          </h2>
          <p className="mt-2 text-gray-500">
            {locale === 'kn' ? '3 ಸರಳ ಹಂತಗಳು' : '3 Simple Steps'}
          </p>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={step.number}>
              {/* Step Card */}
              <div className="flex flex-col items-center text-center w-full md:w-64 group">
                {/* Animated Icon Circle */}
                <div className="relative w-24 h-24 mb-5">
                  {/* Pulse ring animation */}
                  <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                  {/* Main circle */}
                  <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}
                  >
                    {/* Step-specific SVG icon */}
                    {step.number === 1 && (
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="animate-bounce" style={{ animationDuration: '4s' }}>
                        <rect x="8" y="6" width="24" height="28" rx="3" stroke="white" strokeWidth="2" fill="none" />
                        <path d="M14 14h12M14 19h12M14 24h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M20 2v8" stroke="#ed8936" strokeWidth="2" strokeLinecap="round" />
                        <path d="M16 6l4-4 4 4" stroke="#ed8936" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {step.number === 2 && (
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="2" fill="none" />
                        {/* Brain-like paths */}
                        <path d="M15 14c0-3 3-4 5-4s5 1 5 4c0 2-2 3-3 4s-2 2-2 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="20" cy="26" r="1" fill="white" />
                        {/* Rotating progress arc */}
                        <circle cx="20" cy="20" r="17" stroke="#ed8936" strokeWidth="2" strokeDasharray="20 80" fill="none" className="origin-center animate-spin" style={{ animationDuration: '6s' }} />
                      </svg>
                    )}
                    {step.number === 3 && (
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="10" y="8" width="20" height="26" rx="2" stroke="white" strokeWidth="2" fill="none" />
                        <path d="M15 16h10M15 20h10M15 24h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Sparkles */}
                        <circle cx="32" cy="8" r="2" fill="#ed8936" className="animate-pulse" />
                        <circle cx="8" cy="12" r="1.5" fill="#ed8936" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <circle cx="34" cy="18" r="1" fill="#ed8936" className="animate-pulse" style={{ animationDelay: '1s' }} />
                      </svg>
                    )}
                  </div>
                  {/* Step number badge */}
                  <div
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                    style={{ backgroundColor: '#ed8936' }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {locale === 'kn' ? step.titleKn : step.titleEn}
                </h3>
                <p className="text-sm text-gray-500">
                  {locale === 'kn' ? step.descKn : step.descEn}
                </p>
              </div>

              {/* Arrow connector (not after last step) */}
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center md:mt-12 my-2 md:my-0 md:mx-4">
                  {/* Horizontal arrow on desktop */}
                  <svg className="hidden md:block" width="60" height="20" viewBox="0 0 60 20">
                    <line x1="0" y1="10" x2="48" y2="10" stroke="#cbd5e0" strokeWidth="2" strokeDasharray="4 3" />
                    <polygon points="48,5 58,10 48,15" fill="#ed8936" />
                  </svg>
                  {/* Vertical arrow on mobile */}
                  <svg className="md:hidden" width="20" height="40" viewBox="0 0 20 40">
                    <line x1="10" y1="0" x2="10" y2="30" stroke="#cbd5e0" strokeWidth="2" strokeDasharray="4 3" />
                    <polygon points="5,30 10,38 15,30" fill="#ed8936" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
