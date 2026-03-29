"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Shield, Globe, Download, CreditCard, CheckCircle } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import HomePricing from '@/components/HomePricing';
import HowItWorks from '@/components/HowItWorks';
import { useLanguage } from '@/lib/context/LanguageContext';
import strings, { t } from '@/lib/i18n';

export default function LandingPage() {
  const { locale, toggleLocale } = useLanguage();

  const features = [
    {
      icon: FileText,
      titleKn: 'AI ಆದೇಶ ಕರಡು',
      titleEn: 'AI Order Drafting',
      descriptionKn: 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ 13-ವಿಭಾಗ ಆದೇಶಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ',
      descriptionEn: 'Auto-generate 13-section orders in Sarakari Kannada in minutes',
      color: 'text-primary-600',
    },
    {
      icon: Shield,
      titleKn: 'ಸುರಕ್ಷಿತ ಮತ್ತು ಖಾಸಗಿ',
      titleEn: 'Secure & Private',
      descriptionKn: 'ನಿಮ್ಮ ಪ್ರಕರಣ ದತ್ತಾಂಶ ಎನ್\u200Cಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ಸುರಕ್ಷಿತ',
      descriptionEn: 'Your case data is encrypted and secure',
      color: 'text-green-600',
    },
    {
      icon: Globe,
      titleKn: 'ಕನ್ನಡ ಮೊದಲು',
      titleEn: 'Kannada First',
      descriptionKn: 'ಸರಕಾರಿ ಕನ್ನಡ ಪರಿಭಾಷೆ, 64 ನಿಯಮಿತ ಪದಗಳು, ಸರಿಯಾದ ಶೈಲಿ',
      descriptionEn: 'Sarakari Kannada terminology, 64 regulated terms, proper style',
      color: 'text-orange-600',
    },
    {
      icon: Download,
      titleKn: 'DOCX & PDF ಡೌನ್\u200Cಲೋಡ್',
      titleEn: 'DOCX & PDF Export',
      descriptionKn: 'ಪ್ರೊಫೆಷನಲ್ ಫಾರ್ಮ್ಯಾಟ್\u200Cನಲ್ಲಿ ತಕ್ಷಣ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ',
      descriptionEn: 'Download instantly in professional format',
      color: 'text-blue-600',
    },
    {
      icon: CreditCard,
      titleKn: 'ರೀಚಾರ್ಜ್ ಮಾಡೆಲ್',
      titleEn: 'Recharge Model',
      descriptionKn: '₹499 ರಿಂದ ಪ್ರಾರಂಭ. ಬೇಕಾದಷ್ಟು ಮಾತ್ರ ಪಾವತಿಸಿ.',
      descriptionEn: 'Starting from ₹499. Pay only for what you need.',
      color: 'text-purple-600',
    },
    {
      icon: CheckCircle,
      titleKn: '7 ನಿಖರತೆ ರಕ್ಷಣೆಗಳು',
      titleEn: '7 Accuracy Guardrails',
      descriptionKn: 'ಪರಿಭಾಷೆ, ರಚನೆ, ಸತ್ಯ ಸಂರಕ್ಷಣೆ, ಹ್ಯಾಲುಸಿನೇಷನ್ ತಡೆ',
      descriptionEn: 'Terminology, structure, fact preservation, anti-hallucination',
      color: 'text-red-600',
    },
  ];

  const statsKn = [
    { label: 'ಬೆಂಚ್\u200Cಮಾರ್ಕ್ ಸ್ಕೋರ್', value: '90/100' },
    { label: 'ಪ್ರಕರಣ ಲೈಬ್ರರಿ', value: '576+' },
    { label: 'AI ಮಾಡೆಲ್\u200Cಗಳು', value: '4' },
    { label: 'ಪ್ರತಿ ಆದೇಶ ವೆಚ್ಚ', value: '₹0*' },
  ];

  const statsEn = [
    { label: 'Benchmark Score', value: '90/100' },
    { label: 'Case Library', value: '576+' },
    { label: 'AI Models', value: '4' },
    { label: 'Per Order Cost', value: '₹0*' },
  ];

  const stats = locale === 'kn' ? statsKn : statsEn;

  const trustSignals = [
    { kn: '90/100 ಗುಣಮಟ್ಟ ಸ್ಕೋರ್', en: '90/100 Quality Score' },
    { kn: '576+ ಆದೇಶಗಳಿಂದ ತರಬೇತಿ', en: 'Trained on 576+ orders' },
    { kn: 'ಭಾರತದಲ್ಲಿ ಡೇಟಾ ಶೇಖರಣೆ', en: 'Data stored in India' },
    { kn: 'Sarvam AI ಮೂಲಕ ಸಂಚಾಲಿತ', en: 'Powered by Sarvam AI' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                {t(strings.productName, locale)}
              </span>
              {locale === 'kn' && (
                <span className="ml-2 text-sm text-gray-500">Aadesh AI</span>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                {t(strings.landing.howItWorks, locale)}
              </Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                {locale === 'kn' ? 'ವೈಶಿಷ್ಟ್ಯಗಳು' : 'Features'}
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                {locale === 'kn' ? 'ಬೆಲೆ' : 'Pricing'}
              </Link>

              {/* Language Toggle */}
              <button
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-gray-500" />
                <span className={locale === 'en' ? 'font-bold text-primary-600' : 'text-gray-500'}>EN</span>
                <span className="text-gray-300">|</span>
                <span className={locale === 'kn' ? 'font-bold text-primary-600' : 'text-gray-500'}>ಕನ್ನಡ</span>
              </button>

              <AuthAwareButtons variant="nav" />
            </div>

            {/* Mobile nav buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleLocale}
                className="p-1.5 text-xs font-medium rounded border border-gray-200"
              >
                {locale === 'kn' ? 'EN' : 'ಕನ್ನಡ'}
              </button>
              <Link href="/auth/login" className="text-xs text-gray-600 hover:text-gray-900 font-medium">
                {locale === 'kn' ? 'ಲಾಗಿನ್' : 'Login'}
              </Link>
              <Link
                href="/auth/register"
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
              >
                {locale === 'kn' ? 'ಸೈನ್ ಅಪ್' : 'Sign Up'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              {locale === 'kn' ? (
                <>
                  ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು
                  <span className="block text-primary-600">ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ</span>
                </>
              ) : (
                <>
                  Generate Government Orders
                  <span className="block text-primary-600">in Minutes</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              {locale === 'kn' ? 'Draft Government Orders in Minutes' : 'ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ'}
            </p>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'kn'
                ? 'ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಕಚೇರಿಗಳಿಗೆ AI-ಚಾಲಿತ ಆದೇಶ ಕರಡು. ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ, ವೇಗವಾಗಿ, ನಿಖರವಾಗಿ, ₹0* ವೆಚ್ಚದಲ್ಲಿ.'
                : 'AI-powered order drafting for Karnataka land record offices. In Sarakari Kannada, fast, accurate, at ₹0* cost.'}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {locale === 'kn' ? '*Sarvam 105B ಉಚಿತ ಟಿಯರ್ ಬಳಸಿ' : '*Using Sarvam 105B free tier'}
            </p>
            <div className="mt-10 flex gap-4 justify-center">
              <AuthAwareButtons />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            {trustSignals.map((signal, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{locale === 'kn' ? signal.kn : signal.en}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <div id="how-it-works">
        <HowItWorks locale={locale} />
      </div>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">
              {locale === 'kn' ? 'ವೈಶಿಷ್ಟ್ಯಗಳು' : 'Features'}
            </h2>
            <p className="mt-2 text-gray-500">
              {locale === 'kn' ? 'Features' : 'ವೈಶಿಷ್ಟ್ಯಗಳು'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <h3 className="mt-4 text-xl font-semibold">
                  {locale === 'kn' ? feature.titleKn : feature.titleEn}
                </h3>
                <p className="text-xs text-gray-400 mb-2">
                  {locale === 'kn' ? feature.titleEn : feature.titleKn}
                </p>
                <p className="text-gray-600">
                  {locale === 'kn' ? feature.descriptionKn : feature.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <HomePricing />

      {/* CTA */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            {locale === 'kn' ? 'ಈಗ ಪ್ರಾರಂಭಿಸಿ' : 'Get Started Now'}
          </h2>
          <p className="mt-2 text-lg text-primary-100">
            {locale === 'kn' ? 'Get Started Now' : 'ಈಗ ಪ್ರಾರಂಭಿಸಿ'}
          </p>
          <p className="mt-4 text-xl text-primary-100">
            {locale === 'kn'
              ? 'ನಿಮ್ಮ ಕಚೇರಿಯ ಆದೇಶ ಕರಡು ಪ್ರಕ್ರಿಯೆಯನ್ನು AI ನೊಂದಿಗೆ ವೇಗಗೊಳಿಸಿ'
              : 'Speed up your office order drafting process with AI'}
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
          >
            {locale === 'kn' ? 'ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ' : 'Create Free Account'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {locale === 'kn' ? 'ಉತ್ಪನ್ನ' : 'Product'}
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900">{locale === 'kn' ? 'ವೈಶಿಷ್ಟ್ಯಗಳು' : 'Features'}</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900">{locale === 'kn' ? 'ಬೆಲೆ' : 'Pricing'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {locale === 'kn' ? 'ಕಾನೂನು' : 'Legal'}
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">{locale === 'kn' ? 'ಗೌಪ್ಯತಾ ನೀತಿ' : 'Privacy Policy'}</Link></li>
                <li><Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">{locale === 'kn' ? 'ನಿಯಮಗಳು' : 'Terms'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {locale === 'kn' ? 'ಸಂಪರ್ಕ' : 'Contact'}
              </h4>
              <ul className="mt-4 space-y-2">
                <li className="text-gray-600">support@aadesh.ai</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-center text-gray-600">
              &copy; {new Date().getFullYear()} {t(strings.productName, locale)}. {locale === 'kn' ? 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>\uD83C\uDDEE\uD83C\uDDF3</span>
              <span>{t(strings.landing.madeInBengaluru, locale)}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
