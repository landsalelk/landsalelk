'use client';

import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <main className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#10b981] mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            At LandSale.lk, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our real estate platform.
                        </p>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li><strong>Account Information:</strong> Name, email address, and phone number when you register.</li>
                            <li><strong>Property Data:</strong> Details about properties you list, including photos and documents.</li>
                            <li><strong>Usage Data:</strong> Information about how you interact with our platform (search history, favorites).</li>
                        </ul>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Data</h2>
                        <p className="text-slate-600 mb-4">We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Connect buyers with sellers and agents.</li>
                            <li>Verify property ownership and user identity (KYC).</li>
                            <li>Improve our platform's AI-driven recommendations.</li>
                            <li>Send essential notifications about your listings or inquiries.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Data Protection</h2>
                        <p className="text-slate-600 mb-4">
                            We implement industry-standard security measures, including encryption and strict access controls, to safeguard your data. Your sensitive documents (KYC) are stored in restricted buckets.
                        </p>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Contact Us</h2>
                        <p className="text-slate-600">
                            If you have questions about this policy, please contact us at <a href="mailto:privacy@landsale.lk" className="text-[#10b981] font-bold">privacy@landsale.lk</a>.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-400">
                        Last updated: December 2025
                    </div>
                </div>
            </main>
        </div>
    );
}
