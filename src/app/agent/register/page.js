'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirect page: /agent/register -> /auth/register/agent
 * This ensures users can find agent registration via multiple URL paths
 */
export default function AgentRegisterRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main agent registration page
        router.replace('/auth/register/agent');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-700">Redirecting to Agent Registration...</h2>
                <p className="text-slate-500 mt-2">Please wait while we take you to the registration form.</p>
            </div>
        </div>
    );
}
