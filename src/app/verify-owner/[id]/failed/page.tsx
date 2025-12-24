'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const secret = searchParams.get('secret');

    const handleRetry = () => {
        if (secret) {
            router.push(`/verify-owner/${id}?secret=${secret}`);
        } else {
            router.push(`/verify-owner/${id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Payment Failed
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    We couldn't process your payment. This could be due to insufficient funds,
                    a declined card, or a network issue. <strong>No charges have been made.</strong>
                </p>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
                    <p className="text-amber-800 text-sm">
                        <strong>Common solutions:</strong><br />
                        • Check your card details and try again<br />
                        • Ensure you have sufficient balance<br />
                        • Try a different payment method
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Return Home
                    </Link>
                </div>

                {/* Help Link */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm transition-colors"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Need help? Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
