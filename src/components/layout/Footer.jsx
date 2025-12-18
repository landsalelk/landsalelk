'use client';

import Link from 'next/link';
import { MapPin, Heart, Send, ShieldCheck, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative bg-white/80 backdrop-blur-lg border-t border-slate-100 pt-16 pb-24 md:pb-12 mt-20 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
                                <MapPin className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-slate-800 tracking-tight">
                                LandSale<span className="text-primary-500">.lk</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                            Sri Lanka's most trusted real estate marketplace. Powered by AI, verified by agents.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {[
                                { Icon: Facebook, url: 'https://facebook.com/landsalelk' },
                                { Icon: Twitter, url: 'https://twitter.com/landsalelk' },
                                { Icon: Instagram, url: 'https://instagram.com/landsalelk' },
                                { Icon: Youtube, url: 'https://youtube.com/@landsalelk' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-primary-500 hover:text-white text-slate-500 flex items-center justify-center transition-colors"
                                >
                                    <social.Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-5 text-lg">Explore</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/guides" className="text-slate-500 hover:text-primary-500 transition-colors">Neighborhood Guides</Link></li>
                            <li><Link href="/properties?type=land" className="text-slate-500 hover:text-primary-500 transition-colors">Lands for Sale</Link></li>
                            <li><Link href="/properties?type=sale" className="text-slate-500 hover:text-primary-500 transition-colors">Houses for Sale</Link></li>
                            <li><Link href="/properties?type=rent" className="text-slate-500 hover:text-primary-500 transition-colors">Properties for Rent</Link></li>
                            <li><Link href="/agents" className="text-slate-500 hover:text-primary-500 transition-colors">Find Agents</Link></li>
                            <li><Link href="/tools/mortgage-calculator" className="text-slate-500 hover:text-primary-500 transition-colors">Mortgage Calculator</Link></li>
                            <li><Link href="/properties/create" className="text-slate-500 hover:text-primary-500 transition-colors">Post Property</Link></li>
                        </ul>
                    </div>

                    {/* Trust & Legal */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-5 text-lg">Trust & Legal</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li>
                                <Link href="/legal" className="text-slate-500 hover:text-primary-500 transition-colors flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary-400" /> Legal Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/kyc" className="text-slate-500 hover:text-primary-500 transition-colors flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary-400" /> Verify Identity
                                </Link>
                            </li>
                            <li><Link href="/privacy" className="text-slate-500 hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-slate-500 hover:text-primary-500 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/admin" className="text-slate-500 hover:text-primary-500 transition-colors">Admin Portal</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-5 text-lg">Stay Updated</h4>
                        <p className="text-slate-500 text-sm mb-4 font-medium">
                            Get the latest listings and market insights.
                        </p>
                        <form className="flex gap-2" onSubmit={(e) => {
                            e.preventDefault();
                            const email = e.target.email.value;
                            if (email) {
                                import('sonner').then(({ toast }) => {
                                    toast.success("Subscribed! You'll get updates.");
                                });
                                e.target.reset();
                            }
                        }}>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Enter your email..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white transition-all font-medium"
                            />
                            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-bold p-3 rounded-xl shadow-lg transition-all">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Contact */}
                        <div className="mt-6 space-y-2 text-sm">
                            <a href="tel:+94112345678" className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-medium">
                                <Phone className="w-4 h-4" /> +94 11 234 5678
                            </a>
                            <a href="mailto:hello@landsale.lk" className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-medium">
                                <Mail className="w-4 h-4" /> hello@landsale.lk
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-400 font-bold text-center md:text-left">
                        &copy; 2025 LandSale.lk. Made with ❤️ in Sri Lanka
                    </p>
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-primary-400" />
                            100% Verified Listings
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-400" />
                            10,000+ Happy Users
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
