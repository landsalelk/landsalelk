'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyMagicLink() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [error, setError] = useState('');

    useEffect(() => {
        verifyMagicLink();
    }, []);

    const verifyMagicLink = async () => {
        try {
            const userId = searchParams.get('userId');
            const secret = searchParams.get('secret');

            if (!userId || !secret) {
                setStatus('error');
                setError('Invalid magic link. Please request a new one.');
                return;
            }

            // Create session from magic URL
            await account.createSession(userId, secret);

            setStatus('success');

            // Redirect to dashboard after short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err) {
            console.error('Magic link verification error:', err);
            setStatus('error');
            setError(err.message || 'Failed to verify magic link. It may have expired.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-6 animate-spin" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Verifying Magic Link...
                        </h1>
                        <p className="text-gray-600">
                            Please wait while we sign you in.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Welcome Back!
                        </h1>
                        <p className="text-gray-600">
                            You&apos;ve been signed in successfully. Redirecting to dashboard...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error}
                        </p>
                        <div className="space-y-3">
                            <a
                                href="/auth/magic-link"
                                className="block w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                                Request New Magic Link
                            </a>
                            <a
                                href="/auth/login"
                                className="block w-full py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Login with Password
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyMagicLinkPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
            </div>
        }>
            <VerifyMagicLink />
        </Suspense>
    );
}
