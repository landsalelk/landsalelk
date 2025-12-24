"use client";

import { useActionState } from 'react';
import { submitAgencyApplication } from '@/actions/agencyActions';
// import { useAuth } from '@/context/AuthContext'; // Removed: Unused
import { account } from '@/lib/appwrite';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Building, Scale, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AgencyApplyPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check Auth
    useEffect(() => {
        const checkUser = async () => {
            try {
                const u = await account.get();
                setUser(u);
            } catch (err) {
                router.push('/auth/login?redirect=/agency/apply');
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    // Server Action Hook
    const [state, formAction, isPending] = useActionState(submitAgencyApplication, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push('/dashboard'); // distinct from agency dashboard
        } else if (state?.success === false) {
            toast.error(state.message);
        }
    }, [state, router]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-[#1e293b] p-8 text-center text-white">
                        <Building className="mx-auto h-12 w-12 text-[#10b981] mb-4" />
                        <h1 className="text-3xl font-bold">Become a Partner Agency</h1>
                        <p className="mt-2 text-slate-300">Join Sri Lanka's fastest growing real estate network. Get verified, earn trust, and grow your business.</p>
                    </div>

                    <form action={formAction} className="p-8 space-y-6">
                        <input type="hidden" name="owner_id" value={user.$id} />

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Building className="w-5 h-5 text-[#10b981]" />
                                Agency Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
                                    <input type="text" name="name" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" placeholder="e.g. Helix Realty" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Public Handle (Slug)</label>
                                    <input type="text" name="slug" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" placeholder="e.g. helix-realty" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#10b981]" />
                                Location & Contact
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Office Address</label>
                                    <input type="text" name="address" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                    <input type="text" name="city" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                                    <select name="district" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all bg-white">
                                        <option value="">Select District</option>
                                        <option value="Colombo">Colombo</option>
                                        <option value="Gampaha">Gampaha</option>
                                        <option value="Kalutara">Kalutara</option>
                                        <option value="Kandy">Kandy</option>
                                        <option value="Galle">Galle</option>
                                        <option value="Matara">Matara</option>
                                        {/* Add other districts as needed */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                                    <input type="tel" name="contact_phone" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" placeholder="+94 77 ..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                                    <input type="email" name="contact_email" defaultValue={user.email} required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-[#10b981]" />
                                Legal Verification
                            </h2>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                                This is critical for the "Lawyer Verified" badge. Please provide the details of the Attorney-at-Law you primarily work with for deed verification.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Partner Lawyer Name</label>
                                <input type="text" name="lawyer_name" required className="w-full rounded-xl border border-slate-200 p-3 focus:border-[#10b981] focus:ring-0 outline-none transition-all" placeholder="e.g. Mr. S. Perera, Attorney-at-Law" />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
