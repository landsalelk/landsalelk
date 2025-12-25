import Link from 'next/link';
import { Home, AlertCircle, Search, MapPin, ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Page Not Found | LandSale.lk',
    description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4">
            <div className="text-center max-w-lg">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="w-40 h-40 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                        <span className="text-7xl font-bold text-emerald-600">404</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center animate-bounce">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                    Oops! Page Not Found
                </h1>
                <p className="text-slate-500 mb-8 text-lg">
                    The page you're looking for doesn't exist or may have been moved.
                    Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <Search className="w-5 h-5" />
                        Browse Properties
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Popular Pages</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link href="/agents" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                            Find Agents
                        </Link>
                        <Link href="/guides" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                            Area Guides
                        </Link>
                        <Link href="/faq" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                            FAQ
                        </Link>
                        <Link href="/legal" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                            Legal Services
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
