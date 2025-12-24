'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, storage } from '@/appwrite';
import { ID } from 'appwrite';
import { toast } from 'sonner';
import {
    User, Upload, ShieldCheck, MapPin, Briefcase,
    CheckCircle, Camera, Loader2, ChevronRight, ChevronLeft
} from 'lucide-react';
import { DB_ID, COLLECTION_AGENTS, BUCKET_KYC } from '@/appwrite/config';

export default function AgentRegistrationPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [checking, setChecking] = useState(true);
    const [successModal, setSuccessModal] = useState(false); // [NEW]
    const [nicFile, setNicFile] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        experience_years: '',
        service_areas: '', // Comma separated
        license_number: '',
        bio: ''
    });

    useEffect(() => {
        const checkExistingProfile = async () => {
            try {
                const user = await account.get();
                const { Query } = await import('appwrite'); // Dynamic import to avoid top-level issues if any

                const agentList = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENTS,
                    [Query.equal('user_id', user.$id)]
                );

                if (agentList.documents.length > 0) {
                    toast.info("You have already submitted an agent application.");
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error("Profile check failed:", error);
                // Don't block registration on check failure, unless it's a critical auth error
                if (error.code === 401) router.push('/auth/login');
            } finally {
                setChecking(false);
            }
        };

        checkExistingProfile();
    }, [router]); // Removed unnecessary dependencies

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNicFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const user = await account.get();

            // Double check before submit (in case they bypassed client check)
            const { Query } = await import('appwrite');
            const existing = await databases.listDocuments(DB_ID, COLLECTION_AGENTS, [Query.equal('user_id', user.$id)]);
            if (existing.total > 0) {
                toast.error("Application already exists.");
                router.push('/dashboard');
                return;
            }

            // 1. Upload NIC
            let nicUrl = '';
            if (nicFile) {
                const fileUpload = await storage.createFile(
                    BUCKET_KYC,
                    ID.unique(),
                    nicFile
                );
                // We don't expose public URL for KYC, just store the ID or internal view logic
                nicUrl = fileUpload.$id;
            }

            // 2. Create Agent Profile
            // Convert service_areas from comma-separated string to array
            const serviceAreasArray = formData.service_areas
                ? formData.service_areas.split(',').map(s => s.trim()).filter(s => s)
                : [];

            await databases.createDocument(
                DB_ID,
                COLLECTION_AGENTS,
                ID.unique(),
                {
                    user_id: user.$id,
                    name: formData.full_name,
                    phone: formData.phone,
                    email: user.email || '',
                    experience_years: parseInt(formData.experience_years) || 0,
                    service_areas: serviceAreasArray,
                    license_number: formData.license_number,
                    bio: formData.bio,
                    nic_doc_id: nicUrl,
                    is_verified: false, // Pending admin review
                    status: 'pending',
                    rating: 0,
                    review_count: 0,
                    deals_count: 0,
                    created_at: new Date().toISOString()
                }
            );

            // 3. Update User Prefs (Optional, but good for UI)
            await account.updatePrefs({
                role: 'agent_pending',
                agent_profile_created: true
            });

            // Show success modal or clearer message
            setSuccessModal(true); // We will add a modal UI for this

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Registration failed. Please try again.");
            setSubmitting(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (successModal) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
                    <p className="text-slate-500 mb-6">
                        Your agent application is under review. Our team will verify your documents and approve your account within 24 hours.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 mb-6 text-left">
                        <p className="font-bold mb-2">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Admin reviews your NIC/License</li>
                            <li>You get a "Verified Agent" badge</li>
                            <li>Access to exclusive leads unlocks</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 pt-24 animate-fade-in">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Join Agent Network</h1>
                    <p className="text-slate-500">Become a verified partner and access exclusive leads.</p>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s ? 'bg-emerald-600 text-white' :
                            step > s ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                            }`}>
                            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <form onSubmit={handleSubmit}>

                        {/* Step 1: Professional Info */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800">Professional Details</h2>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                        placeholder="As listed on your NIC"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                            placeholder="+94 7..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-2">Experience (Yrs)</label>
                                        <input
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                            placeholder="e.g. 5"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">Service Areas</label>
                                    <input
                                        type="text"
                                        value={formData.service_areas}
                                        onChange={e => setFormData({ ...formData, service_areas: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                        placeholder="Colombo, Kandy, Galle (Comma separated)"
                                    />
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Helps us match you with local leads
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: KYC */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    Identity Verification
                                </h2>

                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm">
                                    To receive the "Verified Agent" badge, we need to verify your identity. Your documents are stored securely.
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-4">Upload NIC / Driving License (Front)</label>
                                    <label className={`
                                        flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
                                        ${nicFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'}
                                    `}>
                                        {nicFile ? (
                                            <div className="text-center">
                                                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                                                <p className="text-emerald-800 font-medium">{nicFile.name}</p>
                                                <p className="text-emerald-600 text-xs">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Camera className="w-10 h-10 mx-auto mb-2" />
                                                <p className="font-medium text-slate-600">Click to Upload</p>
                                                <p className="text-xs">JPG, PNG or PDF</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    </label>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">License / BR Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.license_number}
                                        onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                        placeholder="If registered company"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bio & Review */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800">Final Step</h2>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">Short Bio</label>
                                    <textarea
                                        rows={4}
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none resize-none"
                                        placeholder="Tell buyers why they should hire you..."
                                    />
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-slate-100 rounded-xl">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded" required />
                                    <p className="text-sm text-slate-600">
                                        I agree to the <a href="/terms" className="text-emerald-600 hover:underline">Terms of Service</a> and verify that the information provided is accurate.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between pt-8 mt-6 border-t border-slate-100">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Back
                                </button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step + 1)}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Submit Application
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}