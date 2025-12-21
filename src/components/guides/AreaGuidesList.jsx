'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_AREAS } from '@/appwrite/config';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function AreaGuidesList() {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false); // Can't fetch if empty, so set to false for Mock mode if needed, but let's try fetch

    // Mock data for initial visual impression since DB might be empty
    const mockAreas = [
        { $id: 'colombo-7', name: 'Cinnamon Gardens (Colombo 7)', image: 'https://images.unsplash.com/photo-1590487372986-e91008d5162a?q=80&w=1000' },
        { $id: 'colombo-3', name: 'Kollupitiya (Colombo 3)', image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?q=80&w=1000' },
        { $id: 'kandy', name: 'Kandy City', image: 'https://images.unsplash.com/photo-1628678257009-40da820e290f?q=80&w=1000' },
        { $id: 'galle', name: 'Galle Fort', image: 'https://images.unsplash.com/photo-1552554763-8888b20d3197?q=80&w=1000' },
        { $id: 'negombo', name: 'Negombo', image: 'https://images.unsplash.com/photo-1548680650-619f56477e6e?q=80&w=1000' },
        { $id: 'nuwara-eliya', name: 'Nuwara Eliya', image: 'https://images.unsplash.com/photo-1588665796213-979aec476100?q=80&w=1000' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {mockAreas.map((area) => (
                <Link key={area.$id} href={`/guides/${area.$id}`} className="group block h-full">
                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
                        <Image
                            src={area.image}
                            alt={area.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                {area.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                                <span>Explore Neighborhood</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
