import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Shield, Globe, Download, CreditCard, CheckCircle } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import HomePricing from "@/components/HomePricing";

export default function Home() {
  const features = [
    {
      icon: FileText,
      title: 'AI ಆದೇಶ ಕರಡು',
      titleEn: 'AI Order Drafting',
      description: 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ 13-ವಿಭಾಗ ಆದೇಶಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ',
      color: 'text-primary-600'
    },
    {
      icon: Shield,
      title: 'ಸುರಕ್ಷಿತ ಮತ್ತು ಖಾಸಗಿ',
      titleEn: 'Secure & Private',
      description: 'ನಿಮ್ಮ ಪ್ರಕರಣ ದತ್ತಾಂಶ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ಸುರಕ್ಷಿತ',
      color: 'text-green-600'
    },
    {
      icon: Globe,
      title: 'ಕನ್ನಡ ಮೊದಲು',
      titleEn: 'Kannada First',
      description: 'ಸರಕಾರಿ ಕನ್ನಡ ಪರಿಭಾಷೆ, 64 ನಿಯಮಿತ ಪದಗಳು, ಸರಿಯಾದ ಶೈಲಿ',
      color: 'text-orange-600'
    },
    {
      icon: Download,
      title: 'DOCX & PDF ಡೌನ್‌ಲೋಡ್',
      titleEn: 'DOCX & PDF Export',
      description: 'ಪ್ರೊಫೆಷನಲ್ ಫಾರ್ಮ್ಯಾಟ್‌ನಲ್ಲಿ ತಕ್ಷಣ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      color: 'text-blue-600'
    },
    {
      icon: CreditCard,
      title: 'ರೀಚಾರ್ಜ್ ಮಾಡೆಲ್',
      titleEn: 'Recharge Model',
      description: '₹499 ರಿಂದ ಪ್ರಾರಂಭ. ಬೇಕಾದಷ್ಟು ಮಾತ್ರ ಪಾವತಿಸಿ.',
      color: 'text-purple-600'
    },
    {
      icon: CheckCircle,
      title: '7 ನಿಖರತೆ ರಕ್ಷಣೆಗಳು',
      titleEn: '7 Accuracy Guardrails',
      description: 'ಪರಿಭಾಷೆ, ರಚನೆ, ಸತ್ಯ ಸಂರಕ್ಷಣೆ, ಹ್ಯಾಲುಸಿನೇಷನ್ ತಡೆ',
      color: 'text-red-600'
    }
  ];

  const stats = [
    { label: 'ಬೆಂಚ್‌ಮಾರ್ಕ್ ಸ್ಕೋರ್', value: '90/100' },
    { label: 'ಪ್ರಕರಣ ಲೈಬ್ರರಿ', value: '576+' },
    { label: 'AI ಮಾಡೆಲ್‌ಗಳು', value: '4' },
    { label: 'ಪ್ರತಿ ಆದೇಶ ವೆಚ್ಚ', value: '₹0*' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                ಆದೇಶ AI
              </span>
              <span className="ml-2 text-sm text-gray-500">Aadesh AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                ವೈಶಿಷ್ಟ್ಯಗಳು
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                ಬೆಲೆ
              </Link>
              <AuthAwareButtons variant="nav" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು
              <span className="block text-primary-600">ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ</span>
            </h1>
            <p className="mt-2 text-lg text-gray-500">Draft Government Orders in Minutes</p>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಕಚೇರಿಗಳಿಗೆ AI-ಚಾಲಿತ ಆದೇಶ ಕರಡು.
              ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ, ವೇಗವಾಗಿ, ನಿಖರವಾಗಿ, ₹0* ವೆಚ್ಚದಲ್ಲಿ.
            </p>
            <p className="mt-1 text-sm text-gray-400">*Sarvam 105B ಉಚಿತ ಟಿಯರ್ ಬಳಸಿ</p>
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

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">ವೈಶಿಷ್ಟ್ಯಗಳು</h2>
            <p className="mt-2 text-gray-500">Features</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="text-xs text-gray-400 mb-2">{feature.titleEn}</p>
                <p className="text-gray-600">{feature.description}</p>
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
            ಈಗ ಪ್ರಾರಂಭಿಸಿ
          </h2>
          <p className="mt-2 text-lg text-primary-100">Get Started Now</p>
          <p className="mt-4 text-xl text-primary-100">
            ನಿಮ್ಮ ಕಚೇರಿಯ ಆದೇಶ ಕರಡು ಪ್ರಕ್ರಿಯೆಯನ್ನು AI ನೊಂದಿಗೆ ವೇಗಗೊಳಿಸಿ
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
          >
            ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">ಉತ್ಪನ್ನ</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900">ವೈಶಿಷ್ಟ್ಯಗಳು</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900">ಬೆಲೆ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">ಕಾನೂನು</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">ಗೌಪ್ಯತಾ ನೀತಿ</Link></li>
                <li><Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">ನಿಯಮಗಳು</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">ಸಂಪರ್ಕ</h4>
              <ul className="mt-4 space-y-2">
                <li className="text-gray-600">support@aadesh.ai</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} ಆದೇಶ AI (Aadesh AI). ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
