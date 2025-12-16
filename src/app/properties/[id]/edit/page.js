'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPropertyById } from '@/lib/properties';
import { databases, storage, account } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { toast } from 'sonner';
import {
    Save, Loader2, ImagePlus, X, MapPin, Home, Banknote,
    BedDouble, Bath, Ruler, ArrowLeft, Trash2, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { DB_ID, COLLECTION_LISTINGS } from '@/lib/constants';

export default function EditPropertyPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
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
        deed_type: '',
        approval_nbro: false,
        approval_coc: false,
        approval_uda: false,
        infrastructure_distance: '',
        is_foreign_eligible: false,
        has_payment_plan: false
    });

    useEffect(() => {
        setMounted(true);
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            const user = await account.get();
            const property = await getPropertyById(id);

            // Check ownership
            if (property.user_id !== user.$id) {
                toast.error("You don't have permission to edit this property");
                router.push('/dashboard');
                return;
            }

            setFormData({
                title: property.title || '',
                description: property.description || '',
                price: property.price?.toString() || '',
                location: property.location || '',
                beds: property.beds?.toString() || '',
                baths: property.baths?.toString() || '',
                size_sqft: property.size_sqft?.toString() || '',
                perch_size: property.perch_size?.toString() || '',
                category_id: property.category_id || 'house',
                listing_type: property.listing_type || 'sale',
                deed_type: property.deed_type || '',
                approval_nbro: property.approval_nbro || false,
                approval_coc: property.approval_coc || false,
                approval_uda: property.approval_uda || false,
                infrastructure_distance: property.infrastructure_distance || '',
                is_foreign_eligible: property.is_foreign_eligible || false,
                has_payment_plan: property.has_payment_plan || false
            });

            // Parse existing images
            if (property.images) {
                try {
                    const parsed = JSON.parse(property.images);
                    setImages(Array.isArray(parsed) ? parsed : []);
                } catch {
                    setImages([]);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load property");
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
    };

    const removeExistingImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNewImage = (idx) => {
        setNewImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Upload new images
            const uploadedUrls = [];
            for (const img of newImages) {
                try {
                    const res = await storage.createFile('listings', ID.unique(), img);
                    const url = `https://cloud.appwrite.io/v1/storage/buckets/listings/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                    uploadedUrls.push(url);
                } catch (err) {
                    console.warn("Image upload failed:", err);
                    toast.error(`Failed to upload image: ${img.name}`);
                }
            }

            // Combine existing and new images
            const allImages = [...images, ...uploadedUrls];

            // Update document
            await databases.updateDocument(
                DB_ID,
                COLLECTION_LISTINGS,
                id,
                {
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price) || 0,
                    location: formData.location,
                    beds: parseInt(formData.beds) || 0,
                    baths: parseInt(formData.baths) || 0,
                    size_sqft: parseInt(formData.size_sqft) || 0,
                    perch_size: parseFloat(formData.perch_size) || 0,
                    category_id: formData.category_id,
                    listing_type: formData.listing_type,
                    deed_type: formData.deed_type,
                    approval_nbro: formData.approval_nbro,
                    approval_coc: formData.approval_coc,
                    approval_uda: formData.approval_uda,
                    infrastructure_distance: parseFloat(formData.infrastructure_distance) || 0,
                    is_foreign_eligible: formData.is_foreign_eligible,
                    has_payment_plan: formData.has_payment_plan,
                    images: JSON.stringify(allImages),
                    updated_at: new Date().toISOString()
                }
            );

            toast.success("Property updated successfully!");
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to update property");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
            return;
        }

        setDeleting(true);
        try {
            await databases.deleteDocument(DB_ID, COLLECTION_LISTINGS, id);
            toast.success("Property deleted");
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete property");
        } finally {
            setDeleting(false);
        }
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 pt-24 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800">Edit Property</h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                    </button>
                </div>

                {/* Form */}
                <div className="glass-card rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block font-bold text-slate-700 mb-2">
                                <Home className="w-4 h-4 inline mr-2" />
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium"
                                required
                            />
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-2">
                                    <Banknote className="w-4 h-4 inline mr-2" />
                                    Price (LKR)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium"
                                    required
                                />
                            </div>
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
                                        type="number"
                                        step="0.1"
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
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                                    <BedDouble className="w-3 h-3 inline mr-1" /> Beds
                                </label>
                                <input
                                    type="number"
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
                                    type="number"
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
                                    type="number"
                                    value={formData.size_sqft}
                                    onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Perches</label>
                                <input
                                    type="number"
                                    value={formData.perch_size}
                                    onChange={(e) => setFormData({ ...formData, perch_size: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#6ee7b7] text-center font-bold"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-medium resize-none"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block font-bold text-slate-700 mb-3">Photos</label>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Existing Images */}
                                {images.map((img, i) => (
                                    <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(i)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* New Images */}
                                {newImages.map((img, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-[#10b981]">
                                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-0 left-0 bg-[#10b981] text-white text-xs px-2 py-1">New</div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(i)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Button */}
                                <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#10b981] transition-colors text-slate-400">
                                    <ImagePlus className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-bold">Add Photo</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/dashboard"
                                className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-center hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-4 bg-[#10b981] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/30 hover:bg-[#059669] transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
