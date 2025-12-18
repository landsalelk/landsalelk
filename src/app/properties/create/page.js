'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    MapPin, Home, Trees, Building, Camera, Upload, ChevronRight, ChevronLeft,
    Sparkles, Check, Loader2, ImagePlus, X, Phone, Mail, User, ShieldCheck,
    FileText, Banknote, Ruler, BedDouble, Bath
} from 'lucide-react';

export default function CreateListingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [agentScanning, setAgentScanning] = useState(false);
    const [agentMatched, setAgentMatched] = useState(null);
    const [images, setImages] = useState([]);
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        beds: '',
        baths: '',
        size_sqft: '',
        perch_size: '',
        category_id: 'house',
        listing_type: 'sale',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        deed_type: '',
        approval_nbro: false,
        approval_coc: false,
        approval_uda: false,
        infrastructure_distance: '',
        is_foreign_eligible: false,
        has_payment_plan: false,
        owner_phone: '',
        agreed_commission: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const propertyTypes = [
        { id: 'house', label: 'House', icon: Home, color: 'bg-blue-50 text-blue-600 border-blue-200' },
        { id: 'land', label: 'Land', icon: Trees, color: 'bg-green-50 text-green-600 border-green-200' },
        { id: 'apartment', label: 'Apartment', icon: Building, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    ];

    const listingTypes = [
        { id: 'sale', label: 'For Sale', desc: 'Sell your property' },
        { id: 'rent', label: 'For Rent', desc: 'Rent out your property' },
    ];

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const scanForAgents = async () => {
        setAgentScanning(true);
        // Simulate agent matching
        await new Promise(resolve => setTimeout(resolve, 2500));
        setAgentMatched({
            name: 'Kumara Perera',
            phone: '+94 77 123 4567',
            rating: 4.9,
            listings: 45,
            verified: true
        });
        setAgentScanning(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { storage } = await import('@/lib/appwrite');
            const { ID } = await import('appwrite');
            const { createProperty } = await import('@/lib/properties');

            const imageIds = [];
            const bucketId = 'listing_images';

            for (const img of images) {
                try {
                    const res = await storage.createFile(bucketId, ID.unique(), img);
                    const url = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                    imageIds.push(url);
                } catch (err) {
                    imageIds.push("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000");
                }
            }

            const newProperty = await createProperty({
                ...formData,
                price: parseFloat(formData.price) || 0,
                beds: parseInt(formData.beds) || 0,
                baths: parseInt(formData.baths) || 0,
                size_sqft: parseInt(formData.size_sqft) || 0,
                perch_size: parseFloat(formData.perch_size) || 0,
                infrastructure_distance: parseFloat(formData.infrastructure_distance) || 0,
                deed_type: formData.deed_type,
                approval_nbro: formData.approval_nbro,
                approval_coc: formData.approval_coc,
                approval_uda: formData.approval_uda,
                is_foreign_eligible: formData.is_foreign_eligible,
                has_payment_plan: formData.has_payment_plan,
                images: JSON.stringify(imageIds),
                // Pass owner fields explicitly if not in ...formData (they are)
            });

            if (newProperty.status === 'pending_owner') {
                toast.success("Please verify owner consent.");
                router.push(`/verify/otp?listingId=${newProperty.$id}`);
            } else {
                toast.success("🎉 දැන්වීම සාර්ථකයි! Property listed!");
                router.push('/profile');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create listing. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
        if (step === 2 && !agentMatched) {
            scanForAgents();
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen py-6 md:py-12 px-0 md:px-4 animate-fade-in">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8 md:mb-12 px-4">
                    <div className="inline-flex items-center gap-2 bg-[#ecfdf5] text-[#10b981] px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4" /> Free Listing
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2 md:mb-3">
                        List Your Property
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto">
                        ඔබේ දේපල දැන්වීම තත්පර කිහිපයකින් ප්‍රකාශ කරන්න
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8 md:mb-12">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === s
                                ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30'
                                : step > s
                                    ? 'bg-[#d1fae5] text-[#10b981]'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            {s < 4 && (
                                <div className={`w-12 h-1 mx-1 rounded-full ${step > s ? 'bg-[#10b981]' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-white md:glass-card rounded-t-3xl md:rounded-3xl p-6 md:p-12 shadow-top md:shadow-none min-h-[calc(100vh-200px)]">
                    <form onSubmit={handleSubmit}>

                        {/* Step 1: Property Type */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">What are you listing?</h2>

                                {/* Property Type */}
                                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                                    {propertyTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category_id: type.id })}
                                            className={`p-4 md:p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center ${formData.category_id === type.id
                                                ? `${type.color} border-current shadow-lg`
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <type.icon className={`w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 ${formData.category_id === type.id ? '' : 'text-slate-400'}`} />
                                            <span className="text-sm md:text-base font-bold">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Listing Type */}
                                <h3 className="font-bold text-slate-700 mb-4">Purpose</h3>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {listingTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, listing_type: type.id })}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.listing_type === type.id
                                                ? 'border-[#10b981] bg-[#ecfdf5]'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <span className="font-bold text-slate-800">{type.label}</span>
                                            <p className="text-sm text-slate-500 mt-1">{type.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Location */}
                                <div className="mb-6">
                                    <label className="block font-bold text-slate-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Colombo 7, Cinnamon Gardens"
                                        className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium text-slate-700 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Agent Matching */}
                        {step === 2 && (
                            <div className="animate-fade-in text-center">
                                <h2 className="text-xl font-bold text-slate-800 mb-3">Finding You an Agent</h2>
                                <p className="text-slate-500 mb-8">We'll match you with a verified agent in your area</p>

                                {agentScanning ? (
                                    <div className="py-12">
                                        {/* Scanning Animation */}
                                        <div className="relative w-48 h-48 mx-auto mb-8">
                                            <div className="absolute inset-0 rounded-full border-4 border-[#10b981]/20 animate-ping" />
                                            <div className="absolute inset-4 rounded-full border-4 border-[#10b981]/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                                            <div className="absolute inset-8 rounded-full border-4 border-[#10b981]/40 animate-ping" style={{ animationDelay: '1s' }} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-24 h-24 bg-[#10b981] rounded-full flex items-center justify-center">
                                                    <svg viewBox="0 0 100 100" fill="none" className="w-14 h-14">
                                                        <circle cx="50" cy="50" r="45" fill="white" />
                                                        <path d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z" fill="#10b981" />
                                                        <circle cx="50" cy="38" r="15" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[#10b981] font-bold animate-pulse">Scanning for nearby agents...</p>
                                    </div>
                                ) : agentMatched ? (
                                    <div className="py-8">
                                        {/* Matched Agent Card */}
                                        <div className="glass-panel rounded-3xl p-8 max-w-md mx-auto text-left">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-16 h-16 bg-gradient-to-br from-[#d1fae5] to-[#cffafe] rounded-2xl flex items-center justify-center">
                                                    <svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
                                                        <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
                                                        <path d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z" fill="#3B82F6" />
                                                        <circle cx="50" cy="38" r="15" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-bold text-slate-800">{agentMatched.name}</h3>
                                                        {agentMatched.verified && (
                                                            <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{agentMatched.listings} listings • ⭐ {agentMatched.rating}</p>
                                                </div>
                                            </div>

                                            <div className="bg-green-50 text-green-700 rounded-xl p-4 flex items-center gap-3">
                                                <Check className="w-5 h-5" />
                                                <span className="font-medium">Agent matched! They'll help you sell faster.</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setAgentMatched(null)}
                                            className="mt-6 text-slate-500 text-sm hover:text-slate-700"
                                        >
                                            Skip agent assistance
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-12">
                                        <button
                                            type="button"
                                            onClick={scanForAgents}
                                            className="btn-primary px-8 py-4"
                                        >
                                            <User className="w-5 h-5 mr-2" />
                                            Find Me an Agent
                                        </button>
                                        <p className="mt-4 text-slate-400 text-sm">Or continue without an agent</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Property Details */}
                        {step === 3 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">Property Details</h2>

                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-2">
                                            <FileText className="w-4 h-4 inline mr-2" />
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Luxury Villa with Pool in Colombo 7"
                                            className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium text-slate-700 transition-all"
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-2">
                                            <Banknote className="w-4 h-4 inline mr-2" />
                                            Price (LKR)
                                        </label>
                                        <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="50,000,000"
                                            className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium text-slate-700 transition-all"
                                        />
                                    </div>

                                    {/* Sri Lankan Market Specs */}
                                    <div className="glass-panel rounded-2xl p-6 bg-slate-50/50 space-y-4 border border-slate-100">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                                            Legal & Approvals 🇱🇰
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Deed Type</label>
                                                <select
                                                    value={formData.deed_type || ''}
                                                    onChange={(e) => setFormData({ ...formData, deed_type: e.target.value })}
                                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="sinnakkara">Sinnakkara (Freehold)</option>
                                                    <option value="bim_saviya">Bim Saviya</option>
                                                    <option value="jayabhoomi">Jayabhoomi / Swarnabhoomi</option>
                                                    <option value="condominium">Condominium Deed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Dist. to Highway/LRT (km)</label>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={formData.infrastructure_distance || ''}
                                                    onChange={(e) => setFormData({ ...formData, infrastructure_distance: e.target.value })}
                                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                                    placeholder="0.0 km"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.approval_nbro || false}
                                                    onChange={(e) => setFormData({ ...formData, approval_nbro: e.target.checked })}
                                                    className="w-5 h-5 accent-[#10b981]"
                                                />
                                                <span className="text-sm font-medium text-slate-700">NBRO Certified</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.approval_coc || false}
                                                    onChange={(e) => setFormData({ ...formData, approval_coc: e.target.checked })}
                                                    className="w-5 h-5 accent-[#10b981]"
                                                />
                                                <span className="text-sm font-medium text-slate-700">COC Obtained</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.approval_uda || false}
                                                    onChange={(e) => setFormData({ ...formData, approval_uda: e.target.checked })}
                                                    className="w-5 h-5 accent-[#10b981]"
                                                />
                                                <span className="text-sm font-medium text-slate-700">UDA Approved</span>
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200/50">
                                            {formData.category_id === 'land' && (
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.has_payment_plan || false}
                                                        onChange={(e) => setFormData({ ...formData, has_payment_plan: e.target.checked })}
                                                        className="w-5 h-5 accent-[#10b981]"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 bg-yellow-100 px-2 py-0.5 rounded">Easy Payment Plan Available</span>
                                                </label>
                                            )}
                                            {(formData.category_id === 'apartment' || formData.category_id === 'house') && (
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_foreign_eligible || false}
                                                        onChange={(e) => setFormData({ ...formData, is_foreign_eligible: e.target.checked })}
                                                        className="w-5 h-5 accent-[#10b981]"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 bg-blue-100 px-2 py-0.5 rounded">Foreign Buyer Eligible</span>
                                                </label>
                                            )}
                                        </div>

                                        {/* Specs Grid */}
                                        {formData.category_id !== 'land' && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                                                        <BedDouble className="w-3 h-3 inline mr-1" /> Beds
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={formData.beds}
                                                        onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                                                        <Bath className="w-3 h-3 inline mr-1" /> Baths
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={formData.baths}
                                                        onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                                                        <Ruler className="w-3 h-3 inline mr-1" /> Sq.Ft
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={formData.size_sqft}
                                                        onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Perches</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={formData.perch_size}
                                                        onChange={(e) => setFormData({ ...formData, perch_size: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {formData.category_id === 'land' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                                                        <Ruler className="w-3 h-3 inline mr-1" /> Size (Perches)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={formData.perch_size}
                                                        onChange={(e) => setFormData({ ...formData, perch_size: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Size (Sq.Ft)</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={formData.size_sqft}
                                                        onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-2">Description</label>
                                            <textarea
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe your property in detail..."
                                                className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium text-slate-700 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Photos & Submit */}
                        {step === 4 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">
                                    <Camera className="w-5 h-5 inline mr-2" />
                                    Add Photos
                                </h2>

                                {/* Image Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                                            <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#10b981] transition-colors text-slate-400">
                                        <ImagePlus className="w-10 h-10 mb-2" />
                                        <span className="text-sm font-bold">Add Photo</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>

                                {/* Contact Info */}
                                <div className="glass-panel rounded-2xl p-6 mb-8">
                                    <h3 className="font-bold text-slate-800 mb-4">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.contact_name}
                                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                                placeholder="Your Name"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="tel"
                                                inputMode="tel"
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                placeholder="Phone Number"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                inputMode="email"
                                                value={formData.contact_email}
                                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                                placeholder="Email (optional)"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Details (For Agents) */}
                                <div className="glass-panel rounded-2xl p-6 mb-8 bg-blue-50/50 border-blue-100">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                                        Owner Verification
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Enter owner details to initiate the digital consent flow. An SMS will be sent to the owner.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Owner Phone</label>
                                            <input
                                                type="tel"
                                                inputMode="tel"
                                                value={formData.owner_phone}
                                                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                                                placeholder="+94 7X XXX XXXX"
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Commission (%)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={formData.agreed_commission}
                                                onChange={(e) => setFormData({ ...formData, agreed_commission: e.target.value })}
                                                placeholder="3.0"
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6" />
                                            Publish Listing
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {step < 4 && (
                            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#10b981] text-white rounded-xl font-bold shadow-lg shadow-[#10b981]/30 hover:bg-[#059669] transition-all"
                                >
                                    Continue
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
