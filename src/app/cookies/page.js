import { Cookie, Shield, Settings, Eye, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Cookie Policy | LandSale.lk',
    description: 'Learn about how LandSale.lk uses cookies and similar technologies.',
};

export default function CookiePolicy() {
    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Cookie className="w-8 h-8 text-amber-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
                    <p className="text-slate-600">Last updated: December 2024</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-slate-100 space-y-8">

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Eye className="w-6 h-6 text-emerald-600" />
                            What Are Cookies?
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Cookies are small text files that are placed on your device when you visit our website.
                            They help us provide you with a better experience by remembering your preferences,
                            analyzing how you use our site, and enabling certain features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-emerald-600" />
                            Types of Cookies We Use
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-bold text-slate-800 mb-2">Essential Cookies</h3>
                                <p className="text-slate-600 text-sm">
                                    Required for the website to function. They enable basic functions like page navigation
                                    and access to secure areas. The website cannot function properly without these cookies.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-bold text-slate-800 mb-2">Analytics Cookies</h3>
                                <p className="text-slate-600 text-sm">
                                    Help us understand how visitors interact with our website by collecting and reporting
                                    information anonymously. This helps us improve our website.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-bold text-slate-800 mb-2">Functional Cookies</h3>
                                <p className="text-slate-600 text-sm">
                                    Enable enhanced functionality and personalization, such as remembering your
                                    language preference or the region you are in.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-bold text-slate-800 mb-2">Marketing Cookies</h3>
                                <p className="text-slate-600 text-sm">
                                    Used to track visitors across websites to display relevant advertisements.
                                    These are only set with your consent.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-emerald-600" />
                            Managing Your Cookie Preferences
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            You can control and manage cookies in various ways:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>Using our cookie consent banner when you first visit</li>
                            <li>Adjusting your browser settings to refuse cookies</li>
                            <li>Deleting cookies from your browser</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">
                            Note: Blocking certain cookies may impact your experience on our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-emerald-600" />
                            Third-Party Cookies
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            We may use third-party services that set their own cookies, including:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 mt-4">
                            <li><strong>Appwrite</strong> - Authentication and database services</li>
                            <li><strong>PayHere</strong> - Payment processing</li>
                            <li><strong>Google Analytics</strong> - Website analytics (if enabled)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Mail className="w-6 h-6 text-emerald-600" />
                            Contact Us
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            If you have any questions about our Cookie Policy, please contact us at:
                        </p>
                        <p className="text-emerald-600 font-semibold mt-2">support@landsale.lk</p>
                    </section>

                    {/* Related Links */}
                    <div className="pt-8 border-t border-slate-200">
                        <p className="text-slate-500 text-sm mb-4">Related Policies:</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-emerald-600 hover:underline font-medium">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
