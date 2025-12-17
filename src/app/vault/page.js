'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { account, databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/lib/constants';
import { Query } from 'appwrite';
import {
    DOCUMENT_CATEGORIES,
    uploadLegalDocument,
    getListingDocuments,
    canUseVault,
    SUBSCRIPTION_PACKAGES
} from '@/lib/legal_vault';
import { toast } from 'sonner';
import {
    FileText, Upload, Check, AlertCircle, Lock,
    ChevronDown, ChevronRight, Building2, Shield,
    Loader2, Info, CheckCircle2, FileWarning
} from 'lucide-react';

export default function VaultPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [existingDocs, setExistingDocs] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState('title');
    const [consentChecked, setConsentChecked] = useState(false);
    const [vaultAccess, setVaultAccess] = useState({ canUse: false });

    useEffect(() => {
        async function init() {
            try {
                const usr = await account.get();
                setUser(usr);

                // Check vault access
                const access = await canUseVault(usr.$id);
                setVaultAccess(access);

                // Get user's listings
                const response = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_LISTINGS,
                    [Query.equal('user_id', usr.$id), Query.orderDesc('$createdAt')]
                );
                setListings(response.documents);
            } catch (error) {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [router]);

    useEffect(() => {
        async function loadDocs() {
            if (selectedListing) {
                const docs = await getListingDocuments(selectedListing.$id);
                setExistingDocs(docs);
            }
        }
        loadDocs();
    }, [selectedListing]);

    const handleFileUpload = async (category, docType, file) => {
        if (!consentChecked) {
            toast.error('Please confirm you have owner consent to upload');
            return;
        }
        if (!selectedListing) {
            toast.error('Please select a listing first');
            return;
        }

        setUploading(true);
        try {
            await uploadLegalDocument(
                file,
                selectedListing.$id,
                category,
                docType,
                consentChecked
            );
            toast.success('Document uploaded successfully!');

            // Refresh documents
            const docs = await getListingDocuments(selectedListing.$id);
            setExistingDocs(docs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const isDocUploaded = (docTypeId) => {
        return existingDocs.some(doc => doc.document_type === docTypeId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // No vault access - show upgrade prompt
    if (!vaultAccess.canUse) {
        return (
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="bg-white rounded-3xl shadow-lg p-12">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-amber-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">Legal Vault Access Required</h1>
                        <p className="text-slate-600 mb-8">
                            Upgrade to a Silver, Gold, or Platinum package to access the Legal Vault and securely store property documents.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {['silver', 'gold', 'platinum'].map(pkg => (
                                <div key={pkg} className={`p-4 rounded-xl border-2 ${pkg === 'gold' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                                    }`}>
                                    <h3 className="font-bold text-lg capitalize">{pkg}</h3>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        රු. {SUBSCRIPTION_PACKAGES[pkg].price.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-slate-500">/month</p>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                            <Shield className="w-5 h-5" />
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-emerald-500" />
                        Legal Vault (ඔප්පු ගබඩාව)
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Securely store property documents for your listings
                    </p>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-bold mb-1">Legal Disclaimer</p>
                            <p>
                                Landsale.lk යනු ලේඛන ගබඩා කරන වේදිකාවක් පමණි. ගැනුම්කරුවන්
                                අනිවාර්යයෙන්ම නීතිඥයෙකු හරහා මුල් පිටපත් පරීක්ෂා කළ යුතුය.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Listing Selector */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
                            <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-500" />
                                Select Listing
                            </h2>

                            {listings.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 mb-4">No listings yet</p>
                                    <Link href="/properties/create" className="text-emerald-600 font-bold">
                                        Create a Listing
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {listings.map(listing => (
                                        <button
                                            key={listing.$id}
                                            onClick={() => setSelectedListing(listing)}
                                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedListing?.$id === listing.$id
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <p className="font-medium text-slate-900 truncate">
                                                {listing.title || 'Untitled'}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">
                                                {listing.location || 'No location'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Consent Checkbox */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={consentChecked}
                                        onChange={(e) => setConsentChecked(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-emerald-500 mt-0.5"
                                    />
                                    <span className="text-sm text-slate-600">
                                        මෙම ලේඛන පල කිරීමට ඉඩම් හිමියාගේ පූර්ණ අවසරය ඇති බව මම තහවුරු කරමි.
                                        <span className="block text-xs text-slate-400 mt-1">
                                            I confirm I have the landowner's full permission to upload these documents.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right: Document Categories */}
                    <div className="lg:col-span-2 space-y-4">
                        {!selectedListing ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">Select a listing to upload documents</p>
                            </div>
                        ) : (
                            Object.entries(DOCUMENT_CATEGORIES).map(([catId, category]) => (
                                <div key={catId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedCategory(expandedCategory === catId ? null : catId)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-slate-900">{category.name}</h3>
                                                <p className="text-sm text-slate-500">{category.nameEn}</p>
                                            </div>
                                        </div>
                                        {expandedCategory === catId ? (
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        )}
                                    </button>

                                    {expandedCategory === catId && (
                                        <div className="p-4 pt-0 space-y-3">
                                            {category.types.map(docType => (
                                                <div
                                                    key={docType.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl border ${isDocUploaded(docType.id)
                                                            ? 'bg-emerald-50 border-emerald-200'
                                                            : 'bg-slate-50 border-slate-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isDocUploaded(docType.id) ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : docType.required ? (
                                                            <FileWarning className="w-5 h-5 text-amber-500" />
                                                        ) : (
                                                            <FileText className="w-5 h-5 text-slate-400" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">
                                                                {docType.name}
                                                                {docType.required && (
                                                                    <span className="ml-2 text-xs text-amber-600 font-bold">Required</span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-slate-500">{docType.nameEn}</p>
                                                        </div>
                                                    </div>

                                                    <label className={`cursor-pointer px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${isDocUploaded(docType.id)
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                        }`}>
                                                        {uploading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : isDocUploaded(docType.id) ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Uploaded
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-4 h-4" />
                                                                Upload
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files[0]) {
                                                                    handleFileUpload(catId, docType.id, e.target.files[0]);
                                                                }
                                                            }}
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
