'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCmsPage } from '@/lib/content';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CmsPage({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

<<<<<<< HEAD
    const loadPage = useCallback(async () => {
        setLoading(true);
        const result = await getCmsPage(slug);
        if (!result) {
            router.push('/');
            return;
        }
        setPage(result);
        setLoading(false);
    }, [slug, router]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);
=======
    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            const result = await getCmsPage(slug);
            if (!result) {
                router.push('/');
                return;
            }
            setPage(result);
            setLoading(false);
        };
        loadPage();
    }, [slug, router]);
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 bg-gray-200 rounded w-1/2" />
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!page) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link
                        href="/"
                        className="inline-flex items-center text-emerald-100 hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold">
                        {page.title}
                    </h1>
                    {page.subtitle && (
                        <p className="text-lg text-emerald-100 mt-2">
                            {page.subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div
                        className="prose prose-lg max-w-none prose-emerald prose-headings:font-bold"
                        dangerouslySetInnerHTML={{ __html: page.content || page.body || '' }}
                    />
                </div>

                {/* Last Updated */}
                {page.$updatedAt && (
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Last updated: {new Date(page.$updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}
