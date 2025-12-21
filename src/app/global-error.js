'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { logErrorToGitHub } from '@/app/actions/logger';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to GitHub when it occurs
        if (error) {
            const errorMessage = error.message || 'Unknown Error';
            const errorStack = error.stack || 'No stack trace available';

            logErrorToGitHub(
                `Global Error: ${errorMessage}`,
                `### Error Details\n${errorMessage}\n\n### Stack Trace\n\`\`\`\n${errorStack}\n\`\`\``,
                ['bug', 'production', 'global-error']
            ).catch(err => console.error('Failed to report error to GitHub', err));
        }
    }, [error]);

    return (
        <html>
            <body className="bg-slate-50">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Something went wrong!</h1>
                        <p className="text-slate-500 mb-8">
                            We encountered an unexpected error. Our team has been notified.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => reset()}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
