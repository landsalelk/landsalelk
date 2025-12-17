import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Page Not Found</h1>
                <p className="text-slate-500 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold hover:bg-[#059669] transition-colors shadow-lg shadow-[#10b981]/20"
                >
                    <Home className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
