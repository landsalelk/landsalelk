'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if consent was already given
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Delay showing banner slightly for better UX
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-white border-t border-slate-200 shadow-lg md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Cookie className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 mb-1">We value your privacy</h3>
                        <p className="text-sm text-slate-600">
                            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                            By clicking "Accept All", you consent to our use of cookies.
                            <Link href="/cookies" className="text-emerald-600 hover:underline ml-1">
                                Learn more
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={declineCookies}
                        className="flex-1 md:flex-none px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        Accept All
                    </button>
                </div>
                <button
                    onClick={declineCookies}
                    className="absolute top-2 right-2 md:static p-2 text-slate-400 hover:text-slate-600"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
