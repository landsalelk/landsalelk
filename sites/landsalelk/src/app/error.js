'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong!</h1>
                <p className="text-slate-500 mb-8">
                    We encountered an unexpected error. Please try again.
                </p>
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg"
                >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                </button>
            </div>
        </div>
    );
}
