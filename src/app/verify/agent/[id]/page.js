'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_AGENTS } from '@/appwrite/config';
import {
    Loader2, CheckCircle, XCircle, Shield, Calendar, MapPin,
    Award, ExternalLink, Clock, AlertTriangle
} from 'lucide-react';

export default function VerifyAgentPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [agent, setAgent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function verify() {
            if (!id) return;

            try {
                const agentDoc = await databases.getDocument(DB_ID, COLLECTION_AGENTS, id);
                setAgent(agentDoc);
            } catch (e) {
                console.error(e);
                setError('Agent not found');
            } finally {
                setLoading(false);
            }
        }
        verify();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-600">Verifying agent credentials...</p>
                </div>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
                    <p className="text-slate-500 mb-6">This agent ID is not registered in our system.</p>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-left mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-700 text-sm">Warning</h4>
                                <p className="text-amber-600 text-sm">
                                    If someone claimed to be a LandSale.lk agent and provided this QR code, they may be impersonating our agents.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Go to LandSale.lk
                    </Link>
                </div>
            </div>
        );
    }

    const isVerified = agent.verification_status === 'verified' || agent.training_completed;
    const isKYCVerified = agent.kyc_verified || agent.verification_status === 'verified';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isVerified
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                            : 'bg-gradient-to-br from-amber-400 to-orange-500'
                        }`}>
                        {isVerified ? (
                            <CheckCircle className="w-10 h-10 text-white" />
                        ) : (
                            <Clock className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {isVerified ? 'Verified Agent' : 'Pending Verification'}
                    </h1>
                    <p className="text-slate-500">
                        {isVerified
                            ? 'This agent is certified by LandSale.lk'
                            : 'This agent is registered but not yet fully verified'}
                    </p>
                </div>

                {/* Agent Info */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {agent.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{agent.name}</h2>
                            {agent.specialization && (
                                <p className="text-slate-500">{agent.specialization}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        {agent.location && (
                            <div className="flex items-center gap-3 text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{agent.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Member since {new Date(agent.$createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Verification Details */}
                <div className="space-y-3 mb-6">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Verification Status</h3>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-600">Identity (KYC)</span>
                        </div>
                        {isKYCVerified ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <CheckCircle className="w-4 h-4" /> Verified
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                <Clock className="w-4 h-4" /> Pending
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-600">Training</span>
                        </div>
                        {agent.training_completed ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <CheckCircle className="w-4 h-4" /> Completed
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                <Clock className="w-4 h-4" /> In Progress
                            </span>
                        )}
                    </div>

                    {agent.certified_at && (
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <span className="text-emerald-700 font-medium">Certified</span>
                            <span className="text-emerald-600">
                                {new Date(agent.certified_at).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Agent ID */}
                <div className="text-center mb-6 p-3 bg-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Agent ID</p>
                    <p className="font-mono text-slate-700">{agent.$id}</p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href={`/agents/${agent.$id}`}
                        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                        View Full Profile <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/"
                        className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center"
                    >
                        Go to LandSale.lk
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    Verified by LandSale.lk on {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
