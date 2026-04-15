'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { setCookie, getCookie } from 'cookies-next/client';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'cookie-accept';
const COOKIE_EXPIRY_DAYS = 365;

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = getCookie(COOKIE_CONSENT_KEY);
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setCookie(COOKIE_CONSENT_KEY, 'accepted', {
            expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        setIsVisible(false);
    };

    const handleDecline = () => {
        setCookie(COOKIE_CONSENT_KEY, 'declined', {
            expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,247,240,0.97)", borderTop: "1px solid rgba(233,123,59,0.2)", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 50 }}>
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Shield style={{ width: 20, height: 20, color: "#E97B3B", flexShrink: 0 }} />
                        <div className="space-y-1">
                            <p className="text-sm" style={{ color: "#4B5563" }}>
                                We use cookies to enhance your browsing experience and analyze our traffic.
                                By clicking &quot;Accept&quot;, you consent to our use of cookies.
                            </p>
                            <p className="text-sm" style={{ color: "#9CA3AF" }}>
                                Read our{' '}
                                <Link href={`/legal/privacy`} style={{ color: "#E97B3B", textDecoration: "underline" }}>
                                    Privacy Policy
                                </Link>{' '}
                                and{' '}
                                <Link href={`/legal/terms`} style={{ color: "#E97B3B", textDecoration: "underline" }}>
                                    Terms of Service
                                </Link>{' '}
                                for more information.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDecline}
                            style={{ borderColor: "#E97B3B", color: "#E97B3B" }}
                        >
                            Decline
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            style={{ background: "linear-gradient(135deg, #F9A825, #E97B3B)", color: "white", border: "none" }}
                        >
                            Accept
                        </Button>
                        <button
                            onClick={handleDecline}
                            className="p-1 hover:bg-orange-50 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X style={{ width: 16, height: 16, color: "#9CA3AF" }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;