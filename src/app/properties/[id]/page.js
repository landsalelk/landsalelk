'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPropertyById } from '@/lib/properties';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ValuationCard } from '@/components/property/ValuationCard';
import { MapPin, BedDouble, Bath, Square, ShieldCheck, AlertTriangle, FileText, CheckCircle, User, Phone, MessageCircle, Share2, Heart, Trees } from 'lucide-react';
import Link from 'next/link';

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            try {
                const data = await getPropertyById(id);
                setProperty(data);
            } catch (err) {
                console.error(err);
                // Check if it's a 404 or other error
                setError("Property not found or access denied.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="h-96 bg-slate-200 rounded-3xl w-full"></div>
                    <div className="flex gap-4">
                        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Oops! Property Not Found</h1>
                <p className="text-slate-500 mb-6">{error || "The property you are looking for has been removed or does not exist."}</p>
                <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    Return Home
                </Link>
            </div>
        );
    }

    // Formatting helpers
    const formatPrice = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

    // Mock image handling (Appwrite storage logic to be added)
    const images = property.images ? JSON.parse(property.images) : [
        "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">

            {/* 1. Image Gallery Section */}
            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[500px] lg:h-[600px]">
                    {/* Main Image */}
                    <div className="lg:col-span-8 h-full relative group">
                        <img
                            src={images[activeImage]}
                            alt={property.title}
                            className="w-full h-full object-cover rounded-2xl shadow-sm"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm">
                                {property.listing_type || 'For Sale'}
                            </span>
                            {property.is_premium && (
                                <span className="bg-amber-500/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Premium
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="hidden lg:grid lg:col-span-4 grid-rows-3 gap-4 h-full">
                        {images.slice(0, 3).map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative h-full overflow-hidden rounded-2xl cursor-pointer border-2 transition-all ${activeImage === idx ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent'}`}
                            >
                                <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Property Info */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Header */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
                                    <div className="flex items-center text-slate-500">
                                        <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                                        {property.location || "Location not specified"}
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-3xl font-bold text-emerald-600">{formatPrice(property.price)}</div>
                                    <p className="text-slate-400 text-sm">{property.price_negotiable ? "Negotiable" : "Fixed Price"}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 py-6 border-t border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <BedDouble className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.beds || 3}</span>
                                        <span className="text-xs text-slate-500">Bedrooms</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex items-center gap-2">
                                    <Bath className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.baths || 2}</span>
                                        <span className="text-xs text-slate-500">Bathrooms</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex items-center gap-2">
                                    <Square className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.size_sqft || 2500}</span>
                                        <span className="text-xs text-slate-500">Sq. Ft.</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex items-center gap-2">
                                    <Trees className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.perch_size || 15}</span>
                                        <span className="text-xs text-slate-500">Perches</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <h3 className="font-bold text-slate-900 mb-4 text-lg">Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {property.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        {/* Due Diligence / Legal Info (Sri Lanka Specific) */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                Legal & Compliance
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Deed Type
                                    </div>
                                    <div className="font-semibold text-slate-900 capitalize">
                                        {property.deed_type || "Sinnakkara (Freehold)"}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> NBRO Approval
                                    </div>
                                    <div className="font-semibold text-slate-900">
                                        {property.nbro_approval ? (
                                            <span className="text-emerald-600 flex items-center gap-1">Available <CheckCircle className="w-3 h-3" /></span>
                                        ) : (
                                            <span className="text-amber-500">Pending / Not Required</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Flood Risk
                                    </div>
                                    <div className="font-semibold text-slate-900 capitalize">
                                        {property.flood_risk || "Low Risk"}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> UDA Zoning
                                    </div>
                                    <div className="font-semibold text-slate-900 capitalize">
                                        Residential
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Agent & Actions */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* AI Valuation */}
                        <ValuationCard property={property} />

                        {/* Agent Card */}
                        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
                                    <User className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Harsha Perera</h4>
                                    <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Verified Agent
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5" /> Chat via WhatsApp
                                </button>
                                <button className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" /> Show Number
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-xs text-slate-400 text-center">
                                    Protect your payments. Never transfer money before viewing the property.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* Chat Widget */}
            <ChatWidget agentId={property.user_id} agentName={property.contact_name || "Agent"} />
        </div>
    );
}

