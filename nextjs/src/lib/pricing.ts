export interface PricingTier {
    name: string;
    nameKn: string;
    price: number;
    orders: number;
    perOrder: string;
    description: string;
    descriptionEn: string;
    features: string[];
    featuresEn: string[];
    popular?: boolean;
}

class PricingService {
    private static tiers: PricingTier[] = [
        {
            name: 'Pack A',
            nameKn: 'ಪ್ಯಾಕ್ A',
            price: 999,
            orders: 7,
            perOrder: '₹142',
            description: 'ಸಣ್ಣ ಕಚೇರಿಗಳಿಗೆ',
            descriptionEn: 'For small offices',
            features: [
                '7 AI ಆದೇಶ ಕರಡುಗಳು',
                'DOCX & PDF ಡೌನ್‌ಲೋಡ್',
                'ಸರಕಾರಿ ಕನ್ನಡ',
            ],
            featuresEn: [
                '7 AI order drafts',
                'DOCX & PDF download',
                'Sarakari Kannada',
            ],
        },
        {
            name: 'Pack B',
            nameKn: 'ಪ್ಯಾಕ್ B',
            price: 1999,
            orders: 18,
            perOrder: '₹111',
            description: 'ಮಧ್ಯಮ ಕಚೇರಿಗಳಿಗೆ',
            descriptionEn: 'For medium offices',
            features: [
                '18 AI ಆದೇಶ ಕರಡುಗಳು',
                'DOCX & PDF ಡೌನ್‌ಲೋಡ್',
                'ಸರಕಾರಿ ಕನ್ನಡ',
                'ಆದ್ಯತೆ ಬೆಂಬಲ',
            ],
            featuresEn: [
                '18 AI order drafts',
                'DOCX & PDF download',
                'Sarakari Kannada',
                'Priority support',
            ],
        },
        {
            name: 'Pack C',
            nameKn: 'ಪ್ಯಾಕ್ C',
            price: 3499,
            orders: 32,
            perOrder: '₹109',
            description: 'ದೊಡ್ಡ ಕಚೇರಿಗಳಿಗೆ',
            descriptionEn: 'For large offices',
            features: [
                '32 AI ಆದೇಶ ಕರಡುಗಳು',
                'DOCX & PDF ಡೌನ್‌ಲೋಡ್',
                'ಸರಕಾರಿ ಕನ್ನಡ',
                'ಆದ್ಯತೆ ಬೆಂಬಲ',
                'ಬಹು-ಮಾಡೆಲ್ ಆಯ್ಕೆ',
            ],
            featuresEn: [
                '32 AI order drafts',
                'DOCX & PDF download',
                'Sarakari Kannada',
                'Priority support',
                'Multi-model selection',
            ],
            popular: true,
        },
        {
            name: 'Pack D',
            nameKn: 'ಪ್ಯಾಕ್ D',
            price: 5999,
            orders: 55,
            perOrder: '₹109',
            description: 'ಅತ್ಯುತ್ತಮ ಮೌಲ್ಯ',
            descriptionEn: 'Best Value',
            features: [
                '55 AI ಆದೇಶ ಕರಡುಗಳು',
                'DOCX & PDF ಡೌನ್‌ಲೋಡ್',
                'ಸರಕಾರಿ ಕನ್ನಡ',
                'ಆದ್ಯತೆ ಬೆಂಬಲ',
                'ಬಹು-ಮಾಡೆಲ್ ಆಯ್ಕೆ',
                'ವೈಯಕ್ತಿಕ ಶೈಲಿ ಕಲಿಕೆ',
            ],
            featuresEn: [
                '55 AI order drafts',
                'DOCX & PDF download',
                'Sarakari Kannada',
                'Priority support',
                'Multi-model selection',
                'Personal style learning',
            ],
        },
    ];

    static getAllTiers(): PricingTier[] {
        return this.tiers;
    }

    static getCommonFeatures(locale: 'kn' | 'en' = 'kn'): string[] {
        if (locale === 'en') {
            return [
                'Secure login',
                'Encrypted storage',
                '7 accuracy guardrails',
                '13-section order structure',
            ];
        }
        return [
            'ಸುರಕ್ಷಿತ ಲಾಗಿನ್',
            'ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ಸಂಗ್ರಹ',
            '7 ನಿಖರತೆ ರಕ್ಷಣೆಗಳು',
            '13-ವಿಭಾಗ ಆದೇಶ ರಚನೆ',
        ];
    }

    static formatPrice(price: number): string {
        return `₹${price.toLocaleString('en-IN')}`;
    }
}

export default PricingService;
