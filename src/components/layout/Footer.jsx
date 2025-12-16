import Link from 'next/link';
import { Home, Search, ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                        <Home className="w-6 h-6 text-emerald-500" />
                        Landsale<span className="text-emerald-500">.lk</span>
                    </Link>
                    <p className="text-sm max-w-xs leading-relaxed">
                        Sri Lanka's trusted real estate marketplace. We connect buyers, sellers, and verified agents with transparency and ease.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/properties" className="hover:text-emerald-400 transition-colors">Properties</Link></li>
                        <li><Link href="/agents" className="hover:text-emerald-400 transition-colors">Find Agents</Link></li>
                        <li><Link href="/profile" className="hover:text-emerald-400 transition-colors">Post Ad</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Legal & Trust</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/kyc" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Verify Identity</Link></li>
                        <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
                &copy; {new Date().getFullYear()} Landsale.lk. All rights reserved. Built with Next.js & Appwrite.
            </div>
        </footer>
    );
}
