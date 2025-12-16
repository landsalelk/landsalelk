import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-emerald-600 p-1.5 rounded-lg">
                                <MapPin className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-2xl text-white tracking-tight">
                                Landsale<span className="text-emerald-500">.lk</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Sri Lanka's most trusted real estate platform. We connect buyers, sellers, and agents with transparency and technology.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link href="#" className="hover:text-emerald-400 transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-emerald-400 transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-emerald-400 transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/properties?type=sale" className="text-sm hover:text-emerald-400 transition-colors">Buy Property</Link></li>
                            <li><Link href="/properties?type=rent" className="text-sm hover:text-emerald-400 transition-colors">Rent Property</Link></li>
                            <li><Link href="/properties?type=land" className="text-sm hover:text-emerald-400 transition-colors">Lands for Sale</Link></li>
                            <li><Link href="/agents" className="text-sm hover:text-emerald-400 transition-colors">Find an Agent</Link></li>
                            <li><Link href="/projects" className="text-sm hover:text-emerald-400 transition-colors">New Projects</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support & Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/help" className="text-sm hover:text-emerald-400 transition-colors">Help Center</Link></li>
                            <li><Link href="/legal/terms" className="text-sm hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/privacy" className="text-sm hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/fraud-alert" className="text-sm hover:text-emerald-400 transition-colors">Fraud Alert</Link></li>
                            <li><Link href="/guides" className="text-sm hover:text-emerald-400 transition-colors">Buying Guides</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm">No. 123, Galle Road,<br />Colombo 03, Sri Lanka</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-sm">+94 11 234 5678</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-sm">hello@landsale.lk</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Landsale.lk. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="text-slate-600 text-xs">Built with Next.js & Appwrite</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
