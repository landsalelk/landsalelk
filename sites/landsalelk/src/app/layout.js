import { Outfit, Inter } from "next/font/google";
import "./app.css";
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import AIChatWindow from '@/components/chat/AIChatWindow';

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

export const metadata = {
  title: "LandSale.lk | Sri Lanka's Premier Real Estate Platform",
  description: "Find your dream home, land, or commercial property in Sri Lanka. Connect with verified agents and access AI-driven market insights.",
  openGraph: {
    title: "LandSale.lk | Real Estate Sri Lanka",
    description: "Buy, Sell, Rent Lands & Houses in Sri Lanka.",
    url: 'https://landsale.lk',
    siteName: 'LandSale.lk',
    images: [
      {
        url: 'https://landsale.lk/og-image.jpg', // Placeholder
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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        {/* Google Fonts for Sinhala */}
        <link
          href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${outfit.className} bg-[#f0f9ff] min-h-screen`}>
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
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
