import { Outfit, Inter, Abhaya_Libre } from "next/font/google";
import "./app.css";
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import AIChatWindow from '@/components/chat/AIChatWindow';
import CookieConsent from '@/components/ui/CookieConsent';
import { ComparisonProvider } from '@/context/ComparisonContext';

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${abhayaLibre.variable}`} suppressHydrationWarning>
      <head>
      </head>
      <body className={`${outfit.className} bg-[#f0f9ff] min-h-screen`}>
        <ComparisonProvider>
          {/* Floating Background Blobs */}
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />

          <Navbar />
          <main className="pt-24 relative z-10">
            {children}
          </main>
          <Footer />
          <AIChatWindow />
          <CookieConsent />
          <Toaster position="top-center" richColors />
        </ComparisonProvider>
      </body>
    </html>
  );
}

