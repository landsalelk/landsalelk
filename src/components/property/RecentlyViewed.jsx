'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';

export function RecentlyViewed({ currentId }) {
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        // Load from local storage
        try {
            const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            // Filter out current property to avoid duplicate if we are on the page
            const filtered = stored.filter(item => item.id !== currentId);
            setRecent(filtered.slice(0, 4)); // Show max 4
        } catch (e) {
            console.error('Failed to load history');
        }
    }, [currentId]);

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

    try {
        const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        // Remove if exists (to move to top)
        const filtered = history.filter(h => h.id !== property.$id);

        // Add new
        const newItem = {
            id: property.$id,
            title: property.title,
            price: property.price,
            location: property.location,
            image: property.images && property.images.length > 0 ? property.images[0] : null // Simplified image logic
        };

        const updated = [newItem, ...filtered].slice(0, 10); // Keep last 10
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to save history');
    }
};
