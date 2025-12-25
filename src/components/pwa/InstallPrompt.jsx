'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed or dismissed
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (dismissed) return;

        // Wait for cookie consent to be handled first
        const cookieConsent = localStorage.getItem('cookie-consent');
        const showDelay = cookieConsent ? 5000 : 10000; // Show faster if cookies already handled

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // Check if in standalone mode (already installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) return;

        // For iOS, show custom instructions
        if (isIOSDevice) {
            setTimeout(() => setShowBanner(true), showDelay);
            return;
        }

        // For Android/Desktop, capture the install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShowBanner(true), showDelay);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-30 lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-emerald-600" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm">Install LandSale App</h3>
                    {isIOS ? (
                        <p className="text-xs text-slate-500 mt-1">
                            Tap <span className="font-medium">Share</span> then <span className="font-medium">"Add to Home Screen"</span>
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 mt-1">
                            Get quick access, offline support & notifications
                        </p>
                    )}

                    {!isIOS && (
                        <button
                            onClick={handleInstall}
                            className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                        >
                            <Download className="w-3 h-3" />
                            Install Now
                        </button>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Dismiss install prompt"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
