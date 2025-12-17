'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { Client, Functions } from 'appwrite';

function VerifyOtpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const listingId = searchParams.get('listingId');
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Client-side Appwrite init (or import from lib)
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    const functions = new Functions(client);

    const handleVerify = async (e) => {
        e.preventDefault();
        setVerifying(true);

        try {
            const execution = await functions.createExecution(
                'verify-otp',
                JSON.stringify({ listing_id: listingId, otp: otp })
            );

            // Parse response
            let response = {};
            try {
                response = JSON.parse(execution.responseBody);
            } catch (e) {
                console.error("Failed to parse response", execution.responseBody);
            }

            if (response.success) {
                toast.success("Property Verified Successfully!");
                router.push('/dashboard'); // or /properties/${listingId}
            } else {
                toast.error(response.error || "Verification Failed. Invalid Code.");
            }
        } catch (error) {
            console.error(error);
            toast.error("System error during verification.");
        } finally {
            setVerifying(false);
        }
    };

    if (!listingId) {
        return <div className="p-8 text-center text-red-500">Invalid Verification Link</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Owner Verification</h1>
                <p className="text-slate-500 mb-8">
                    Enter the 6-digit code sent to the owner's phone number to verify this listing.
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000 000"
                            className="w-full text-center text-3xl font-bold tracking-widest py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={verifying || otp.length < 6}
                        className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify Listing
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-sm text-slate-400">
                    Did not receive the code? <button className="text-green-600 font-bold hover:underline">Resend</button>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
