import { Outfit, Inter, Abhaya_Libre, Fira_Code } from "next/font/google";
import "./app.css";
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import AIChatWindow from '@/components/chat/AIChatWindow';
import CookieConsent from '@/components/ui/CookieConsent';
import { ComparisonProvider } from '@/context/ComparisonContext';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import FacebookPixel from '@/components/analytics/FacebookPixel';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { BackToTop } from '@/components/ui/BackToTop';
import { Suspense } from 'react';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const abhayaLibre = Abhaya_Libre({
  weight: ['400', '700'],
  subsets: ['sinhala', 'latin'],
  variable: '--font-abhaya-libre',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: 'swap',
});

export const metadata = {
  title: "LandSale.lk | Sri Lanka's Premier Real Estate Platform",
  description: "Find your dream home, land, or commercial property in Sri Lanka. Connect with verified agents and access AI-driven market insights.",
  metadataBase: new URL('https://landsale.lk'),
  openGraph: {
    title: "LandSale.lk | Real Estate Sri Lanka",
    description: "Buy, Sell, Rent Lands & Houses in Sri Lanka.",
    url: 'https://landsale.lk',
    siteName: 'LandSale.lk',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_LK',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${abhayaLibre.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; font-src 'self' https://fonts.gstatic.com data:; object-src 'none';" />
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LandSale" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${outfit.className} bg-[#f0f9ff] min-h-screen`}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
        >
          Skip to main content
        </a>
        <ComparisonProvider>
          {/* Floating Background Blobs */}
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />

          <Navbar />
          <main id="main-content" className="pt-24 relative z-10">
            {children}
          </main>
          <Footer />
          <AIChatWindow />
          <CookieConsent />
          <InstallPrompt />
          <BackToTop />
          <Toaster position="top-center" richColors />
        </ComparisonProvider>

        {/* Analytics Integrations */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
        {process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID} />
        )}
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
      </body>
    </html>
  );
}

