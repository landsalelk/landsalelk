"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Heart,
  BedDouble,
  Bath,
  Square,
  Move,
  Scale,
  MessageCircle,
} from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";

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
    badge,
  } = property || {};

  const isInCompare = compareList?.some((p) => p.$id === $id);

  // Smart image extraction: Try primary_image, then images array, then fallback
  const getImageUrl = () => {
    const fallback =
      "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072&auto=format&fit=crop";
    const endpoint =
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      "https://sgp.cloud.appwrite.io/v1";
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "landsalelkproject";
    const bucketId = "listing_images";

    const resolveUrl = (val) => {
      if (!val) return null;
      const str = String(val).trim();
      if (!str) return null;
      if (str.startsWith("http")) return str; // Already a URL
      // Assume it's a File ID
      return `${endpoint}/storage/buckets/${bucketId}/files/${str}/view?project=${projectId}`;
    };

    // Try primary_image first
    if (property?.primary_image && property.primary_image.trim()) {
      return resolveUrl(property.primary_image) || fallback;
    }

    // Try parsing images field
    const imagesField = property?.images;
    if (!imagesField || imagesField === "" || imagesField === "[]") {
      return fallback;
    }

    try {
      if (Array.isArray(imagesField)) {
        return resolveUrl(imagesField[0]) || fallback;
      }
      if (typeof imagesField === "string" && imagesField.startsWith("[")) {
        const parsed = JSON.parse(imagesField);
        return (Array.isArray(parsed) && resolveUrl(parsed[0])) || fallback;
      }
      // If it's a plain string (URL or ID)
      if (typeof imagesField === "string") {
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
    if (typeof title !== "string") return title || "Property Listing";
    try {
      if (title.startsWith("{")) {
        const parsed = JSON.parse(title);
        return parsed.en || parsed.si || Object.values(parsed)[0] || title;
      }
    } catch (e) { }
    return title;
  })();

  // Parse location if it's JSON
  const displayLocation = (() => {
    const loc = property?.location || location;
    if (typeof loc !== "string") return loc || "Sri Lanka";
    try {
      if (loc.startsWith("{")) {
        const parsed = JSON.parse(loc);
        return (
          parsed.address ||
          parsed.city ||
          parsed.en ||
          Object.values(parsed)[0] ||
          loc
        );
      }
    } catch (e) { }
    return loc;
  })();

  const actualSpecs = {
    beds: beds || specs.beds || null,
    baths: baths || specs.baths || null,
    size: area || specs.size || null,
    perches: perch_size || specs.perch_size || null,
  };

  const formatPrice = (val, cur) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: cur || "LKR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const propertyId = $id || property?.$id || "demo";
  const isLand = type?.toLowerCase() === "land";
  const [imgError, setImgError] = useState(false);
  const fallbackImage =
    "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072&auto=format&fit=crop";
  const displayImage = imgError ? fallbackImage : image;

  const status = property?.status;
  const showDraftBadge = status === 'draft';

  return (
    <Link href={`/properties/${propertyId}`} className="group block">
      <div className="glass-card animate-fade-in flex h-full cursor-pointer flex-col min-[450px]:flex-row items-stretch overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:flex-col md:rounded-[2rem]">
        {/* Image */}
        <div className="relative m-2 h-48 w-auto shrink-0 overflow-hidden rounded-xl min-[450px]:h-auto min-[450px]:w-[130px] md:m-2 md:aspect-[4/3] md:w-auto md:rounded-[1.5rem]">
          <Image
            src={displayImage || fallbackImage}
            alt={`${displayTitle || "Property"} - ${type} in ${displayLocation}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
            onError={() => setImgError(true)}
            unoptimized
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 hidden bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 md:block" />

          {/* Badge */}
          {(badge || showDraftBadge) && (
            <span className={`property-badge animate-pulse-slow origin-top-left scale-75 md:scale-100 ${showDraftBadge ? 'bg-amber-500' : ''}`}>
              {badge || (showDraftBadge ? 'DRAFT' : '')}
            </span>
          )}

          {/* Type Badge - Desktop Only */}
          <span className="absolute bottom-14 left-4 hidden rounded-lg bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm md:inline-block">
            {type}
          </span>

          {/* Favorite Button */}
          <button
            onClick={(e) => e.preventDefault()}
            aria-label={`Save ${displayTitle} to favorites`}
            className="property-favorite-btn origin-top-right scale-75 bg-white/30 text-white transition-colors hover:bg-white hover:text-red-500 md:scale-100"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") {
                const text = encodeURIComponent(
                  `Hi, I'm interested in ${displayTitle} (${window.location.origin}/properties/${propertyId})`,
                );
                window.open(
                  `https://wa.me/?text=${text}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            }}
            aria-label={`Share ${displayTitle} on WhatsApp`}
            className="absolute top-2 right-2 z-20 scale-75 rounded-full bg-[#25D366] p-2 text-white shadow-lg transition-colors hover:bg-[#128C7E] md:right-auto md:left-2 md:scale-100"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCompare(property);
            }}
            aria-label={
              isInCompare
                ? `Remove ${displayTitle} from comparison`
                : `Add ${displayTitle} to comparison`
            }
            aria-pressed={isInCompare}
            className={`absolute top-14 right-2 z-20 scale-75 rounded-full p-2 transition-colors md:right-4 md:scale-100 ${isInCompare
                ? "bg-emerald-500 text-white"
                : "bg-black/30 text-white backdrop-blur-sm hover:bg-white hover:text-emerald-600"
              }`}
            title={isInCompare ? "Added to Compare" : "Compare"}
          >
            <Scale className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Price Overlay - Desktop Only */}
          <div className="absolute bottom-4 left-4 hidden text-white md:block">
            <p className="text-xl font-bold drop-shadow-md">
              {formatPrice(price, currency)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center p-3 md:justify-start md:p-5">
          {/* Mobile Price & Type */}
          <div className="mb-1 flex items-center justify-between md:hidden">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold tracking-wider text-emerald-600 uppercase">
              {type}
            </span>
            <p className="text-base font-bold text-slate-900">
              {formatPrice(price, currency)}
            </p>
          </div>

          <div className="mb-2 md:mb-3">
            <h3 className="group-hover:text-primary-600 line-clamp-2 text-sm leading-tight font-bold text-slate-800 transition-colors md:line-clamp-1 md:text-lg">
              {displayTitle}
            </h3>
            <div className="mt-1.5 flex items-center text-xs font-medium text-slate-500 md:text-sm">
              <MapPin className="text-emerald-600 mr-1 h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{displayLocation}</span>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-auto">
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2 md:gap-2 md:pt-3">
              {isLand ? (
                // Land listings show perches only
                actualSpecs.perches ? (
                  <div className="spec-chip spec-chip-size">
                    <Move className="h-3.5 w-3.5" />
                    <span>{actualSpecs.perches} perches</span>
                  </div>
                ) : null
              ) : (
                // Non-land properties show beds, baths, size
                <>
                  {actualSpecs.beds ? (
                    <div className="spec-chip spec-chip-beds">
                      <BedDouble className="h-3.5 w-3.5" />
                      <span>{actualSpecs.beds} beds</span>
                    </div>
                  ) : null}
                  {actualSpecs.baths ? (
                    <div className="spec-chip spec-chip-baths">
                      <Bath className="h-3.5 w-3.5" />
                      <span>{actualSpecs.baths} baths</span>
                    </div>
                  ) : null}
                  {actualSpecs.size ? (
                    <div className="spec-chip spec-chip-gray">
                      <Square className="h-3.5 w-3.5" />
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