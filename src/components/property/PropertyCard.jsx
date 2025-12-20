'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Heart, BedDouble, Bath, Square, Move, Scale, MessageCircle } from 'lucide-react';
import { useComparison } from '@/context/ComparisonContext';
import { APPWRITE_ENDPOINT } from '@/lib/constants';

export function PropertyCard({ property }) {
    const { addToCompare, compareList } = useComparison() || {};
    const {
        $id,
        title = "Luxury Villa in Colombo 7",
        price = 250000000,
        currency = "LKR",
        location = "Colombo 7, Cinnamon Gardens",
        specs = {},
        type = "Sale",
        beds,
        baths,
        area,
        perch_size,
        badge
    } = property || {};

    const isInCompare = compareList?.some(p => p.$id === $id);

    // Smart image extraction: Try primary_image, then images array, then fallback
    const getImageUrl = () => {
        const fallback = "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072";
        const endpoint = APPWRITE_ENDPOINT;
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
        beds: beds || specs.beds || null,
        baths: baths || specs.baths || null,
        size: area || specs.size || null,
        perches: perch_size || specs.perch_size || null
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
    const [imgError, setImgError] = useState(false);
    const fallbackImage = "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072";
    const displayImage = imgError ? fallbackImage : image;

    return (
        <Link href={`/properties/${propertyId}`} className="block group">
            <div className="glass-card rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer flex flex-row md:flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in items-stretch">
                {/* Image */}
                <div className="relative w-[130px] md:w-auto md:aspect-[4/3] shrink-0 overflow-hidden m-2 md:m-2 rounded-xl md:rounded-[1.5rem]">
                    <Image
                        src={displayImage || fallbackImage}
                        alt={displayTitle || 'Property'}
                        fill
                        sizes="(max-width: 768px) 30vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        onError={() => setImgError(true)}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 hidden md:block" />

                    {/* Badge */}
                    {badge && (
                        <span className="property-badge animate-pulse-slow scale-75 md:scale-100 origin-top-left">
                            {badge}
                        </span>
                    )}

                    {/* Type Badge - Desktop Only */}
                    <span className="hidden md:inline-block absolute bottom-14 left-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
                        {type}
                    </span>

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => e.preventDefault()}
                        className="property-favorite-btn bg-white/30 text-white hover:bg-white hover:text-red-500 scale-75 md:scale-100 origin-top-right transition-colors"
                    >
                        <Heart className="w-5 h-5" />
                    </button>

                    {/* WhatsApp Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const text = encodeURIComponent(`Hi, I'm interested in ${displayTitle} (${window.location.origin}/properties/${propertyId})`);
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                        }}
                        className="absolute top-2 right-2 md:right-auto md:left-2 p-2 rounded-full scale-75 md:scale-100 transition-colors z-20 bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg"
                        title="Chat on WhatsApp"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCompare(property);
                        }}
                        className={`absolute top-14 right-2 md:right-4 p-2 rounded-full scale-75 md:scale-100 transition-colors z-20 ${isInCompare ? 'bg-emerald-500 text-white' : 'bg-black/30 text-white hover:bg-white hover:text-emerald-600 backdrop-blur-sm'
                            }`}
                        title={isInCompare ? "Added to Compare" : "Compare"}
                    >
                        <Scale className="w-5 h-5" />
                    </button>

                    {/* Price Overlay - Desktop Only */}
                    <div className="absolute bottom-4 left-4 text-white hidden md:block">
                        <p className="text-xl font-bold drop-shadow-md">{formatPrice(price, currency)}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 md:p-5 flex flex-col flex-1 min-w-0 justify-center md:justify-start">
                    {/* Mobile Price & Type */}
                    <div className="md:hidden flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{type}</span>
                        <p className="text-base font-bold text-slate-900">{formatPrice(price, currency)}</p>
                    </div>

                    <div className="mb-2 md:mb-3">
                        <h3 className="font-bold text-slate-800 text-sm md:text-lg line-clamp-2 md:line-clamp-1 group-hover:text-primary-600 transition-colors leading-tight">
                            {displayTitle}
                        </h3>
                        <div className="flex items-center text-slate-500 text-xs md:text-sm mt-1.5 font-medium">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0 text-primary-400" />
                            <span className="truncate">{displayLocation}</span>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-1.5 md:gap-2 pt-2 md:pt-3 border-t border-slate-100">
                            {isLand ? (
                                // Land listings show perches only
                                actualSpecs.perches ? (
                                    <div className="spec-chip spec-chip-size">
                                        <Move className="w-3.5 h-3.5" />
                                        <span>{actualSpecs.perches} perches</span>
                                    </div>
                                ) : null
                            ) : (
                                // Non-land properties show beds, baths, size
                                <>
                                    {actualSpecs.beds ? (
                                        <div className="spec-chip spec-chip-beds">
                                            <BedDouble className="w-3.5 h-3.5" />
                                            <span>{actualSpecs.beds} beds</span>
                                        </div>
                                    ) : null}
                                    {actualSpecs.baths ? (
                                        <div className="spec-chip spec-chip-baths">
                                            <Bath className="w-3.5 h-3.5" />
                                            <span>{actualSpecs.baths} baths</span>
                                        </div>
                                    ) : null}
                                    {actualSpecs.size ? (
                                        <div className="spec-chip spec-chip-gray">
                                            <Square className="w-3.5 h-3.5" />
                                            <span>{actualSpecs.size} sqft</span>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
