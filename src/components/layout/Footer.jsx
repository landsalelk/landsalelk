"use client";

import Link from "next/link";
import {
  MapPin,
  Heart,
  Send,
  ShieldCheck,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer
      suppressHydrationWarning
      className="relative mt-20 rounded-t-[3rem] border-t border-slate-100 bg-white/80 pt-16 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-lg md:pb-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="group mb-4 flex items-center gap-2">
              <div className="bg-primary-500 shadow-primary-200 flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                LandSale<span className="text-primary-500">.lk</span>
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed font-medium text-slate-500">
              Sri Lanka's most trusted real estate marketplace. Powered by AI,
              verified by agents.
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {[
                {
                  Icon: Facebook,
                  url: "https://web.facebook.com/landsalelkweb",
                  label: "Follow us on Facebook",
                },
                {
                  Icon: Twitter,
                  url: "https://x.com/landsalelk",
                  label: "Follow us on X",
                },
                {
                  Icon: Instagram,
                  url: "https://instagram.com/landsale.lk",
                  label: "Follow us on Instagram",
                },
                {
                  Icon: Youtube,
                  url: "https://www.youtube.com/@LandSale.lkwebsite",
                  label: "Subscribe on YouTube",
                },
                {
                  Icon: Linkedin,
                  url: "https://linkedin.com/company/74720589",
                  label: "Connect on LinkedIn",
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="hover:bg-primary-500 touch-target flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:text-white"
                >
                  <social.Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-5 text-lg font-bold text-slate-900">Explore</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link
                  href="/guides"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Neighborhood Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=land"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Lands for Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=sale"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Houses for Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=rent"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link
                  href="/agents"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Find Agents
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/mortgage-calculator"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/create"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Post Property
                </Link>
              </li>
              <li>
                <Link
                  href="/submit-lead"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Submit a Lead
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="mb-5 text-lg font-bold text-slate-900">
              Trust & Legal
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link
                  href="/legal"
                  className="hover:text-primary-500 flex items-center gap-2 text-slate-500 transition-colors"
                >
                  <ShieldCheck className="text-primary-400 h-4 w-4" /> Legal
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/kyc"
                  className="hover:text-primary-500 flex items-center gap-2 text-slate-500 transition-colors"
                >
                  <ShieldCheck className="text-primary-400 h-4 w-4" /> Verify
                  Identity
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-500 text-slate-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-lg font-bold text-slate-900">
              Contact Us
            </h4>
            <p className="mb-4 text-sm font-medium text-slate-500">
              Have questions? We're here to help.
            </p>

            <div className="space-y-3 text-sm">
              <a
                href="tel:+94754744474"
                className="hover:text-primary-500 touch-target flex items-center gap-2 py-1 font-medium text-slate-500 transition-colors"
                aria-label="Call us at +94 75 474 4474"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> +94 75 474 4474
              </a>
              <a
                href="mailto:support@landsale.lk"
                className="hover:text-primary-500 touch-target flex items-center gap-2 py-1 font-medium text-slate-500 transition-colors"
                aria-label="Email us at support@landsale.lk"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />{" "}
                support@landsale.lk
              </a>
            </div>

            <Link
              href="/submit-lead"
              className="mt-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
            >
              <Send className="h-4 w-4" />
              Submit a Property Request
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-center text-sm font-bold text-slate-400 md:text-left">
            &copy; 2025 LandSale.lk. Made with ❤️ in Sri Lanka
          </p>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="text-primary-400 h-4 w-4" />
              100% Verified Listings
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-400" />
              10,000+ Happy Users
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
