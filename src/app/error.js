'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log error for debugging but don't expose to users
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="text-center max-w-md">
                {/* Animated Icon */}
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    Oops! Something went wrong
                </h1>

                {/* Friendly description */}
                <p className="text-slate-500 mb-8">
                    Don't worry, it's not your fault. We're working on fixing this.
                    Please try again or go back to the homepage.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg min-h-[44px]"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors min-h-[44px]"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                {/* Back link */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors min-h-[44px]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back to previous page
                </button>
            </div>
        </div>
    );
}

