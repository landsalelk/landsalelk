'use client';

import { useState, useEffect } from 'react';
import { getFaqs } from '@/lib/content';
import { sanitizeHTML } from '@/lib/sanitize';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState({});

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = async () => {
        const result = await getFaqs();
        setFaqs(result);
        setLoading(false);
    };

    const toggleItem = (id) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group FAQs by category
    const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(faq);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                        Find answers to common questions about buying, selling, and renting property in Sri Lanka.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Search */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                        />
                    </div>
                </div>

                {/* FAQ Accordion */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : Object.keys(groupedFaqs).length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                            <div key={category}>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-2 h-6 bg-emerald-500 rounded mr-3" />
                                    {category}
                                </h2>
                                <div className="space-y-3">
                                    {categoryFaqs.map(faq => (
                                        <div
                                            key={faq.$id}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleItem(faq.$id)}
                                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-800 pr-4">
                                                    {faq.question}
                                                </span>
                                                <ChevronDown
                                                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openItems[faq.$id] ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>
                                            {openItems[faq.$id] && (
                                                <div className="px-6 pb-4 text-gray-600 border-t">
                                                    <div
                                                        className="pt-4 prose prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(faq.answer) }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchQuery
                                ? 'No FAQs found matching your search.'
                                : 'No FAQs available yet.'}
                        </p>
                    </div>
                )}

                {/* Contact Section */}
                <div className="mt-12 bg-white rounded-xl p-8 text-center shadow-sm">
                    <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-4">
                        Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                    </p>
                    <a
                        href="mailto:support@landsale.lk"
                        className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
