'use client';

import { useState, useEffect } from 'react';
import { submitKYC, getKYCStatus } from '@/lib/kyc';
import { UploadCloud, ShieldCheck, FileText, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

export default function KYCPage() {
    const [status, setStatus] = useState(null); // null, pending, approved, rejected
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState({ front: null, back: null });
    const router = useRouter();

    useEffect(() => {
        async function check() {
            try {
                await account.get(); // Check if user is logged in
                const doc = await getKYCStatus();
                if (doc) setStatus(doc.status);
            } catch (error) {
                // If not logged in, redirect to login
                toast.error("You must be logged in to verify your identity.");
                router.push('/auth/login?redirect=/kyc');
                return;
            }
            setLoading(false);
        }
        check();
    }, [router]);

    const handleFileChange = (e, side) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [side]: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files.front || !files.back) {
            toast.error("Please upload both sides of your NIC.");
            return;
        }

        setSubmitting(true);
        try {
            await submitKYC({
                nicFront: files.front,
                nicBack: files.back,
                type: 'verify_identity'
            });
            setStatus('pending');
            toast.success("Verification submitted successfully!");
        } catch (err) {
            toast.error(err.message || "Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Identity Verification</h1>
                    <p className="text-slate-500">To maintain a safe marketplace, we require all users to verify their identity.</p>
                </div>

                {/* Status Views */}
                {status === 'pending' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification In Progress</h2>
                        <p className="text-slate-500 mb-6">Our team is reviewing your documents. This usually takes 24 hours.</p>
                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600">
                            Your Reference ID: <span className="font-mono font-bold">KYC-{Math.floor(Math.random() * 10000)}</span>
                        </div>
                    </div>
                )}

                {status === 'approved' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500" />
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">You are Verified!</h2>
                        <p className="text-slate-500">You now have full access to list properties and contact agents.</p>
                    </div>
                )}

                {/* Submission Form */}
                {!status && (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div className="text-sm text-emerald-900">
                                <strong className="block mb-1">Your data is encrypted.</strong>
                                Documents are securely stored and only accessible by our verification team.
                            </div>
                        </div>

                        <div className="space-y-6">

                            {/* Front Upload */}
                            <div>
                                <label className="block font-semibold text-slate-900 mb-2">NIC / Driver's License (Front)</label>
                                <div className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                            ${files.front ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}
                        `}>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'front')} className="hidden" id="front-upload" accept="image/*" />
                                    <label htmlFor="front-upload" className="cursor-pointer block">
                                        {files.front ? (
                                            <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium">
                                                <CheckCircle className="w-5 h-5" /> {files.front.name}
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                                <span className="text-slate-600 font-medium">Click to Upload Front Side</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Back Upload */}
                            <div>
                                <label className="block font-semibold text-slate-900 mb-2">NIC / Driver's License (Back)</label>
                                <div className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                            ${files.back ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}
                        `}>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'back')} className="hidden" id="back-upload" accept="image/*" />
                                    <label htmlFor="back-upload" className="cursor-pointer block">
                                        {files.back ? (
                                            <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium">
                                                <CheckCircle className="w-5 h-5" /> {files.back.name}
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                                <span className="text-slate-600 font-medium">Click to Upload Back Side</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            {submitting ? 'Submitting...' : 'Submit for Verification'}
                        </button>

                    </form>
                )}

            </div>
        </div>
    );
}
