import Link from 'next/link';
import { MapPin, ArrowRight, Building, Trees } from 'lucide-react';
import { databases, Query } from '@/lib/appwrite';
import { DB_ID, COLLECTION_CITIES, COLLECTION_REGIONS } from '@/appwrite/config';

// 1 Hour ISR (Incremental Static Regeneration)
export const revalidate = 3600;

export const metadata = {
    title: 'Land for Sale in Sri Lanka | Browse by City',
    description: 'Browse land plots, coconut estates, and bare lands for sale across all major cities in Sri Lanka. Find your ideal property location.',
};

async function getLocations() {
    try {
        // 1. Fetch Regions (Provinces/Districts)
        const regionsParams = [Query.orderAsc('name')];
        const regionsRes = await databases.listDocuments(DB_ID, COLLECTION_REGIONS, regionsParams);

        // 2. Fetch Cities (Limit 100 for now, or implement pagination if needed)
        // Optimized: We fetch all and map them in memory to avoid N+1 queries if list is small (<1000)
        const citiesParams = [Query.limit(100), Query.orderAsc('name')];
        const citiesRes = await databases.listDocuments(DB_ID, COLLECTION_CITIES, citiesParams);

        const regions = regionsRes.documents;
        const cities = citiesRes.documents;

        // Group cities by region
        const grouped = regions.map(region => ({
            ...region,
            cities: cities.filter(c => c.region_id === region.$id)
        })).filter(r => r.cities.length > 0); // Only show regions with cities

        return grouped;
    } catch (error) {
        console.error("Error fetching directory data:", error);
        return [];
    }
}

export default async function LandDirectoryPage() {
    const locationGroups = await getLocations();

    // Fallback if DB is empty
    const popularCities = [
        "Colombo", "Kandy", "Galle", "Negombo", "Gampaha", "Matara", "Kurunegala", "Nuwara Eliya"
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Land for Sale in Sri Lanka by City",
        "hasPart": locationGroups.flatMap(r => r.cities.map(c => ({
            "@type": "City",
            "name": c.name,
            "url": `https://landsale.lk/land-for-sale/${c.name.toLowerCase()}`
        })))
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero */}
            <div className="bg-emerald-900 pt-24 pb-16 px-4 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Lands by Location</h1>
                <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                    Find the perfect plot in your preferred city. From coastal belts to the hill country.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {locationGroups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {locationGroups.map((region) => (
                            <div key={region.$id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">{region.name}</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {region.cities.map((city) => (
                                        <Link
                                            key={city.$id}
                                            href={`/land-for-sale/${city.name.toLowerCase()}`}
                                            className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-emerald-600"
                                        >
                                            <span className="font-medium text-sm">{city.name}</span>
                                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Fallback UI (Static List)
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 border-l-4 border-emerald-500 pl-4">Popular Locations</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {popularCities.map((city) => (
                                <Link
                                    key={city}
                                    href={`/land-for-sale/${city.toLowerCase()}`}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all text-center group"
                                >
                                    <Building className="w-8 h-8 mx-auto mb-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    <span className="font-bold text-slate-700">{city}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
