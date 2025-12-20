'use client';

import { useState, useEffect } from 'react';
import { getAgents } from '@/lib/agents';
import { ShieldCheck, FileText, Scale, CheckCircle, Search, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LegalServicesPage() {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLawyers() {
            try {
                // Try to fetch agents with Legal/Notary specialization
                const agents = await getAgents(8);
                setLawyers(agents);
            } catch (e) {
                console.error("Failed to load lawyers", e);
            } finally {
                setLoading(false);
            }
        }
        fetchLawyers();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            {/* Hero */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-4">
                    <ShieldCheck className="w-4 h-4" /> Secure Your Investment
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Legal & Trust Center</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Verify deeds, access title reports, and connect with trusted notaries to ensure a safe transaction.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Service Cards */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Title Extraction</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Get a certified copy of the Folio (Paththiru) from the Land Registry to verify ownership history.
                    </p>
                    <button className="text-blue-600 font-bold text-sm hover:underline">Request Search &rarr;</button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                        <Scale className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Deed Verification</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Have a verified lawyer review the deed (Sinnakkara, Bim Saviya) for any encumbrances or caveats.
                    </p>
                    <button className="text-emerald-600 font-bold text-sm hover:underline">Find a Lawyer &rarr;</button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Drafting Agreements</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Standardized Sales & Purchase Agreements (SPA) drafted by legal professionals.
                    </p>
                    <button className="text-purple-600 font-bold text-sm hover:underline">View Templates &rarr;</button>
                </div>
            </div>

            {/* Trusted Lawyers Section */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Verified Panel Lawyers & Agents</h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : lawyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {lawyers.map((agent) => (
                            <div key={agent.$id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 flex items-center justify-center text-slate-500">
                                    {agent.photo ? (
                                        <Image src={agent.photo} alt={agent.name} width={80} height={80} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <User className="w-10 h-10" />
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg">{agent.name || 'Agent'}</h4>
                                <p className="text-slate-500 text-sm mb-2">{agent.specialization || 'Real Estate Agent'}</p>
                                {agent.is_verified && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-4">
                                        <CheckCircle className="w-3 h-3" /> Verified
                                    </div>
                                )}
                                <Link
                                    href={`/agents/${agent.$id}`}
                                    className="w-full py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    Contact
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <p>No agents available at the moment. Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
