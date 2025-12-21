<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
=======
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
import { Hero } from "@/components/home/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { getFeaturedProperties } from "@/lib/properties";
<<<<<<< HEAD
import { databases } from "@/appwrite";
import { DB_ID, COLLECTION_LISTINGS } from "@/appwrite/config";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
=======
import { databases } from "@/lib/appwrite";
import { DB_ID, COLLECTION_LISTINGS } from "@/lib/constants";
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
import { Query } from "appwrite";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Brain,
  Scale,
  PlusCircle,
  Home,
  Building,
  Trees,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";

<<<<<<< HEAD
export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({
    lands: 0,
    houses: 0,
    apartments: 0,
  });
=======
// Server Component
export default async function HomePage() {
  // Fetch data in parallel
  const propertiesPromise = getFeaturedProperties(8);
  const landsPromise = databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.equal('category_id', 'land'), Query.limit(1)]).catch(() => ({ total: 0 }));
  const housesPromise = databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.equal('category_id', 'house'), Query.limit(1)]).catch(() => ({ total: 0 }));
  const apartmentsPromise = databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.equal('category_id', 'apartment'), Query.limit(1)]).catch(() => ({ total: 0 }));
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d

  const [featuredProperties, landsRes, housesRes, apartmentsRes] = await Promise.all([
    propertiesPromise,
    landsPromise,
    housesPromise,
    apartmentsPromise
  ]);

<<<<<<< HEAD
  const loadFeaturedProperties = async () => {
    try {
      const properties = await getFeaturedProperties(8);
      setFeaturedProperties(properties);
    } catch (error) {
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryCounts = async () => {
    try {
      const [landsRes, housesRes, apartmentsRes] = await Promise.all([
        databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
          Query.equal("category_id", "land"),
          Query.limit(1),
        ]),
        databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
          Query.equal("category_id", "house"),
          Query.limit(1),
        ]),
        databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
          Query.equal("category_id", "apartment"),
          Query.limit(1),
        ]),
      ]);
      setCategoryCounts({
        lands: landsRes.total,
        houses: housesRes.total,
        apartments: apartmentsRes.total,
      });
    } catch (e) {
      // Silent fail - keep default 0
    }
=======
  const categoryCounts = {
    lands: landsRes.total,
    houses: housesRes.total,
    apartments: apartmentsRes.total
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
  };

  const categories = [
    {
      name: "Lands",
      icon: Trees,
      href: "/properties?type=land",
      count: categoryCounts.lands,
      color: "bg-green-50 text-green-600",
    },
    {
      name: "Houses",
      icon: Home,
      href: "/properties?type=sale",
      count: categoryCounts.houses,
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Apartments",
      icon: Building,
      href: "/properties?type=apartment",
      count: categoryCounts.apartments,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const valueProps = [
    {
      icon: ShieldCheck,
      title: "Verified Listings",
      description: "Every property is verified by our team for authenticity",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Brain,
      title: "AI Valuation",
      description: "Get instant property valuations powered by AI",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Scale,
      title: "Legal Support",
      description: "Free legal document checklist for every transaction",
      color: "bg-purple-100 text-purple-600",
    },
  ];

<<<<<<< HEAD
  // Show skeleton while mounting to prevent content flash
  if (!mounted) {
    return (
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <div className="relative flex min-h-[80vh] items-center justify-center px-4">
          <div className="live-gradient absolute inset-0 opacity-90" />
          <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
            <div className="skeleton mx-auto mb-4 h-12 w-3/4 rounded-xl" />
            <div className="skeleton mx-auto mb-8 h-8 w-1/2 rounded-xl" />
            <div className="skeleton mx-auto h-16 w-full max-w-2xl rounded-2xl" />
          </div>
        </div>

        {/* Categories Skeleton */}
        <div className="relative z-10 -mt-10 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-3xl p-8">
                  <div className="flex items-center gap-6">
                    <div className="skeleton h-16 w-16 rounded-2xl" />
                    <div className="flex-1">
                      <div className="skeleton mb-2 h-6 w-24 rounded" />
                      <div className="skeleton h-4 w-32 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Properties Skeleton */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="skeleton mx-auto mb-8 h-10 w-64 rounded-xl" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card overflow-hidden rounded-2xl">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="space-y-3 p-4">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="flex gap-2">
                      <div className="skeleton h-6 w-16 rounded-lg" />
                      <div className="skeleton h-6 w-16 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

=======
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
  return (
    <div className="animate-fade-in min-h-screen">
      <Hero />

      {/* Categories Section */}
      <section className="relative z-10 -mt-10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {categories.map((cat, idx) => (
              <Link key={idx} href={cat.href}>
                <div className="glass-card group flex cursor-pointer items-center gap-6 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cat.color}`}
                  >
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 transition-colors group-hover:text-[#10b981]">
                      {cat.name}
                    </h3>
                    <p className="font-medium text-slate-500">
                      {cat.count} Properties
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#10b981]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1.5 text-sm font-bold text-[#10b981]">
                <Sparkles className="h-4 w-4" /> Featured Listings
              </div>
              <h2 className="text-3xl font-bold text-slate-800">
                Handpicked Properties
              </h2>
              <p className="mt-2 text-slate-500">
                Verified listings from trusted sellers across Sri Lanka
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 font-bold text-[#10b981] hover:underline"
            >
              View All Properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

<<<<<<< HEAD
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredProperties.map((property, idx) => (
=======
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.length > 0 ? (
              featuredProperties.map((property, idx) => (
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
                <div
                  key={property.$id || idx}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
                // Empty state or skeleton could go here, but for SSR usually we just show nothing or a message
                <div className="col-span-4 text-center py-12 text-slate-500">
                    No featured properties found at the moment.
                </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#10b981] via-[#06b6d4] to-[#3b82f6] p-12 text-white">
            <div className="absolute top-0 right-0 -mt-48 -mr-48 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Sell Your Property?
              </h2>
              <p className="mb-8 text-lg text-white/80">
                List your property for free and reach thousands of potential
                buyers across Sri Lanka. Get AI-powered valuation and verified
                badge.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/properties/create"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-[#10b981] shadow-xl transition-colors hover:bg-slate-100"
                >
                  <PlusCircle className="h-5 w-5" />
                  Post Free Ad
                </Link>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-8 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  Find an Agent
                </Link>
              </div>
            </div>

            {/* Decorative House */}
            <div className="absolute right-8 bottom-0 hidden h-64 w-64 opacity-30 lg:block">
              <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
                <path
                  d="M40 180V100L100 40L160 100V180H40Z"
                  fill="white"
                  opacity="0.3"
                />
                <path
                  d="M30 100L100 30L170 100"
                  stroke="white"
                  strokeWidth="6"
                  opacity="0.5"
                />
                <rect
                  x="80"
                  y="120"
                  width="40"
                  height="60"
                  fill="white"
                  opacity="0.3"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-800">
              Why Choose LandSale.lk?
            </h2>
            <p className="mx-auto max-w-2xl text-slate-500">
              Sri Lanka's most trusted real estate platform with AI-powered
              tools and verified listings
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="glass-card group rounded-3xl p-8 text-center transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${prop.color} transition-transform group-hover:scale-110`}
                >
                  <prop.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">
                  {prop.title}
                </h3>
                <p className="text-slate-500">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">
            Get the Latest Property Alerts
          </h2>
          <p className="mb-8 text-slate-500">
            Subscribe to receive notifications about new listings and price
            drops
          </p>
<<<<<<< HEAD

          {newsletterSuccess ? (
            <div className="animate-fade-in mx-auto max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-emerald-800">
                You&apos;re subscribed!
              </h3>
              <p className="mb-4 text-sm text-emerald-700">
                Check your email to verify your subscription and start receiving
                property alerts.
              </p>
              <button
                onClick={() => {
                  setNewsletterSuccess(false);
                  setNewsletterEmail("");
                }}
                className="text-sm font-semibold text-emerald-600 hover:underline"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form
              className="mx-auto max-w-md"
              onSubmit={async (e) => {
                e.preventDefault();
                const email = newsletterEmail.trim();

                // Validate email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email) {
                  setNewsletterError("Please enter your email address");
                  return;
                }
                if (!emailRegex.test(email)) {
                  setNewsletterError("Please enter a valid email address");
                  return;
                }

                setNewsletterError("");
                setSubmitting(true);

                try {
                  const result = await subscribeToNewsletter(email);
                  if (result.success) {
                    setNewsletterSuccess(true);
                    toast.success(result.message);
                  } else {
                    setNewsletterError(
                      result.error || "Subscription failed. Please try again.",
                    );
                  }
                } catch (error) {
                  setNewsletterError("Something went wrong. Please try again.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="mb-3 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterError) setNewsletterError("");
                    }}
                    disabled={submitting}
                    placeholder="Enter your email"
                    aria-invalid={!!newsletterError}
                    aria-describedby={
                      newsletterError ? "newsletter-error" : undefined
                    }
                    className={`w-full rounded-2xl border bg-white py-4 pr-6 pl-12 font-medium transition-colors outline-none disabled:opacity-50 ${
                      newsletterError
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-[#10b981]"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-w-[140px] items-center justify-center rounded-2xl bg-[#10b981] px-8 py-4 font-bold text-white shadow-lg shadow-[#10b981]/30 transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              {newsletterError && (
                <p
                  id="newsletter-error"
                  className="flex items-center justify-center gap-1 text-sm text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" />
                  {newsletterError}
                </p>
              )}

              <p className="mt-4 text-xs text-slate-400">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          )}
=======
          <NewsletterForm />
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
        </div>
      </section>
    </div>
  );
}
