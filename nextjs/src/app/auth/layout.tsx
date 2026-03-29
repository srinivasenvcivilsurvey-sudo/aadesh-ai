import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;
    const highlights = [
        {
            icon: "🎯",
            title: "90/100 ಗುಣಮಟ್ಟ ಸ್ಕೋರ್",
            titleEn: "90/100 Quality Score",
            desc: "ನಿಜವಾದ ಆದೇಶಗಳ ವಿರುದ್ಧ ಬೆಂಚ್‌ಮಾರ್ಕ್ ಮಾಡಲಾಗಿದೆ",
            descEn: "Benchmarked against real government orders",
        },
        {
            icon: "📚",
            title: "576+ ಆದೇಶಗಳ ಲೈಬ್ರರಿ",
            titleEn: "576+ Orders Library",
            desc: "ಕರ್ನಾಟಕ DDLR ಆದೇಶಗಳಿಂದ ತರಬೇತಿ ಪಡೆದಿದೆ",
            descEn: "Trained on Karnataka DDLR orders",
        },
        {
            icon: "🛡️",
            title: "7 ನಿಖರತೆ ರಕ್ಷಣೆಗಳು",
            titleEn: "7 Accuracy Guardrails",
            desc: "ಪರಿಭಾಷೆ, ರಚನೆ, ಸತ್ಯ ಸಂರಕ್ಷಣೆ, ಹ್ಯಾಲುಸಿನೇಷನ್ ತಡೆ",
            descEn: "Terminology, structure, fact preservation, anti-hallucination",
        },
    ];

    return (
        <div className="flex min-h-screen">
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative">
                <Link
                    href="/"
                    className="absolute left-8 top-8 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ← ಮುಖಪುಟಕ್ಕೆ / Home
                </Link>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                        {productName}
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800">
                <div className="w-full flex items-center justify-center p-12">
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-white text-2xl font-bold mb-2">
                            ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು AI ನೊಂದಿಗೆ ರಚಿಸಿ
                        </h3>
                        <p className="text-primary-100 text-sm mb-8">
                            Draft Government Orders with AI
                        </p>
                        {highlights.map((item, index) => (
                            <div
                                key={index}
                                className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary-400/30 flex items-center justify-center text-2xl">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-white mb-1">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-primary-200 mb-1">
                                            {item.titleEn}
                                        </p>
                                        <p className="text-sm text-white/70 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 text-center space-y-1">
                            <p className="text-primary-100 text-sm font-medium">
                                🇮🇳 ಬೆಂಗಳೂರಿನಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ | Made in Bengaluru
                            </p>
                            <p className="text-primary-200 text-xs">
                                Sarvam AI ಮೂಲಕ ಸಂಚಾಲಿತ | ₹0* ಪ್ರತಿ ಆದೇಶ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}