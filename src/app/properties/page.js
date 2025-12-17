'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProperties } from '@/lib/properties';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { Loader2, Search, Home, Building, Trees, Filter, MapPin } from 'lucide-react';

function SearchContent() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial filters from URL
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || searchParams.get('q') || '',
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        beds: searchParams.get('beds') || '',
        deedType: searchParams.get('deedType') || '',
        nbro: searchParams.get('nbro') === 'true',
        foreignEligible: searchParams.get('foreignEligible') === 'true',
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
        <div className="flex flex-col md:flex-row gap-8">

            {/* Sidebar Filters */}
            <aside className="w-full md:w-72 shrink-0">
                <div className="glass-card rounded-3xl p-6 sticky top-28">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-5 h-5 text-[#10b981]" />
                        <h3 className="font-bold text-slate-800 text-lg">Filters</h3>
                    </div>
                    <PropertyFilters filters={filters} onChange={setFilters} />
                </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-grow">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-500 font-medium">
                        {loading ? 'Searching...' : `${properties.length} properties found`}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 glass-card rounded-3xl">
                        <div className="text-[#10b981] flex flex-col items-center gap-3">
                            <div className="spinner" />
                            <span className="font-bold">Searching properties...</span>
                        </div>
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="glass-card rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                        <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <Search className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No properties found</h3>
                        <p className="text-slate-500 font-medium mb-6">Try adjusting your filters or search criteria.</p>
                        <button
                            onClick={() => setFilters({})}
                            className="text-[#10b981] font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <div className="min-h-screen py-8 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#d1fae5]/50 rounded-full blur-3xl -z-0" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm mb-2">
                            <MapPin className="w-4 h-4" />
                            Sri Lanka&apos;s Largest Property Listing
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Find Your Property</h1>
                        <p className="text-slate-500 font-medium">Browse the best real estate in Sri Lanka</p>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="flex items-center justify-center h-64">
                        <div className="spinner" />
                    </div>
                }>
                    <SearchContent />
                </Suspense>

            </div>
        </div>
    );
}
