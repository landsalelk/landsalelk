'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Home, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Payment Successful!
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    Your agent has been hired successfully. Your property listing is now
                    <span className="text-green-600 font-semibold"> active</span> and
                    will be visible to potential buyers.
                </p>

                {/* Info Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8">
                    <p className="text-emerald-800 text-sm">
                        <strong>What happens next?</strong><br />
                        Your assigned agent will contact you shortly to discuss the property
                        and manage inquiries from interested buyers.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href={`/property/${id}`}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                    >
                        <FileText className="w-5 h-5" />
                        View Your Listing
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Return Home
                    </Link>
                </div>

                {/* Footer Note */}
                <p className="text-gray-400 text-xs mt-8">
                    A confirmation SMS has been sent to your registered phone number.
                </p>
            </div>
        </div>
    );
}
