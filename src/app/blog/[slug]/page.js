'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/content';
import { Calendar, Clock, ArrowLeft, Facebook, Twitter } from 'lucide-react';

export default function BlogPostPage({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPost = useCallback(async () => {
        setLoading(true);
        const result = await getBlogPostBySlug(slug);
        if (!result) {
            router.push('/blog');
            return;
        }
        setPost(result);

        // Load related posts
        const related = await getBlogPosts(3);
        setRelatedPosts(related.posts.filter(p => p.$id !== result.$id).slice(0, 2));
        setLoading(false);
    }, [slug, router]);

    useEffect(() => {
        loadPost();
    }, [loadPost]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="aspect-video bg-gray-200 rounded-xl" />
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

    if (!post) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>
                </div>
            </div>

            {/* Article */}
            <article className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Title & Meta */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(post.$createdAt)}
                        </span>
                        {post.read_time && (
                            <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {post.read_time} min read
                            </span>
                        )}
                        {post.category && (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                {post.category}
                            </span>
                        )}
                    </div>
                </header>

                {/* Cover Image */}
                {post.cover_image && (
                    <div className="aspect-video relative mb-8 rounded-xl overflow-hidden">
                        <Image
                            src={post.featured_image || post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none prose-emerald prose-headings:font-bold prose-a:text-emerald-600"
                    dangerouslySetInnerHTML={{ __html: post.content || post.body || '' }}
                />

                {/* Share */}
                <div className="mt-12 pt-8 border-t">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium">Share this article:</span>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                        >
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
                        >
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="mt-12 pt-8 border-t">
                        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {relatedPosts.map(related => (
                                <Link
                                    href={`/blog/${related.slug}`}
                                    key={related.$id}
                                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="aspect-video relative bg-gray-100">
                                        {related.cover_image ? (
                                            <Image
                                                src={related.cover_image}
                                                alt={related.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold group-hover:text-emerald-600 transition-colors line-clamp-2">
                                            {related.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {formatDate(related.$createdAt)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
