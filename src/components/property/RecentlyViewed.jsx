'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { BUCKET_LISTING_IMAGES, APPWRITE_ENDPOINT } from '@/appwrite/config';

// Helper to parse localized strings (JSON)
const parseLocalized = (val) => {
    if (!val) return '';
    if (typeof val === 'object') {
        return val.en || Object.values(val)[0] || '';
    }
    
    const str = String(val).trim();
    // If it's a simple string, return it
    if (!str.startsWith('{')) return val;

    try {
        const parsed = JSON.parse(str);
        // Prefer English, then any available value
        return parsed.en || Object.values(parsed)[0] || val;
    } catch (e) {
        // Fallback: try to extract content using regex if JSON parse fails
        try {
            // Match "en":"value" handling escaped quotes
            const enMatch = str.match(/"en"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (enMatch && enMatch[1]) {
                return enMatch[1].replace(/\\"/g, '"');
            }
            
            // Match any first key "key":"value"
            const anyMatch = str.match(/"[^"]+"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (anyMatch && anyMatch[1]) {
                return anyMatch[1].replace(/\\"/g, '"');
            }
        } catch (err) {
            // Ignore regex errors
        }
        return val;
    }
};

export function RecentlyViewed({ currentId }) {
    const [recent, setRecent] = useState([]);

    const endpoint = APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const resolveUrl = useMemo(() => (val) => {
        if (!val) return null;
        const str = String(val).trim();
        if (!str) return null;
        if (str.startsWith('http')) return str;
        return `${endpoint}/storage/buckets/${BUCKET_LISTING_IMAGES}/files/${str}/view?project=${projectId}`;
    }, [endpoint, projectId]);

    useEffect(() => {
        // Load from local storage
        try {
            const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            // Filter out current property to avoid duplicate if we are on the page
            const filtered = stored.filter(item => item.id !== currentId);
            // Resolve any legacy raw IDs to view URLs and clean up localized strings
            const normalized = filtered.map(item => ({
                ...item,
                title: parseLocalized(item.title),
                location: parseLocalized(item.location),
                image: resolveUrl(item.image) || '/placeholder.jpg'
            }));
            setRecent(normalized.slice(0, 4)); // Show max 4
        } catch (e) {
            console.error('Failed to load history');
        }
    }, [currentId, resolveUrl]);

    if (recent.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-slate-100 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" /> Recently Viewed
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recent.map((item) => (
                    <Link key={item.id} href={`/properties/${item.id}`} className="group block">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative aspect-[4/3]">
                                <Image
                                    src={item.image || '/placeholder.jpg'}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                    LKR {new Intl.NumberFormat('en-LK', { notation: 'compact' }).format(item.price)}
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-slate-800 text-sm truncate mb-1">{item.title}</h4>
                                <p className="text-xs text-slate-500 truncate">{item.location}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Helper to add to history
export const addToHistory = (property) => {
    if (!property || !property.$id) return;

    const endpoint = APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const resolveUrl = (val) => {
        if (!val) return null;
        const str = String(val).trim();
        if (!str) return null;
        if (str.startsWith('http')) return str;
        return `${endpoint}/storage/buckets/${BUCKET_LISTING_IMAGES}/files/${str}/view?project=${projectId}`;
    };

    try {
        const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        // Remove if exists (to move to top)
        const filtered = history.filter(h => h.id !== property.$id);

        // Add new
        const rawImages = property.images;
        let firstImage = null;
        if (Array.isArray(rawImages)) {
            firstImage = rawImages[0];
        } else if (typeof rawImages === 'string') {
            if (rawImages.trim().startsWith('[')) {
                try {
                    const parsed = JSON.parse(rawImages);
                    firstImage = Array.isArray(parsed) ? parsed[0] : parsed;
                } catch {
                    firstImage = rawImages.split(',').map(s => s.trim())[0];
                }
            } else {
                firstImage = rawImages;
            }
        }

        const newItem = {
            id: property.$id,
            title: parseLocalized(property.title),
            price: property.price,
            location: parseLocalized(property.location),
            image: resolveUrl(firstImage) || null
        };

        const updated = [newItem, ...filtered].slice(0, 10); // Keep last 10
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to save history');
    }
};
