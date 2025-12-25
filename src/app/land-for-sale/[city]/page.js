import { searchProperties } from '@/lib/properties';
import { PropertyCard } from '@/components/property/PropertyCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowLeft } from 'lucide-react';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
    const city = (await params).city;
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);

    return {
        title: `Land for Sale in ${capitalizedCity} | LandSale.lk`,
        description: `Find the best land plots, bare lands, and coconut estates for sale in ${capitalizedCity}. Verified sellers, latest prices, and prime locations in ${capitalizedCity}, Sri Lanka.`,
        openGraph: {
            title: `Land for Sale in ${capitalizedCity} | LandSale.lk`,
            description: `Browse prime land listings in ${capitalizedCity}. Filter by price, size, and more.`,
            type: 'website',
        }
    };
}

export default async function CityLandPage({ params }) {
    const city = (await params).city;
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);

    // Fetch listings
    let listings = [];
    try {
        listings = await searchProperties({
            location: city,
            type: 'land'
        });
    } catch (error) {
        console.error("Error fetching city listings:", error);
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": listings.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://landsale.lk/properties/${item.$id}`,
                "name": item.title
            }))
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Hero Section */}
            <div className="bg-emerald-900 pt-24 pb-12 px-4 text-white">
                <div className="max-w-7xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white mb-6 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        Land for Sale in <span className="text-emerald-400">{capitalizedCity}</span>
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-2xl">
                        Explore {listings.length}+ prime land plots, coconut estates, and bare lands available in {capitalizedCity} area.
                    </p>
                </div>
            </div>

            {/* Breadcrumbs & Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Schema Markup */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-emerald-600">Home</Link>
                    <span>/</span>
                    <Link href="/search?type=land" className="hover:text-emerald-600">Land</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">{capitalizedCity}</span>
                </div>

                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((property) => (
                            <PropertyCard key={property.$id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No listings found in {capitalizedCity}</h2>
                        <p className="text-slate-500 mb-6">We couldn't find any land listings specifically in this location right now.</p>
                        <Link href="/search" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                            Browse All Lands
                        </Link>
                    </div>
                )}

                {/* SEO Content Block (Programmatic footer) */}
                <div className="mt-16 prose prose-slate max-w-none bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800">Buying Land in {capitalizedCity}</h2>
                    <p className="text-slate-600">
                        Looking for the perfect plot in {capitalizedCity}? Whether you are looking for residential land to build your dream home
                        or agricultural land for investment, {capitalizedCity} offers a range of opportunities.
                        Use LandSale.lk to find verified sellers and the best prices in the market.
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 mt-4">Average Prices</h3>
                    <p className="text-slate-600">
                        Land prices in {capitalizedCity} vary based on proximity to the main road, infrastructure availability (water/electricity),
                        and soil type.
                    </p>
                </div>
            </div>
        </div>
    );
}
