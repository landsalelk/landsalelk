'use client';

import { MapPin, Heart, BedDouble, Bath, Square } from 'lucide-react';

export function PropertyCard({ property }) {
    // Fallback data if property is partial
    const {
        title = "Luxury Villa in Colombo 7",
        price = 250000000,
        currency = "LKR",
        location = "Colombo 7, Cinnamon Gardens",
        specs = { beds: 4, baths: 3, size: 3500 },
        image = "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072&auto=format&fit=crop",
        type = "Sale"
    } = property || {};

    const formatPrice = (val, cur) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: cur,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    For {type}
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white rounded-full transition-colors text-white hover:text-red-500">
                    <Heart className="w-4 h-4 fill-current transition-colors" />
                </button>
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-bold">{formatPrice(price, currency)}</p>
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{title}</h3>
                </div>

                <div className="flex items-center text-slate-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <p className="line-clamp-1">{location}</p>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                        <BedDouble className="w-4 h-4 text-slate-400" />
                        <span>{specs.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                        <Bath className="w-4 h-4 text-slate-400" />
                        <span>{specs.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                        <Square className="w-4 h-4 text-slate-400" />
                        <span>{specs.size} sqft</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
