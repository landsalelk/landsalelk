'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgentById } from '@/lib/agents';
import { User, Phone, Mail, MapPin, ShieldCheck, Loader2, Building, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AgentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAgent() {
            try {
                const data = await getAgentById(params.id);
                setAgent(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) fetchAgent();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <User className="w-16 h-16 text-slate-300 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Agent Not Found</h1>
                <p className="text-slate-500 mb-6">This agent profile doesn't exist or has been removed.</p>
                <Link href="/agents" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    Browse Agents
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link href="/agents" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Agents
                </Link>

                {/* Agent Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-white">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-32 h-32 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                {agent.photo ? (
                                    <img src={agent.photo} alt={agent.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <User className="w-16 h-16 text-white/80" />
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                                <p className="text-white/80 text-lg">{agent.specialization || 'Real Estate Agent'}</p>
                                {agent.is_verified && (
                                    <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                                        <ShieldCheck className="w-4 h-4" /> Verified Agent
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                {agent.email && (
                                    <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-slate-600 hover:text-emerald-600">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <span>{agent.email}</span>
                                    </a>
                                )}
                                {agent.phone && (
                                    <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-emerald-600">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <span>{agent.phone}</span>
                                    </a>
                                )}
                                {agent.location && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span>{agent.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">About</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {agent.bio || 'This agent has not added a bio yet. Contact them directly for more information about their services.'}
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            {agent.phone && (
                                <a
                                    href={`tel:${agent.phone}`}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call Agent
                                </a>
                            )}
                            {agent.email && (
                                <a
                                    href={`mailto:${agent.email}`}
                                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-5 h-5" />
                                    Send Email
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
