'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_AGENT_LEADS } from '@/appwrite/config';
import { Query } from 'appwrite';
import { Users, ArrowUpRight, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LeadStatsWidget({ userId, agentId }) {
    const [stats, setStats] = useState({ newLeads: 0, totalLeads: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchStats = async () => {
            try {
                // Query for New Leads
                const newLeadsPromise = databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENT_LEADS,
                    [
                        Query.equal('agent_user_id', userId),
                        Query.equal('status', 'new'),
                        Query.limit(0) // Just count
                    ]
                );

                // Query for Total Leads
                const totalLeadsPromise = databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENT_LEADS,
                    [
                        Query.equal('agent_user_id', userId),
                        Query.limit(0)
                    ]
                );

                const [newRes, totalRes] = await Promise.all([newLeadsPromise, totalLeadsPromise]);

                setStats({
                    newLeads: newRes.total,
                    totalLeads: totalRes.total
                });
            } catch (error) {
                console.error("Error loading lead stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId, agentId]);

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-5 flex items-center justify-center min-h-[140px]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-full hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                </div>
                {stats.newLeads > 0 && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                        +{stats.newLeads} New
                    </span>
                )}
            </div>

            <div className="relative z-10 mb-2">
                <div className="text-3xl font-bold text-slate-800">{stats.totalLeads}</div>
                <div className="text-sm text-slate-500">Total Leads</div>
            </div>

            <Link
                href="/dashboard/leads"
                className="relative z-10 flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:gap-2 transition-all mt-auto"
            >
                Open CRM <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
