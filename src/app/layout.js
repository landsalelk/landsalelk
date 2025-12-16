import { Outfit, Inter } from "next/font/google";
import "./app.css";
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';

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
  title: "Landsale.lk | Sri Lanka's Premier Real Estate Platform",
  description: "Find your dream home, land, or commercial property in Sri Lanka. Connect with verified agents and access AI-driven market insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className={`${outfit.className} bg-slate-50`}>
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
