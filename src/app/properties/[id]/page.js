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
import { StickyGallery } from '@/components/property/StickyGallery';
import { ScrollMap } from '@/components/property/ScrollMap';
import AuctionCard from '@/components/property/AuctionCard';
import { FadeIn, FadeInItem } from '@/components/animations/FadeIn';
import { MapPin, BedDouble, Bath, Square, ShieldCheck, AlertTriangle, FileText, CheckCircle, User, Phone, MessageCircle, Share2, Heart, Trees, Loader2, Train, Globe, Banknote, ChevronLeft, ChevronRight, X, HandCoins, Clock, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { account, databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_LISTING_OFFERS, COLLECTION_AGENTS } from '@/appwrite/config';
import { ID, Query } from 'appwrite';
import { incrementViewCount } from '@/app/actions/analytics';
import { track } from '@/lib/track';
import { formatDate } from '@/lib/dateUtils';
import { formatShortPrice } from '@/lib/utils';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { sanitizeHTML } from '@/lib/sanitize';
import { LeadCaptureModal } from '@/components/property/LeadCaptureModal';
import { SavedSearchModal } from '@/components/property/SavedSearchModal';
import { checkVerificationCookie } from '@/app/actions/leadOtp';

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [savingFav, setSavingFav] = useState(false);
    const [isAgentVerified, setIsAgentVerified] = useState(false);

    const [relatedProperties, setRelatedProperties] = useState([]);

    // Offer State
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    const [showNumber, setShowNumber] = useState(false);

    // Lead capture modal state
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [leadContactType, setLeadContactType] = useState('whatsapp'); // 'whatsapp' or 'call'
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    // Saved Search State
    const [isSavedSearchOpen, setIsSavedSearchOpen] = useState(false);

    // Initial offer amount set to listing price
    useEffect(() => {
        if (property?.price) setOfferAmount(property.price);
    }, [property]);

    // Exit Intent Trigger
    useEffect(() => {
        const handleMouseLeave = (e) => {
            if (e.clientY <= 0) {
                // User is moving mouse to top of browser (tabs/back button)
                const shown = sessionStorage.getItem('exit_intent_shown');
                if (!shown && !isSavedSearchOpen) {
                    setIsSavedSearchOpen(true);
                    sessionStorage.setItem('exit_intent_shown', 'true');
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [isSavedSearchOpen]);

    // Check if buyer phone is already verified (localStorage)
    useEffect(() => {
        const checkVerification = async () => {
            try {
                // Tier 1: Check if user is logged in
                try {
                    const session = await account.get();
                    if (session && (session.phone || session.phone_verification)) {
                        setIsPhoneVerified(true);
                        return;
                    }
                } catch (err) {
                    // Not logged in, continue to Tier 2
                }

                // Tier 2: Check for HTTP-only cookie (Server Action)
                const cookieResult = await checkVerificationCookie();
                if (cookieResult?.verified) {
                    setIsPhoneVerified(true);
                    return;
                }

                // Tier 3: Legacy local storage check (Fallback)
                const stored = localStorage.getItem('landsale_verified_phone');
                if (stored) {
                    const data = JSON.parse(stored);
                    if (data.expires > Date.now()) {
                        setIsPhoneVerified(true);
                    }
                }
            } catch (e) {
                console.error('Error checking phone verification:', e);
            }
        };

        checkVerification();
    }, []);

    const contactPhone = property?.contact_phone || property?.phone || null;

    // Handle verified callback from modal
    const handlePhoneVerified = (verifiedPhone) => {
        setIsPhoneVerified(true);
        // Now perform the original action
        if (leadContactType === 'whatsapp') {
            performWhatsApp();
        } else if (leadContactType === 'show_number') {
            if (!showNumber) {
                track('cta_contact_clicked', { listing_id: id, channel: 'show_number' });
            }
            setShowNumber(true);
        } else if (leadContactType === 'call') {
            performCall();
        } else if (leadContactType === 'offer') {
            setIsOfferOpen(true);
        } else if (leadContactType === 'video_call') {
            toast.success("Phone verified! Click Video Call again to schedule.");
        }
    };

    // Actual WhatsApp action (after verification)
    const performWhatsApp = () => {
        track('cta_contact_clicked', { listing_id: id, channel: 'whatsapp' });

        const number = contactPhone ? String(contactPhone).replace(/\s+/g, '') : '';
        const title = parseSafe(property?.title, 'Property');

        if (!number) {
            toast.error('Phone number not available');
            return;
        }

        const text = encodeURIComponent(`Hi, I'm interested in: ${title} (ID: ${id})`);
        const waUrl = `https://wa.me/${number.replace(/^\+/, '')}?text=${text}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    // Handler that checks verification first
    const handleWhatsApp = () => {
        if (isPhoneVerified) {
            performWhatsApp();
        } else {
            setLeadContactType('whatsapp');
            setIsLeadModalOpen(true);
        }
    };



    const getCleanedPhoneNumber = () => {
        return contactPhone ? String(contactPhone).replace(/\s+/g, '') : '';
    };

    const getFormattedPhoneNumber = () => {
        return contactPhone || '+94 77 XXX XXXX';
    };

    // Actual call action (after verification)
    const performCall = () => {
        track('cta_contact_clicked', { listing_id: id, channel: 'call' });

        const number = getCleanedPhoneNumber();
        if (!number) {
            toast.error('Phone number not available');
            return;
        }
        window.location.href = `tel:${number}`;
    };

    // Handler that checks verification first for call
    const handleCall = () => {
        if (isPhoneVerified) {
            performCall();
        } else {
            setLeadContactType('call');
            setIsLeadModalOpen(true);
        }
    };

    // Handler for showing phone number (also requires verification)
    // Handler for showing phone number (also requires verification)
    const handleShowNumber = () => {
        if (!isPhoneVerified) {
            setLeadContactType('show_number');
            setIsLeadModalOpen(true);
            return;
        }

        if (!showNumber) {
            track('cta_contact_clicked', { listing_id: id, channel: 'show_number' });
        }
        setShowNumber(!showNumber);
    };

    const handleMakeOfferClick = () => {
        if (!isPhoneVerified) {
            setLeadContactType('offer');
            setIsLeadModalOpen(true);
            return;
        }
        setIsOfferOpen(true);
    };

    const handleVideoCallVerification = () => {
        if (!isPhoneVerified) {
            setLeadContactType('video_call');
            setIsLeadModalOpen(true);
        } else {
            // Already verified? maybe just show toast
            toast.success("Phone verified! You can schedule the call.");
        }
    };

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

                // Track Real View (Server Action)
                const storageKey = `viewed_${id}`;
                if (!sessionStorage.getItem(storageKey)) {
                    incrementViewCount(id).then(() => {
                        sessionStorage.setItem(storageKey, 'true');
                    }).catch(err => console.error("View tracking failed", err));
                }

                // Client-side analytics event (safe no-op if no provider configured)
                if (!sessionStorage.getItem(`${storageKey}_analytics`)) {
                    track('listing_viewed', {
                        listing_id: id,
                        listing_type: data?.listing_type,
                        price: data?.price,
                    });
                    sessionStorage.setItem(`${storageKey}_analytics`, 'true');
                }

                // Check Agent Verification
                if (data.user_id) {
                    try {
                        const agents = await databases.listDocuments(
                            DB_ID,
                            COLLECTION_AGENTS,
                            [Query.equal('user_id', data.user_id)]
                        );
                        if (agents.documents.length > 0 && agents.documents[0].is_verified) {
                            setIsAgentVerified(true);
                        }
                    } catch (e) {
                        console.warn("Agent check failed", e);
                    }
                }

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
    const formatPrice = (val) => formatShortPrice(val, 'LKR');

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
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';
        const bucketId = 'listing_images'; // Correct bucket ID

        const resolveUrl = (val) => {
            if (!val) return null;
            const str = String(val).trim();
            if (!str) return null;
            if (str.startsWith('http')) return str; // Already a URL
            // Assume it's a File ID
            return `${endpoint}/storage/buckets/${bucketId}/files/${str}/view?project=${projectId}`;
        };

        // Accept multiple possible shapes from the collection
        const candidate =
            property.images ??
            property.image_urls ??
            property.imageIds ??
            property.image_ids ??
            property.imageUrls;

        let rawImages = [];
        if (Array.isArray(candidate)) {
            rawImages = candidate;
        } else if (typeof candidate === 'string') {
            try {
                rawImages = JSON.parse(candidate);
            } catch {
                // fallback: split by comma
                rawImages = candidate.split(',').map((s) => s.trim());
            }
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
            {/* 1. Mobile Top Gallery (Hidden on Desktop) */}
            <div className="block lg:hidden h-[300px] relative group">
                <Image
                    src={images[activeImage] || '/placeholder.jpg'}
                    alt={parseSafe(property.title, "Property Image")}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
                {/* Mobile Navigation */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10">
                    {images.slice(0, 5).map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full ${activeImage === idx ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                </div>
                {/* Mobile Nav Arrows */}
                <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 text-white backdrop-blur-sm"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={() => setActiveImage(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 text-white backdrop-blur-sm"><ChevronRight className="w-6 h-6" /></button>

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm">
                        {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                </div>
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

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-8">
                {/* Breadcrumb - Desktop only */}
                <div className="hidden lg:block">
                    <Breadcrumb items={[
                        { label: 'Properties', href: '/properties' },
                        { label: parseSafe(property.title, 'Property Details'), href: null }
                    ]} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Property Info (Scrollable) */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Header Section */}
                        <FadeIn className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{parseSafe(property.title, "Property Title")}</h1>
                                    <div className="flex items-center text-slate-500">
                                        <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                                        {parseSafe(property.location, "Location not specified")}
                                        <span className="mx-2">•</span>
                                        <Clock className="w-4 h-4 mr-1 text-slate-400" />
                                        <span className="text-sm">{formatDate(property.$createdAt)}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-3xl font-bold text-emerald-600">{formatPrice(property.price)}</div>
                                    <p className="text-slate-400 text-sm">{property.price_negotiable ? "Negotiable" : "Fixed Price"}</p>
                                </div>
                            </div>

                            {/* Fade-in Stats */}
                            <div className="flex flex-wrap gap-6 py-6 border-t border-b border-slate-100">
                                <FadeInItem className="flex items-center gap-2">
                                    <BedDouble className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.beds || '-'}</span>
                                        <span className="text-xs text-slate-500">Bedrooms</span>
                                    </div>
                                </FadeInItem>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <FadeInItem className="flex items-center gap-2">
                                    <Bath className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.baths || '-'}</span>
                                        <span className="text-xs text-slate-500">Bathrooms</span>
                                    </div>
                                </FadeInItem>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <FadeInItem className="flex items-center gap-2">
                                    <Square className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.size_sqft || '-'}</span>
                                        <span className="text-xs text-slate-500">Sq. Ft.</span>
                                    </div>
                                </FadeInItem>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <FadeInItem className="flex items-center gap-2">
                                    <Trees className="w-6 h-6 text-slate-400" />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-lg">{property.perch_size || '-'}</span>
                                        <span className="text-xs text-slate-500">Perches</span>
                                    </div>
                                </FadeInItem>
                            </div>

                            <div className="pt-6">
                                <h3 className="font-bold text-slate-900 mb-4 text-lg">Description</h3>
                                <div
                                    className="text-slate-600 leading-relaxed prose prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(parseSafe(property.description, "No description provided.")) }}
                                />
                            </div>
                        </FadeIn>

                        {/* Scroll-driven Map */}
                        <FadeIn>
                            <ScrollMap location={parseSafe(property.location, "")} />
                        </FadeIn>

                        <FadeIn className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
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

                            {/* Display Uploaded Legal Documents */}
                            {property.legal_documents && property.legal_documents.length > 0 && (
                                <div className="col-span-full pt-4 border-t border-slate-100">
                                    <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                        <span className="font-bold text-slate-700">Uploaded Documents</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {property.legal_documents.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={doc}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:shadow-md transition-all"
                                            >
                                                <Image
                                                    src={doc}
                                                    alt={`Legal Document ${idx + 1}`}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                        View
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </FadeIn>

                        {/* Financial Tools */}
                        <FadeIn className="space-y-6">
                            <EasyPaymentCalculator price={property.price} />
                            <ROICalculator price={property.price} />
                        </FadeIn>

                        {/* Neighborhood / Walk Score */}
                        <FadeIn>
                            <NeighborhoodScore location={property.location} />
                        </FadeIn>
                    </div>

                    {/* Right Column: Sticky Gallery & Agent */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24 space-y-6">

                            {/* Sticky Gallery (Desktop Only) */}
                            <div className="hidden lg:block">
                                <StickyGallery
                                    images={images}
                                    property={property}
                                    isSaved={isSaved}
                                    onSave={handleSave}
                                    savingFav={savingFav}
                                    activeImage={activeImage}
                                    setActiveImage={setActiveImage}
                                />
                            </div>

                            {/* Auction Card (Only for Auctions) */}
                            {property.listing_type === 'auction' && (
                                <AuctionCard
                                    propertyId={id}
                                    initialPrice={property.price}
                                    endTime={property.auction_end_time} // Ensure this field exists in DB
                                />
                            )}

                            {/* Agent Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
                                        <User className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{property.contact_name || "Land Sale Agent"}</h4>
                                        {isAgentVerified && (
                                            <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Verified Agent
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <button
                                        onClick={handleWhatsApp}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-5 h-5" /> Chat via WhatsApp
                                    </button>
                                    <button
                                        onClick={handleShowNumber}
                                        className={`w-full py-3 ${showNumber ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 border-slate-200'} border rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2`}
                                    >
                                        {showNumber ? (
                                            <a href={`tel:${getCleanedPhoneNumber()}`} className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Phone className="w-5 h-5" />
                                                {getFormattedPhoneNumber()}
                                            </a>
                                        ) : (
                                            <>
                                                <Phone className="w-5 h-5" />
                                                Show Number
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleMakeOfferClick}
                                        className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                                    >
                                        <HandCoins className="w-5 h-5" /> Make an Offer
                                    </button>

                                    <VideoCallButton
                                        agentName={property.contact_name || "Agent"}
                                        agentId={property.user_id}
                                        propertyTitle={property.title}
                                        isVerified={isPhoneVerified}
                                        onVerify={handleVideoCallVerification}
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 text-center mb-4">
                                        Protect your payments. Never transfer money before viewing the property.
                                    </p>
                                    <div className="flex justify-center">
                                        <ReportListingButton listingId={property.$id} listingTitle={property.title} />
                                    </div>

                                    <div
                                        onClick={() => setIsSavedSearchOpen(true)}
                                        className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-600 font-bold cursor-pointer hover:underline"
                                    >
                                        <Bell className="w-4 h-4" />
                                        Get alerts for similar lands
                                    </div>
                                </div>
                            </div>

                            {/* Schema Markup */}
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify({
                                        "@context": "https://schema.org",
                                        "@type": ["RealEstateListing", property.listing_type === 'sale' ? "Product" : "Offer"],
                                        "name": property.title,
                                        "description": parseSafe(property.description, ""),
                                        "image": images,
                                        "url": `https://landsale.lk/properties/${id}`,
                                        "datePosted": property.$createdAt,
                                        "offers": {
                                            "@type": "Offer",
                                            "price": property.price,
                                            "priceCurrency": "LKR",
                                            "availability": "https://schema.org/InStock"
                                        },
                                        "address": {
                                            "@type": "PostalAddress",
                                            "addressLocality": parseSafe(property.location, "Sri Lanka"),
                                            "addressCountry": "LK"
                                        },
                                        "numberOfRooms": property.beds || undefined,
                                        "numberOfBathroomsTotal": property.baths || undefined,
                                        "floorSize": {
                                            "@type": "QuantitativeValue",
                                            "value": property.area,
                                            "unitCode": "SQF" // Approximate unit code
                                        }
                                    })
                                }}
                            />

                            {/* AI Valuation (Moved here to be sticky with agent) */}
                            <ValuationCard property={property} />

                        </div>
                    </div>
                </div >
            </div >

            {/* 3. Related Properties */}
            {
                relatedProperties.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Properties</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedProperties.map((p) => (
                                <PropertyCard key={p.$id} property={p} />
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Recently Viewed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <RecentlyViewed currentId={id} />
            </div>

            {/* Chat Widget */}
            <ChatWidget agentId={property.user_id} agentName={property.contact_name || "Agent"} />

            {/* Mobile Sticky Contact Bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
                <div className="bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleCall}
                            className="py-3 rounded-xl font-bold bg-white text-slate-800 border border-slate-200 flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" /> Call
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="py-3 rounded-xl font-bold bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            <MessageCircle className="w-5 h-5" /> WhatsApp
                        </button>
                    </div>
                    <button
                        onClick={handleShowNumber}
                        className={`mt-3 w-full py-2 text-sm font-bold ${showNumber ? 'text-emerald-600' : 'text-slate-600'}`}
                    >
                        {showNumber ? (
                            <a href={`tel:${getCleanedPhoneNumber()}`} className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Phone className="w-4 h-4" />
                                {getFormattedPhoneNumber()}
                            </a>
                        ) : (
                            'Show number'
                        )}
                    </button>
                    <p className="mt-2 text-[11px] text-slate-400 text-center">
                        Never transfer money before viewing the property.
                    </p>
                </div>
            </div>

            {/* Lead Capture Modal for Phone Verification */}
            <LeadCaptureModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                onVerified={handlePhoneVerified}
                listingId={id}
                listingTitle={parseSafe(property?.title, 'Property')}
                sellerPhone={contactPhone}
                sellerName={property?.contact_name}
                contactType={leadContactType}
            />

            {/* Saved Search Modal */}
            <SavedSearchModal
                isOpen={isSavedSearchOpen}
                onClose={() => setIsSavedSearchOpen(false)}
                initialLocation={parseSafe(property?.location, '')}
                initialType={property?.land_type}
                initialPrice={property?.price}
            />

            {/* Make Offer Modal */}
            {
                isOfferOpen && (
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
                )
            }
        </div >
    );
}
