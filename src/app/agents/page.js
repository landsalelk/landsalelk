'use client';

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, ShieldCheck, Star, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AgentsPage() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchAgents() {
            try {
                const { getAgents } = await import('@/lib/agents');
                const data = await getAgents();
                setAgents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchAgents();
    }, []);

    const filteredAgents = agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d1fae5]/50 rounded-full blur-3xl -z-10" />

                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#ecfdf5] text-[#10b981] px-4 py-2 rounded-full text-sm font-bold mb-4">
                            <ShieldCheck className="w-4 h-4" /> Verified Professionals
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Top Agents</h1>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
                            Friendly experts ready to help you find your dream property across Sri Lanka.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="max-w-md mx-auto mt-8">
                        <div className="search-input-wrapper">
                            <Search className="text-slate-400 w-5 h-5 mr-2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or location..."
                                className="w-full py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Agents Grid */}
                {filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAgents.map((agent, idx) => (
                            <div
                                key={agent.$id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <Link href={`/agents/${agent.$id}`}>
                                    <div className="agent-card group">
                                        {/* Avatar */}
                                        <div className="agent-avatar">
                                            <div className="agent-avatar-inner">
                                                {agent.photo ? (
                                                    <Image
                                                        src={agent.photo}
                                                        alt={agent.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
                                                        <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
                                                        <path d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z" fill="#3B82F6" />
                                                        <circle cx="50" cy="38" r="15" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
                                                        <path d="M35 38C35 23 40 13 50 13C60 13 65 23 65 38" fill="#4B5563" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                            {agent.name || 'Agent'}
                                        </h3>
                                        <p className="text-[#10b981] font-bold text-sm uppercase tracking-wide mb-2">
                                            {agent.specialization || 'Real Estate Agent'}
                                        </p>

                                        {agent.location && (
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-sm mb-4">
                                                <MapPin className="w-4 h-4" />
                                                <span>{agent.location}</span>
                                            </div>
                                        )}

                                        {/* Rating */}
                                        <div className="flex items-center justify-center gap-1 mb-6">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                            <span className="text-slate-500 text-sm ml-1">(4.8)</span>
                                        </div>

                                        {/* Badge */}
                                        {agent.is_verified && (
                                            <div className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold mb-6">
                                                <ShieldCheck className="w-3 h-3" /> Verified Agent
                                            </div>
                                        )}

                                        {/* Contact Button */}
                                        <button className="w-full btn-secondary flex items-center justify-center gap-2">
                                            <Phone className="w-4 h-4" /> Contact Agent
                                        </button>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto">
                        <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No agents found</h3>
                        <p className="text-slate-500 font-medium">Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
