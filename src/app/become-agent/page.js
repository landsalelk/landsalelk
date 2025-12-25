'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Shield, Award, TrendingUp, Users, MapPin, Phone,
    CheckCircle, ArrowRight, Star, Briefcase, BadgeCheck,
    Calendar, CreditCard, UserPlus, FileCheck, Zap
} from 'lucide-react';

export default function BecomeAgentPage() {
    const benefits = [
        {
            icon: TrendingUp,
            title: 'Boost Your Income',
            description: 'Earn commissions on every property deal you close. Top agents earn LKR 500K+ monthly.'
        },
        {
            icon: Users,
            title: 'Exclusive Leads',
            description: 'Get access to qualified buyer leads in your area. No more cold calling.'
        },
        {
            icon: Shield,
            title: 'Verified Badge',
            description: 'Stand out with our verified agent badge. Build trust with clients instantly.'
        },
        {
            icon: Award,
            title: 'Free Training',
            description: 'Access our comprehensive training program on real estate laws and best practices.'
        },
        {
            icon: MapPin,
            title: 'Territory Rights',
            description: 'Get priority listing access in your chosen service areas.'
        },
        {
            icon: CreditCard,
            title: 'Fast Payouts',
            description: 'Receive commissions directly to your wallet. Withdraw anytime.'
        }
    ];

    const howItWorks = [
        {
            step: 1,
            icon: UserPlus,
            title: 'Register',
            description: 'Fill out the application form with your details and upload NIC.'
        },
        {
            step: 2,
            icon: FileCheck,
            title: 'Verification',
            description: 'Our team reviews your application within 24-48 hours.'
        },
        {
            step: 3,
            icon: Award,
            title: 'Get Certified',
            description: 'Complete optional training to become a certified agent.'
        },
        {
            step: 4,
            icon: Zap,
            title: 'Start Earning',
            description: 'Receive leads, close deals, and earn commissions.'
        }
    ];

    const testimonials = [
        {
            name: 'Kamal Perera',
            role: 'Colombo Agent',
            avatar: 'KP',
            text: 'I joined 6 months ago and have already closed 15 deals. The leads are genuine!',
            rating: 5
        },
        {
            name: 'Nimal Fernando',
            role: 'Kandy Agent',
            avatar: 'NF',
            text: 'Best decision I made. The training helped me understand the legal aspects better.',
            rating: 5
        },
        {
            name: 'Saman Silva',
            role: 'Galle Agent',
            avatar: 'SS',
            text: 'The verified badge gives buyers confidence. My closing rate doubled!',
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                            <BadgeCheck className="w-4 h-4" />
                            Join 500+ Verified Agents
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                            Become a Verified<br />Property Agent
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
                            Join Sri Lanka&apos;s fastest-growing real estate platform.
                            Get exclusive leads, earn more commissions, and grow your career.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auth/register/agent"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg text-lg"
                            >
                                Apply Now - It&apos;s Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition-colors"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold text-emerald-600">500+</p>
                            <p className="text-gray-600">Active Agents</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-emerald-600">10K+</p>
                            <p className="text-gray-600">Deals Closed</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-emerald-600">95%</p>
                            <p className="text-gray-600">Satisfaction</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-emerald-600">24hrs</p>
                            <p className="text-gray-600">Avg. Approval</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Why Become an Agent?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join our network and unlock exclusive benefits designed to help you succeed.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                    <benefit.icon className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Four simple steps to start your agent journey
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-8">
                            {howItWorks.map((step, index) => (
                                <div key={index} className="text-center relative">
                                    {index < howItWorks.length - 1 && (
                                        <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-emerald-200" />
                                    )}
                                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            What Our Agents Say
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 italic">&ldquo;{testimonial.text}&rdquo;</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Join hundreds of successful agents already earning with LandSale.lk
                    </p>
                    <Link
                        href="/auth/register/agent"
                        className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg text-lg"
                    >
                        Become an Agent Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-4 text-emerald-200 text-sm">
                        Free registration • No hidden fees • Start earning today
                    </p>
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-600">
                        Have questions? Check out our{' '}
                        <Link href="/faq" className="text-emerald-600 font-medium hover:underline">
                            FAQ page
                        </Link>{' '}
                        or{' '}
                        <a href="mailto:agents@landsale.lk" className="text-emerald-600 font-medium hover:underline">
                            contact us
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
