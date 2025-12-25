"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/home/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { databases } from "@/lib/appwrite";
import { DB_ID, COLLECTION_LISTINGS } from "@/appwrite/config";
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
  Loader2
} from "lucide-react";
import Link from "next/link";

// Skeleton component for loading state
function PropertySkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded mb-4"></div>
        <div className="h-5 w-28 bg-emerald-100 rounded"></div>
      </div>
    </div>
  );
}

// Client Component for fast cold start
export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({ lands: 0, houses: 0, apartments: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch data client-side to avoid SSR blocking
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch in parallel
        const [propertiesRes, landsRes, housesRes, apartmentsRes] = await Promise.all([
          databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
            Query.limit(8),
            Query.orderDesc('$createdAt'),
          ]).catch(() => ({ documents: [] })),
          databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
            Query.equal('category_id', 'land'),
            Query.limit(1)
          ]).catch(() => ({ total: 0 })),
          databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
            Query.equal('category_id', 'house'),
            Query.limit(1)
          ]).catch(() => ({ total: 0 })),
          databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [
            Query.equal('category_id', 'apartment'),
            Query.limit(1)
          ]).catch(() => ({ total: 0 }))
        ]);

        setFeaturedProperties(propertiesRes.documents || []);
        setCategoryCounts({
          lands: landsRes.total || 0,
          houses: housesRes.total || 0,
          apartments: apartmentsRes.total || 0
        });
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  return (
    <div className="animate-fade-in min-h-screen">
      <Hero />

      {/* Premium Categories - Horizontal Scroll Snap */}
      <section className="relative z-10 -mt-24 pb-16">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Browse by Category</h3>
              <div className="flex gap-2 text-slate-400">
                <ArrowRight className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
              {categories.map((cat, idx) => (
                <Link key={idx} href={cat.href} className="snap-start shrink-0">
                  <div className="group relative h-48 w-72 cursor-pointer overflow-hidden rounded-2xl bg-slate-100 transition-all hover:w-80 hover:shadow-xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 transition-opacity group-hover:opacity-30`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white">
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                      <p className="text-white/80 text-sm font-medium">
                        {loading ? "..." : cat.count > 0 ? `${cat.count} Listings` : "Coming Soon"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Extra "All" Card */}
              <Link href="/properties" className="snap-start shrink-0">
                <div className="group relative h-48 w-40 cursor-pointer overflow-hidden rounded-2xl bg-slate-800 transition-all hover:shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-white/20">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-white">View All</span>
                  </div>
                </div>
              </Link>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <PropertySkeleton key={i} />
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property, idx) => (
                <div
                  key={property.$id || idx}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
              <div className="col-span-4">
                <EmptyState
                  type="listings"
                  title="No Properties Yet"
                  description="Be the first to list your property and reach thousands of buyers."
                  actionText="Post Your Property"
                  actionHref="/properties/create"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium Bento Grid - Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Why Choose LandSale.lk?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Experience the future of real estate in Sri Lanka with our AI-powered platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Card 1: Large Span */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-slate-50 p-10 border border-slate-100 group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative z-10">
                <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-200">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">AI-Powered Valuation</h3>
                <p className="text-slate-500 text-lg max-w-md">Get instant, data-driven property estimates. Our AI analyzes market trends, location data, and property features.</p>

                {/* Decorative UI element */}
                <div className="absolute bottom-8 right-8 bg-white p-4 rounded-xl shadow-lg border border-slate-100 w-48 hidden md:block animate-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded mb-2"></div>
                  <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>

            {/* Card 2: Vertical */}
            <div className="md:row-span-2 relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-10"></div>
              {/* Abstract Grid Line Art */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>

              <div className="relative z-20 h-full flex flex-col">
                <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-900/50">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Verified Listings Only</h3>
                <p className="text-slate-300 leading-relaxed mb-auto">We take trust seriously. Every listing is manually reviewed by our compliance team to ensure authenticity.</p>

                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="text-green-400 w-5 h-5" />
                    <span className="font-bold text-green-400 text-sm">Verification Passed</span>
                  </div>
                  <div className="text-xs text-white/50">Property ID: #882194</div>
                </div>
              </div>
            </div>

            {/* Card 3: Standard */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-slate-200 group hover:shadow-xl transition-all duration-500">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Legal Support</h3>
              <p className="text-slate-500">Access to legal templates and connection to registered property lawyers.</p>
            </div>

            {/* Card 4: Standard */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-slate-200 group hover:shadow-xl transition-all duration-500 flex flex-col justify-center items-center text-center">
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">1200+</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Agents Onboard</h3>
              <Link href="/agents" className="mt-4 text-sm font-bold text-blue-600 hover:underline">Find an Agent &rarr;</Link>
            </div>
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
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
