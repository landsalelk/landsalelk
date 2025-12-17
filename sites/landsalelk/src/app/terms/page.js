'use client';

import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <main className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#10b981] mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            Welcome to LandSale.lk. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service.
                        </p>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600">
                            By using our services, you confirm that you are at least 18 years old and legally capable of entering into binding contracts.
                        </p>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. User Accounts</h2>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree to provide accurate, current, and complete information during registration.</li>
                            <li>We reserve the right to suspend or terminate accounts that violate our policies.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Listing Properties</h2>
                        <p className="text-slate-600 mb-4">When you list a property on LandSale.lk, you agree that:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>You have the legal right to sell or lease the property.</li>
                            <li>All information and photos provided are accurate and truthful.</li>
                            <li>You will not upload illegal, offensive, or infringing content.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Limitation of Liability</h2>
                        <p className="text-slate-600">
                            LandSale.lk is a platform for connecting buyers and sellers. We do not own, inspect, or warrant any properties listed. We are not liable for any disputes or losses arising from transactions initiated on our site.
                        </p>

                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Governing Law</h2>
                        <p className="text-slate-600">
                            These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka.
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
