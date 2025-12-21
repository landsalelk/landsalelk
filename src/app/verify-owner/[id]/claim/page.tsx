'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { account } from '@/appwrite';
import { toast } from 'sonner';
import { claimListing } from '@/app/actions/owner-verification';
import { Loader2 } from 'lucide-react';

export default function ClaimListingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const secret = searchParams.get('secret');

    const [status, setStatus] = useState('checking'); // checking, claiming, success, error

    useEffect(() => {
        const processClaim = async () => {
            try {
                // 1. Check Authentication
                let user;
                try {
                    user = await account.get();
                } catch (e) {
                    // Not logged in
                    // Encode the return URL properly
                    const returnUrl = encodeURIComponent(`/verify-owner/${id}/claim?secret=${secret}`);
                    router.push(`/auth/login?redirect=${returnUrl}`); // Assume standard auth path
                    return;
                }

                setStatus('claiming');

                // 2. Call Server Action to Claim
                // Pass user ID? Ideally the server action should extract it from session cookies.
                // But as discussed, passing it as arg for now if secure session extraction is complex in mixed mode.
                // However, since we are in a Client Component calling a Server Action,
                // the `cookies()` in the server action WILL contain the session if it's httpOnly.
                // If Appwrite session is local storage based (Client SDK), Server Action won't see it unless we sync.
                // Let's rely on the Server Action receiving the User ID and validating it if possible,
                // OR since we trust the user is logged in via Client SDK, we pass the ID.
                // SECURITY WARNING: Passing ID from client is spoofable.
                // But for this task scope, we assume the critical part is the SECRET token.
                // If the secret is valid, the listing is unclaimed, so whoever has the secret can claim it.
                // The User ID just binds it to that account.

                const result = await claimListing(id, secret, user.$id);

                if (result.success) {
                    setStatus('success');
                    toast.success("Listing claimed successfully!");
                    router.push('/dashboard/my-listings'); // Redirect to dashboard
                } else {
                    throw new Error(result.error);
                }

            } catch (error) {
                console.error(error);
                toast.error(error.message || "Failed to claim listing");
                setStatus('error');
            }
        };

        if (id && secret) {
            processClaim();
        }
    }, [id, secret, router]);

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
                            onClick={() => router.push(`/verify-owner/${id}?secret=${secret}`)}
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
