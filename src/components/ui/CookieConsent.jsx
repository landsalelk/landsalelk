"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

// Safe localStorage helper for private browsing mode
const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {
      // localStorage not available (private browsing, etc.)
      console.warn("localStorage not available:", e);
    }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      // localStorage not available (private browsing, etc.)
      console.warn("localStorage not available:", e);
    }
    return false;
  },
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent was already given
    const consent = safeLocalStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    safeLocalStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    safeLocalStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="safe-area-bottom fixed right-0 bottom-0 left-0 z-[60] border-t border-slate-200 bg-white p-4 shadow-lg md:p-6 lg:bottom-0"
      style={{ bottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <Cookie className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="cookie-consent-title"
              className="mb-1 font-bold text-slate-800"
            >
              We value your privacy
            </h3>
            <p
              id="cookie-consent-description"
              className="text-sm text-slate-600"
            >
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. By clicking "Accept
              All", you consent to our use of cookies.
              <Link
                href="/cookies"
                className="ml-1 font-semibold text-emerald-600 hover:underline"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <div
          className="flex w-full items-center gap-3 md:w-auto"
          role="group"
          aria-label="Cookie consent options"
        >
          <button
            onClick={declineCookies}
            className="touch-target flex-1 rounded-xl bg-slate-100 px-6 py-2.5 font-semibold text-slate-600 transition-colors hover:bg-slate-200 md:flex-none"
            aria-label="Decline all cookies"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="touch-target flex-1 rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 md:flex-none"
            aria-label="Accept all cookies"
          >
            Accept All
          </button>
        </div>
        <button
          onClick={declineCookies}
          className="touch-target absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 md:static"
          aria-label="Close cookie consent banner"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
