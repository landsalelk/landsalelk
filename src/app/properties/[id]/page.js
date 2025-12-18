'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPropertyById, getRelatedProperties } from '@/lib/properties';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ValuationCard } from '@/components/property/ValuationCard';
import { PropertyCard } from '@/components/property/PropertyCard';
import { RecentlyViewed, addToHistory } from '@/components/property/RecentlyViewed';
import { NeighborhoodScore } from '@/components/property/NeighborhoodScore';
import { ReportListingButton } from '@/components/property/ReportListingButton';
import { VideoCallButton } from '@/components/video/VideoCallButton';
import EasyPaymentCalculator from '@/components/tools/EasyPaymentCalculator';
import ROICalculator from '@/components/property/ROICalculator';
import { MapPin, BedDouble, Bath, Square, ShieldCheck, AlertTriangle, FileText, CheckCircle, User, Phone, MessageCircle, Share2, Heart, Trees, Loader2, Train, Globe, Banknote } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { account, databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_LISTING_OFFERS } from '@/lib/constants';
import { ID } from 'appwrite';
import { X, HandCoins } from 'lucide-react';

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [savingFav, setSavingFav] = useState(false);

    const [relatedProperties, setRelatedProperties] = useState([]);

    // Offer State
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    const [showNumber, setShowNumber] = useState(false);

    // Initial offer amount set to listing price
    useEffect(() => {
        if (property?.price) setOfferAmount(property.price);
    }, [property]);

    const handleMakeOffer = async (e) => {
        e.preventDefault();
        setIsSubmittingOffer(true);
        try {
            const user = await account.get();
            await databases.createDocument(
                DB_ID,
                COLLECTION_LISTING_OFFERS,
                ID.unique(),
                {
                    user_id: user.$id,
                    listing_id: id,
                    offer_amount: parseFloat(offerAmount),
                    currency_code: 'LKR',
                    message: offerMessage,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            );
            toast.success("Offer submitted successfully!");
            setIsOfferOpen(false);
            setOfferMessage('');
        } catch (error) {
            console.error(error);
            if (error.code === 401) {
                toast.error("Please login to make an offer");
            } else {
                toast.error("Failed to submit offer");
            }
        } finally {
            setIsSubmittingOffer(false);
        }
    };

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            try {
                const data = await getPropertyById(id);
                setProperty(data);
                // Check if saved
                const saved = await isFavorite(id);
                setIsSaved(saved);

                // Fetch related properties
                const related = await getRelatedProperties(id, data.listing_type, data.land_type);
                setRelatedProperties(related);

                // Track history
                addToHistory(data);

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

    // Handle Save/Unsave
    const handleSave = async () => {
        setSavingFav(true);
        try {
            if (isSaved) {
                await removeFavorite(id);
                setIsSaved(false);
                toast.success("Removed from saved homes");
            } else {
                await addFavorite(id);
                setIsSaved(true);
                toast.success("Saved to your favorites!");
            }
        } catch (e) {
            toast.error("Please login to save properties");
        } finally {
            setSavingFav(false);
        }
    };

    // Mock image handling (Appwrite storage logic to be added)
    // Safe image parsing
    let images = [];
    try {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
        const bucketId = 'listing_images'; // Correct bucket ID

        const resolveUrl = (val) => {
            if (!val) return null;
            if (val.startsWith('http')) return val; // Already a URL
            // Assume it's a File ID
            return `${endpoint}/storage/buckets/${bucketId}/files/${val}/view?project=${projectId}`;
        };

        let rawImages = [];
        if (Array.isArray(property.images)) {
            rawImages = property.images;
        } else if (typeof property.images === 'string') {
            rawImages = JSON.parse(property.images);
        }

        if (Array.isArray(rawImages)) {
            images = rawImages.map(resolveUrl).filter(Boolean);
        }
    } catch (e) {
        console.warn("Image parse error:", e);
    }

    // Default fallbacks
    if (!images || images.length === 0) {
        images = [
            "https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
        ];
    }

    // Helper to safely parse JSON strings (for description/location)
    const parseSafe = (val, fallback) => {
        if (!val) return fallback;
        if (typeof val === 'object') return val; // Already an object
        try {
            const parsed = JSON.parse(val);
            // If it's a description object (e.g. {en: "..."}), return English or first value
            if (parsed && typeof parsed === 'object') {
                if (parsed.en) return parsed.en;
                if (parsed.address) return parsed.address; // For location objects
                return Object.values(parsed).join(', ');
            }
            return parsed;
        } catch (e) {
            return val; // Return original string if not JSON
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 pb-20">

            {/* 1. Image Gallery Section */}
            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[500px] lg:h-[600px]">
                    {/* Main Image */}
                    <div className="lg:col-span-8 h-full relative group">
                        <Image
                            src={images[activeImage] || '/placeholder.jpg'}
                            alt={parseSafe(property.title, "Property Image")}
                            fill
                            className="object-cover rounded-2xl shadow-sm"
                            priority
                            unoptimized
                        />

                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <span className="bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm">
                                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                            </span>
                            {property.is_foreign_eligible && (
                                <span className="bg-blue-500/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Foreign Eligible
                                </span>
                            )}
                            {property.has_payment_plan && (
                                <span className="bg-amber-500/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm flex items-center gap-1">
                                    <Banknote className="w-3 h-3" /> Payment Plan
                                </span>
                            )}
                        </div>
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={savingFav}
                                className={`p-3 rounded-full backdrop-blur-md shadow-sm transition-all ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'}`}
                            >
                                {savingFav ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />}
                            </button>
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
                                <Image
                                    src={img || '/placeholder.jpg'}
                                    alt={`View ${idx}`}
                                    fill
                                    className="object-cover hover:scale-110 transition-transform duration-500"
                                    unoptimized
                                />
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
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{parseSafe(property.title, "Property Title")}</h1>
                                    <div className="flex items-center text-slate-500">
                                        <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                                        {parseSafe(property.location, "Location not specified")}
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
                                    {parseSafe(property.description, "No description provided.")}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                Legal & Compliance 🇱🇰
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Deed Type
                                    </div>
                                    <div className="font-semibold text-slate-900 capitalize">
                                        {property.deed_type ? property.deed_type.replace('_', ' ') : "Not Specified"}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Approvals
                                    </div>
                                    <div className="space-y-1">
                                        <div className={`text-sm flex items-center gap-2 ${property.approval_nbro ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                                            <CheckCircle className="w-3 h-3" /> NBRO Certified
                                        </div>
                                        <div className={`text-sm flex items-center gap-2 ${property.approval_coc ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                                            <CheckCircle className="w-3 h-3" /> COC Generated
                                        </div>
                                        <div className={`text-sm flex items-center gap-2 ${property.approval_uda ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                                            <CheckCircle className="w-3 h-3" /> UDA Approved
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Flood Risk
                                    </div>
                                    <div className="font-semibold text-slate-900 capitalize">
                                        {property.flood_risk ? "Potential Risk" : "No Risk Reported"}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                        <Train className="w-4 h-4" /> Connectivity
                                    </div>
                                    <div className="font-semibold text-slate-900">
                                        {property.infrastructure_distance ? (
                                            <span className="text-emerald-600">{property.infrastructure_distance} km to Highway/LRT</span>
                                        ) : (
                                            "Distance not specified"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Tools */}
                        <div className="mt-8 space-y-6">
                            <EasyPaymentCalculator price={property.price} />
                            <ROICalculator price={property.price} />
                        </div>

                        {/* Neighborhood / Walk Score */}
                        <div className="mt-8">
                            <NeighborhoodScore location={property.location} />
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
                                    <h4 className="font-bold text-slate-900 text-lg">{property.contact_name || "Land Sale Agent"}</h4>
                                    <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Verified Agent
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5" /> Chat via WhatsApp
                                </button>
                                <button
                                    onClick={() => setShowNumber(true)}
                                    className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    {showNumber ? (property.contact_phone || property.phone || '+94 77 XXX XXXX') : 'Show Number'}
                                </button>

                                <button
                                    onClick={() => setIsOfferOpen(true)}
                                    className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                                >
                                    <HandCoins className="w-5 h-5" /> Make an Offer
                                </button>

                                <VideoCallButton
                                    agentName={property.contact_name || "Agent"}
                                    agentId={property.user_id}
                                    propertyTitle={property.title}
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-xs text-slate-400 text-center mb-4">
                                    Protect your payments. Never transfer money before viewing the property.
                                </p>
                                <div className="flex justify-center">
                                    <ReportListingButton listingId={property.$id} listingTitle={property.title} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. Related Properties */}
            {relatedProperties.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProperties.map((p) => (
                            <PropertyCard key={p.$id} property={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <RecentlyViewed currentId={id} />
            </div>

            {/* Chat Widget */}
            <ChatWidget agentId={property.user_id} agentName={property.contact_name || "Agent"} />

            {/* Make Offer Modal */}
            {isOfferOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up">
                        <button
                            onClick={() => setIsOfferOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HandCoins className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Make an Offer</h3>
                            <p className="text-slate-500">Send your best offer to the seller</p>
                        </div>

                        <form onSubmit={handleMakeOffer} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Offer Amount (LKR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rs.</span>
                                    <input
                                        type="number"
                                        required
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-lg outline-none focus:border-amber-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Message (Optional)</label>
                                <textarea
                                    value={offerMessage}
                                    onChange={(e) => setOfferMessage(e.target.value)}
                                    placeholder="I am interested in this property..."
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-none resize-none h-24"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingOffer}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmittingOffer ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending Offer...
                                    </>
                                ) : (
                                    'Submit Offer'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}

