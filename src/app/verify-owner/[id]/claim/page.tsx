'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { account } from '@/appwrite';
import { toast } from 'sonner';
import { claimListing } from '@/app/actions/owner-verification';
import { Loader2 } from 'lucide-react';

export default function ClaimListingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? idParam : Array.isArray(idParam) ? idParam[0] : undefined;
    const secret = searchParams.get('secret');

    const [status, setStatus] = useState('checking'); // checking, claiming, success, error
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessedRef.current) return;
        
        // Only process if we have required params
        if (!id || !secret) {
            setStatus('error');
            return;
        }
        
        const processClaim = async () => {
            hasProcessedRef.current = true;
            try {
                // Type guard: ensure id and secret are strings
                if (!id || !secret) {
                    throw new Error('Invalid verification link');
                }
                
                const listingId: string = id;
                const secretToken: string = secret;
                
                // 1. Check Authentication
                let user;
                try {
                    // This can fail if the user is not logged in. The catch block will handle redirection.
                    user = await account.get();
                } catch (e) {
                    // Not logged in, redirect to login page and preserve the claim URL
                    const returnUrl = encodeURIComponent(`/verify-owner/${listingId}/claim?secret=${secretToken}`);
                    router.push(`/auth/login?redirect=${returnUrl}`);
                    return; // Stop execution
                }

                // If we get here, user is logged in.
                if (!user) {
                    // This case should theoretically not be hit if account.get() throws on failure,
                    // but as a safeguard, we'll handle it.
                    throw new Error("Could not retrieve user session. Please try logging in again.");
                }

                setStatus('claiming');

                // 2. Create a secure JWT to authorize the server action
                const jwt = await account.createJWT();

                // 3. Call Server Action to Claim with the JWT
                const result = await claimListing(listingId, secretToken, jwt.jwt);

                if (result.success) {
                    setStatus('success');
                    toast.success("Listing claimed successfully!");
                    router.push('/dashboard/my-listings'); // Redirect to dashboard
                } else {
                    // The server action returned an error (e.g., invalid secret, listing already claimed)
                    throw new Error(result.error || "An unknown error occurred on the server.");
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
                console.error("Claim Process Error:", errorMessage);
                toast.error(errorMessage);
                setStatus('error');
            }
        };

        processClaim();
        
        // Reset when id or secret changes
        return () => {
            hasProcessedRef.current = false;
        };
    }, [id, secret, router, params?.id]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                {status === 'checking' && (
                    <>
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700">Verifying Identity...</h2>
                    </>
                )}
                {status === 'claiming' && (
                    <>
                        <Loader2 className="w-10 h-10 animate-spin text-[#10b981] mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700">Claiming Property...</h2>
                    </>
                )}
                {status === 'error' && (
                    <div className="max-w-md p-6 bg-white rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Claim Failed</h2>
                        <p className="text-slate-500 mb-4">We could not process your request.</p>
                        <button
                            onClick={() => {
                                const listingId = id || '';
                                const secretToken = secret || '';
                                router.push(`/verify-owner/${listingId}?secret=${secretToken}`);
                            }}
                            className="btn-secondary w-full py-2"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
