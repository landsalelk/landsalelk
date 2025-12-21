"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchProperties } from "@/lib/properties";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton";
import {
  Loader2,
  Search,
  Home,
  Building,
  Trees,
  Filter,
  MapPin,
  RefreshCw,
  PlusCircle,
  MessageCircle,
  Lightbulb,
} from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || searchParams.get("q") || "",
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    beds: searchParams.get("beds") || "",
    deedType: searchParams.get("deedType") || "",
    nbro: searchParams.get("nbro") === "true",
    foreignEligible: searchParams.get("foreignEligible") === "true",
  });

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const results = await searchProperties(filters);
        setProperties(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [filters]);

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full shrink-0 md:w-72">
        <div className="glass-card sticky top-28 rounded-3xl p-6">
          <div className="mb-6 flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#10b981]" />
            <h3 className="text-lg font-bold text-slate-800">Filters</h3>
          </div>
          <PropertyFilters filters={filters} onChange={setFilters} />
        </div>
      </aside>

      {/* Results Grid */}
      <div className="flex-grow">
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-medium text-slate-500">
            {loading ? "Searching..." : `${properties.length} properties found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((p, idx) => (
              <div
                key={p.$id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center md:p-12">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-blue-50 text-slate-400">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-800">
              No properties found
            </h3>
            <p className="mx-auto mb-8 max-w-md font-medium text-slate-500">
              We couldn&apos;t find any properties matching your criteria. Try
              adjusting your filters or explore other options below.
            </p>

            {/* Primary Actions */}
            <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => setFilters({})}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10b981] px-6 py-3 font-bold text-white transition-colors hover:bg-[#059669]"
              >
                <RefreshCw className="h-4 w-4" />
                Browse All Properties
              </button>
              <Link
                href="/submit-lead"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition-colors hover:border-[#10b981] hover:text-[#10b981]"
              >
                <PlusCircle className="h-4 w-4" />
                Submit a Property Request
              </Link>
            </div>

            {/* Suggestions */}
            <div className="mx-auto mb-6 max-w-lg rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-3 text-left">
                <div className="shrink-0 rounded-lg bg-amber-100 p-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-slate-800">Search Tips</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>
                      • Try a broader location (e.g., &quot;Colombo&quot;
                      instead of a specific area)
                    </li>
                    <li>
                      • Expand your price range or remove the budget filter
                    </li>
                    <li>
                      • Remove specific filters like deed type or approvals
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Secondary Link */}
            <p className="text-sm text-slate-500">
              Can&apos;t find what you&apos;re looking for?{" "}
              <Link
                href="/faq"
                className="font-semibold text-[#10b981] hover:underline"
              >
                Check our FAQ
              </Link>{" "}
              or{" "}
              <Link
                href="/agents"
                className="font-semibold text-[#10b981] hover:underline"
              >
                contact an agent
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <div className="animate-fade-in min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-panel relative mb-8 overflow-hidden rounded-3xl p-8">
          <div className="absolute top-0 right-0 -z-0 h-64 w-64 rounded-full bg-[#d1fae5]/50 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#10b981]">
              <MapPin className="h-4 w-4" />
              Sri Lanka&apos;s Largest Property Listing
            </div>
            <h1 className="mb-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Find Your Property
            </h1>
            <p className="font-medium text-slate-500">
              Browse the best real estate in Sri Lanka
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="spinner" />
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
