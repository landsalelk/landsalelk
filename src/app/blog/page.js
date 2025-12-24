'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, getFeaturedPosts } from '@/lib/content';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const POSTS_PER_PAGE = 9;

    const loadPosts = useCallback(async () => {
        setLoading(true);
        const result = await getBlogPosts(POSTS_PER_PAGE, page * POSTS_PER_PAGE);
        setPosts(result.posts);
        setTotal(result.total);
        setLoading(false);
    }, [page]);

    const loadFeatured = useCallback(async () => {
        const result = await getFeaturedPosts(3);
        setFeatured(result);
    }, []);

    useEffect(() => {
        loadPosts();
        loadFeatured();
    }, [loadPosts, loadFeatured]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredPosts = posts.filter(post =>
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
                    <p className="text-xl text-emerald-100 max-w-2xl">
                        Real estate insights, market trends, and expert advice for buying, selling, and investing in Sri Lankan property.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Featured Posts */}
                {featured.length > 0 && !searchQuery && page === 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featured.map(post => (
                                <Link
                                    href={`/blog/${post.slug}`}
                                    key={post.$id}
                                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                                >
                                    <div className="aspect-video relative bg-gray-100">
                                        {post.cover_image ? (
                                            <Image
                                                src={post.cover_image}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                                            Featured
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {formatDate(post.$createdAt)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Posts */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">
                        {searchQuery ? 'Search Results' : 'All Articles'}
                    </h2>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-xl overflow-hidden shadow animate-pulse">
                                    <div className="aspect-video bg-gray-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-3 gap-6">
                                {filteredPosts.map(post => (
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        key={post.$id}
                                        className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                                    >
                                        <div className="aspect-video relative bg-gray-100">
                                            {post.cover_image ? (
                                                <Image
                                                    src={post.cover_image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(post.$createdAt)}
                                                </span>
                                                <span className="flex items-center text-emerald-600 font-medium">
                                                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > POSTS_PER_PAGE && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2">
                                        Page {page + 1} of {Math.ceil(total / POSTS_PER_PAGE)}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={(page + 1) * POSTS_PER_PAGE >= total}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <p className="text-gray-500">
                                {searchQuery ? 'No articles found matching your search.' : 'No blog posts available yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
