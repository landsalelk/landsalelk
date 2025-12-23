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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/db978fa4-1bd9-49df-bbbf-f8215a8a9216',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'verify-owner/[id]/claim/page.tsx:20',message:'processClaim entry',data:{idParam:params?.id,id,secret:secret||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            try {
                // Type guard: ensure id and secret are strings
                if (!id || !secret) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/db978fa4-1bd9-49df-bbbf-f8215a8a9216',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'verify-owner/[id]/claim/page.tsx:24',message:'validation failed',data:{hasId:!!id,hasSecret:!!secret},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    throw new Error('Invalid verification link');
                }
                
                // TypeScript now knows id is a string after the guard
                const listingId: string = id;
                const secretToken: string = secret;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/db978fa4-1bd9-49df-bbbf-f8215a8a9216',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'verify-owner/[id]/claim/page.tsx:30',message:'params extracted',data:{listingId,secretToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                // 1. Check Authentication
                let jwtToken;
                try {
                    await account.get(); // Ensure logged in
                    const jwtSession = await account.createJWT();
                    jwtToken = jwtSession.jwt;
                } catch (e) {
                    // Not logged in
                    const returnUrl = encodeURIComponent(`/verify-owner/${listingId}/claim?secret=${secretToken}`);
                    router.push(`/auth/login?redirect=${returnUrl}`);
                    return;
                }

                setStatus('claiming');

                // 2. Call Server Action to Claim
                const result = await claimListing(listingId, secretToken, jwtToken);

                if (result.success) {
                    setStatus('success');
                    toast.success("Listing claimed successfully!");
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/db978fa4-1bd9-49df-bbbf-f8215a8a9216',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'verify-owner/[id]/claim/page.tsx:65',message:'redirect start',data:{target:'/dashboard/my-listings'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                    router.push('/dashboard/my-listings'); // Redirect to dashboard
                } else {
                    throw new Error(result.error);
                }

            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/db978fa4-1bd9-49df-bbbf-f8215a8a9216',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'verify-owner/[id]/claim/page.tsx:72',message:'error caught',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ALL'})}).catch(()=>{});
                // #endregion
                console.error(error);
                toast.error(error.message || "Failed to claim listing");
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
