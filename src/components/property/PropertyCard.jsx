'use client';

import Link from 'next/link';
import { MapPin, Heart, BedDouble, Bath, Square, Move } from 'lucide-react';

export function PropertyCard({ property }) {
    const {
        $id,
        title = "Luxury Villa in Colombo 7",
        price = 250000000,
        currency = "LKR",
        location = "Colombo 7, Cinnamon Gardens",
        specs = { beds: 4, baths: 3, size: 3500 },
        type = "Sale",
        beds,
        baths,
        area,
        badge
    } = property || {};

    // Smart image extraction: Try primary_image, then images array, then fallback
    const getImageUrl = () => {
        const fallback = "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072&auto=format&fit=crop";
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
        const bucketId = 'listing_images'; // Correct bucket ID

        const resolveUrl = (val) => {
            if (!val) return null;
            if (val.startsWith('http')) return val; // Already a URL
            // Assume it's a File ID
            return `${endpoint}/storage/buckets/${bucketId}/files/${val}/view?project=${projectId}`;
        };

        // Try primary_image first
        if (property?.primary_image && property.primary_image.trim()) {
            return resolveUrl(property.primary_image) || fallback;
        }

        // Try parsing images field
        const imagesField = property?.images;
        if (!imagesField || imagesField === '' || imagesField === '[]') {
            return fallback;
        }

        try {
            if (Array.isArray(imagesField)) {
                return resolveUrl(imagesField[0]) || fallback;
            }
            if (typeof imagesField === 'string' && imagesField.startsWith('[')) {
                const parsed = JSON.parse(imagesField);
                return (Array.isArray(parsed) && resolveUrl(parsed[0])) || fallback;
            }
            // If it's a plain string (URL or ID)
            if (typeof imagesField === 'string') {
                return resolveUrl(imagesField) || fallback;
            }
        } catch (e) {
            // Silent fallback
        }

        return fallback;
    };

    const image = getImageUrl();

    // Parse title if it's JSON
    const displayTitle = (() => {
        if (typeof title !== 'string') return title || "Property Listing";
        try {
            if (title.startsWith('{')) {
                const parsed = JSON.parse(title);
                return parsed.en || parsed.si || Object.values(parsed)[0] || title;
            }
        } catch (e) { }
        return title;
    })();

    // Parse location if it's JSON  
    const displayLocation = (() => {
        const loc = property?.location || location;
        if (typeof loc !== 'string') return loc || "Sri Lanka";
        try {
            if (loc.startsWith('{')) {
                const parsed = JSON.parse(loc);
                return parsed.address || parsed.city || parsed.en || Object.values(parsed)[0] || loc;
            }
        } catch (e) { }
        return loc;
    })();

    const actualSpecs = {
        beds: beds || specs.beds || 0,
        baths: baths || specs.baths || 0,
        size: area || specs.size || 0
    };


    const formatPrice = (val, cur) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: cur || 'LKR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const propertyId = $id || property?.$id || 'demo';
    const isLand = type?.toLowerCase() === 'land';

    return (
        <Link href={`/properties/${propertyId}`} className="block group">
            <div className="glass-card rounded-[2rem] overflow-hidden cursor-pointer flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-[1.5rem]">
                    <img
                        src={image}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072&auto=format&fit=crop";
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60" />

                    {/* Badge */}
                    {badge && (
                        <span className="property-badge animate-pulse-slow">
                            {badge}
                        </span>
                    )}

                    {/* Type Badge */}
                    <span className="absolute bottom-14 left-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
                        {type}
                    </span>

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => e.preventDefault()}
                        className="property-favorite-btn bg-white/30 text-white hover:bg-white hover:text-red-500"
                    >
                        <Heart className="w-5 h-5" />
                    </button>

                    {/* Price Overlay */}
                    <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xl font-bold drop-shadow-md">{formatPrice(price, currency)}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                        <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {displayTitle}
                        </h3>
                        <div className="flex items-center text-slate-500 text-sm mt-1 font-medium">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-primary-400" />
                            <span className="truncate">{displayLocation}</span>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            {isLand ? (
                                <div className="spec-chip spec-chip-size">
                                    <Move className="w-3.5 h-3.5" />
                                    <span>{actualSpecs.size} sqft</span>
                                </div>
                            ) : (
                                <>
                                    <div className="spec-chip spec-chip-beds">
                                        <BedDouble className="w-3.5 h-3.5" />
                                        <span>{actualSpecs.beds}</span>
                                    </div>
                                    <div className="spec-chip spec-chip-baths">
                                        <Bath className="w-3.5 h-3.5" />
                                        <span>{actualSpecs.baths}</span>
                                    </div>
                                    <div className="spec-chip spec-chip-gray">
                                        <Square className="w-3.5 h-3.5" />
                                        <span>{actualSpecs.size} sqft</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
