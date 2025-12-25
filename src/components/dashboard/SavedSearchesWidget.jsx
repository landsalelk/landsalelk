'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_SAVED_SEARCHES } from '@/appwrite/config';
import { Query } from 'appwrite';
import { Bell, MapPin, TrendingUp, Loader2 } from 'lucide-react';

export function SavedSearchesWidget({ userListings = [] }) {
    const [stats, setStats] = useState({ total: 0, matching: 0, topLocation: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get cities from user listings
                const myCities = [...new Set(userListings.map(l => l.city || l.location).filter(Boolean))];

                // Fetch recent saved searches
                const response = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_SAVED_SEARCHES,
                    [
                        Query.equal('is_active', true),
                        Query.orderDesc('$createdAt'),
                        Query.limit(100)
                    ]
                );

                const total = response.total;

                // Simple client-side matching for demo
                const matching = response.documents.filter(doc =>
                    myCities.some(city => doc.location.toLowerCase().includes(city.toLowerCase()))
                ).length;

                // Find top location in general
                const locationCounts = {};
                response.documents.forEach(doc => {
                    const loc = doc.location;
                    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
                });
                const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Colombo';

                setStats({ total, matching, topLocation });
            } catch (error) {
                console.error("Error loading saved searches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userListings]);

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-5 flex items-center justify-center min-h-[140px]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-colors" />

            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    High Demand
                </span>
            </div>

            <div className="relative z-10">
                <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-800">{stats.matching > 0 ? stats.matching : stats.total}</span>
                    <span className="text-sm text-slate-500 mb-1">
                        {stats.matching > 0 ? 'matches for your listings' : 'active alerts'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3 h-3" />
                    Most popular: <span className="font-bold text-slate-700">{stats.topLocation}</span>
                </div>
            </div>
        </div>
    );
}
