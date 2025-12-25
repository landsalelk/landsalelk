'use client';

import Link from 'next/link';
import { Check, Sparkles, Building, Zap, Crown, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        description: 'For individuals getting started',
        price: 'LKR 0',
        period: 'forever',
        features: [
            'Post up to 3 listings',
            'Basic property analytics',
            'Email support',
            'Standard listing visibility',
        ],
        cta: 'Get Started',
        href: '/auth/register',
        popular: false,
        icon: Building,
    },
    {
        name: 'Pro',
        description: 'For active sellers & agents',
        price: 'LKR 2,500',
        period: '/month',
        features: [
            'Unlimited listings',
            'Featured badge on listings',
            'Priority in search results',
            'Advanced analytics dashboard',
            'WhatsApp lead notifications',
            'Priority email support',
        ],
        cta: 'Upgrade to Pro',
        href: '/profile?tab=premium',
        popular: true,
        icon: Zap,
    },
    {
        name: 'Agency',
        description: 'For real estate agencies',
        price: 'LKR 15,000',
        period: '/month',
        features: [
            'Everything in Pro',
            'Agency branding on listings',
            'Team member accounts (up to 10)',
            'Verified Agency badge',
            'Custom agency page',
            'Dedicated account manager',
            'API access',
        ],
        cta: 'Contact Sales',
        href: '/agency/apply',
        popular: false,
        icon: Crown,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4" />
                        Simple Pricing
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                        Choose the Right Plan for You
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Whether you're an individual seller or a large agency, we have a plan that fits your needs. No hidden fees.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl p-8 ${plan.popular
                                ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10'
                                : 'bg-white border border-slate-200 shadow-sm'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-white/10' : 'bg-slate-100'
                                }`}>
                                <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-emerald-400' : 'text-slate-600'}`} />
                            </div>

                            <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-sm mb-6 ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                                {plan.description}
                            </p>

                            <div className="mb-6">
                                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-sm ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-emerald-600'
                                            }`} />
                                        <span className={`text-sm ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${plan.popular
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {plan.cta}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ Link */}
                <div className="text-center mt-16">
                    <p className="text-slate-600">
                        Have questions?{' '}
                        <Link href="/faq" className="text-emerald-600 font-semibold hover:underline">
                            Check our FAQ
                        </Link>
                        {' '}or{' '}
                        <a href="mailto:support@landsale.lk" className="text-emerald-600 font-semibold hover:underline">
                            contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
