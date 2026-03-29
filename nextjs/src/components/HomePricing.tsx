"use client";
import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import PricingService from "@/lib/pricing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/context/LanguageContext';

const HomePricing = () => {
    const { locale } = useLanguage();
    const tiers = PricingService.getAllTiers();
    const commonFeatures = PricingService.getCommonFeatures(locale);
    const isEn = locale === 'en';

    return (
        <section id="pricing" className="py-24 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-2">
                        {isEn ? 'Recharge Packs' : 'ರೀಚಾರ್ಜ್ ಪ್ಯಾಕ್\u200Cಗಳು'}
                    </h2>
                    <p className="text-gray-500 mb-1">
                        {isEn ? 'ರೀಚಾರ್ಜ್ ಪ್ಯಾಕ್\u200Cಗಳು' : 'Recharge Packs'}
                    </p>
                    <p className="text-gray-600 text-lg">
                        {isEn ? 'Choose the right pack for your office' : 'ನಿಮ್ಮ ಕಚೇರಿಗೆ ಸರಿಯಾದ ಪ್ಯಾಕ್ ಆಯ್ಕೆ ಮಾಡಿ'}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.name}
                            className={`relative flex flex-col ${
                                tier.popular ? 'border-primary-500 shadow-lg scale-105' : ''
                            }`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                                    {isEn ? 'Popular' : 'ಜನಪ್ರಿಯ'}
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle>{isEn ? tier.name : tier.nameKn}</CardTitle>
                                <CardDescription>{isEn ? tier.descriptionEn : tier.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-grow flex flex-col">
                                <div className="mb-2">
                                    <span className="text-4xl font-bold">{PricingService.formatPrice(tier.price)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    {tier.orders} {isEn ? 'orders' : 'ಆದೇಶಗಳು'}
                                </p>
                                <p className="text-xs text-gray-500 mb-6">
                                    {tier.perOrder} / {isEn ? 'per order' : 'ಪ್ರತಿ ಆದೇಶ'}
                                </p>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {(isEn ? tier.featuresEn : tier.features).map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-600 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/auth/register"
                                    className={`w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${
                                        tier.popular
                                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    {isEn ? 'Get Started' : 'ಈಗ ಪ್ರಾರಂಭಿಸಿ'}
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-gray-600">
                        {isEn ? 'All packs include' : 'ಎಲ್ಲಾ ಪ್ಯಾಕ್\u200Cಗಳಲ್ಲಿ'}: {commonFeatures.join(' • ')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HomePricing;
