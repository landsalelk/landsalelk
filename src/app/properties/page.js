'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProperties } from '@/lib/properties';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { Loader2 } from 'lucide-react';

function SearchContent() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize state from URL params
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
    });

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            try {
                // Add slight debounce in real app, but ok for now
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
            <aside className="w-full md:w-64 shrink-0">
                <PropertyFilters filters={filters} onChange={setFilters} />
            </aside>

            {/* Results Grid */}
            <div className="flex-grow">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-emerald-600 flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="font-medium">Searching properties...</span>
                        </div>
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(p => (
                            <PropertyCard key={p.$id} property={p} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <SearchIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your filters or search criteria.</p>
                        <button
                            onClick={() => setFilters({})}
                            className="text-emerald-600 font-bold hover:underline"
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
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Find Your Property</h1>
                    <p className="text-slate-500 mt-2">Browse the best real estate in Sri Lanka</p>
                </div>

                <Suspense fallback={
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                }>
                    <SearchContent />
                </Suspense>

            </div>
        </div>
    );
}

function SearchIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
