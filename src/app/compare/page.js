'use client';

import { useComparison } from '@/context/ComparisonContext';
import { BedDouble, Bath, Square, MapPin, Check, X, Trash2, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useComparison();

    if (compareList.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Home className="w-10 h-10 text-slate-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Comparison List is Empty</h1>
                    <p className="text-slate-500 mb-8">
                        Add properties to your comparison list to see them side-by-side.
                        You can compare features, prices, and amenities.
                    </p>
                    <Link
                        href="/properties"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                        Browse Properties <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-8 pb-16 px-4 max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Compare Properties</h1>
                    <p className="text-slate-500 mt-1">Comparing {compareList.length} properties</p>
                </div>
                {compareList.length > 0 && (
                    <button
                        onClick={clearCompare}
                        className="text-red-500 font-bold hover:underline flex items-center gap-2 text-sm"
                    >
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                )}
            </div>

            <div className="overflow-x-auto pb-6">
                <div className="min-w-[800px] grid grid-cols-[200px_repeat(3,1fr)] gap-0 border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl">

                    {/* Header Row (Images & Titles) */}
                    <div className="p-6 bg-slate-50 border-r border-b border-slate-200 font-bold text-slate-400 uppercase text-xs flex items-end pb-2">
                        Property Details
                    </div>
                    {compareList.map(item => (
                        <div key={item.$id} className="p-6 border-r border-b border-slate-200 last:border-r-0 relative group min-w-[300px]">
                            <button
                                onClick={() => removeFromCompare(item.$id)}
                                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors backdrop-blur-sm shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-lg transition-all">
                                {item.images && item.images[0] ? (
                                    <Image
                                        src={item.images[0]}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md">
                                    LKR {item.price.toLocaleString()}
                                </div>
                            </div>
                            <Link href={`/properties/${item.$id}`} className="block">
                                <h3 className="font-bold text-slate-900 leading-tight hover:text-emerald-600 transition-colors mb-1 truncate">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                                    <MapPin className="w-3 h-3" /> {item.location}
                                </div>
                            </Link>
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="p-6 border-r border-b border-slate-200 last:border-r-0 bg-slate-50/50 flex flex-col items-center justify-center text-center min-w-[300px]">
                            <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                                <PlusIcon className="w-8 h-8" />
                            </div>
                            <Link href="/properties" className="text-emerald-600 font-bold text-sm hover:underline">
                                Add Property
                            </Link>
                        </div>
                    ))}

                    {/* Price Row */}
                    <div className="p-4 bg-slate-50 border-r border-b border-slate-100 font-medium text-slate-500 text-sm">Price</div>
                    {compareList.map(item => (
                        <div key={`price-${item.$id}`} className="p-4 border-r border-b border-slate-100 font-bold text-emerald-600 last:border-r-0">
                            LKR {item.price.toLocaleString()}
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => <div key={`e-price-${i}`} className="p-4 border-r border-b border-slate-100 last:border-r-0 bg-slate-50/30" />)}

                    {/* Location Row */}
                    <div className="p-4 bg-slate-50 border-r border-b border-slate-100 font-medium text-slate-500 text-sm">Location</div>
                    {compareList.map(item => (
                        <div key={`loc-${item.$id}`} className="p-4 border-r border-b border-slate-100 text-slate-800 last:border-r-0">
                            {item.location}
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => <div key={`e-loc-${i}`} className="p-4 border-r border-b border-slate-100 last:border-r-0 bg-slate-50/30" />)}

                    {/* Specs Row */}
                    <div className="p-4 bg-slate-50 border-r border-b border-slate-100 font-medium text-slate-500 text-sm">Bed / Bath / Size</div>
                    {compareList.map(item => (
                        <div key={`specs-${item.$id}`} className="p-4 border-r border-b border-slate-100 text-slate-700 last:border-r-0 flex items-center gap-4">
                            <span className="flex items-center gap-1" title="Bedrooms"><BedDouble className="w-4 h-4 text-slate-400" /> {item.bedrooms || '-'}</span>
                            <span className="flex items-center gap-1" title="Bathrooms"><Bath className="w-4 h-4 text-slate-400" /> {item.bathrooms || '-'}</span>
                            <span className="flex items-center gap-1" title="Area"><Square className="w-4 h-4 text-slate-400" /> {item.area ? `${item.area} sqft` : '-'}</span>
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => <div key={`e-specs-${i}`} className="p-4 border-r border-b border-slate-100 last:border-r-0 bg-slate-50/30" />)}

                    {/* Type Row */}
                    <div className="p-4 bg-slate-50 border-r border-b border-slate-100 font-medium text-slate-500 text-sm">Property Type</div>
                    {compareList.map(item => (
                        <div key={`type-${item.$id}`} className="p-4 border-r border-b border-slate-100 text-slate-800 capitalize last:border-r-0">
                            {item.listing_type || '-'}
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => <div key={`e-type-${i}`} className="p-4 border-r border-b border-slate-100 last:border-r-0 bg-slate-50/30" />)}

                    {/* Features Row */}
                    <div className="p-4 bg-slate-50 border-r border-slate-100 font-medium text-slate-500 text-sm flex items-start pt-6">Features</div>
                    {compareList.map(item => (
                        <div key={`feat-${item.$id}`} className="p-4 border-r border-slate-100 text-slate-600 last:border-r-0 text-sm">
                            {item.features && item.features.length > 0 ? (
                                <ul className="space-y-1">
                                    {item.features.slice(0, 5).map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <Check className="w-3 h-3 text-emerald-500" /> {f}
                                        </li>
                                    ))}
                                    {item.features.length > 5 && <li className="text-slate-400 text-xs italic">+{item.features.length - 5} more</li>}
                                </ul>
                            ) : (
                                <span className="text-slate-400 italic">No features listed</span>
                            )}
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => <div key={`e-feat-${i}`} className="p-4 border-r border-b border-slate-100 last:border-r-0 bg-slate-50/30" />)}

                    {/* Action Row */}
                    <div className="p-4 bg-slate-50 border-r border-t border-slate-200"></div>
                    {compareList.map(item => (
                        <div key={`action-${item.$id}`} className="p-6 border-r border-t border-slate-200 last:border-r-0">
                            <Link
                                href={`/properties/${item.$id}`}
                                className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                    {[...Array(3 - compareList.length)].map((_, i) => <div key={`e-act-${i}`} className="p-6 border-r border-t border-slate-200 last:border-r-0 bg-slate-50/30" />)}
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
