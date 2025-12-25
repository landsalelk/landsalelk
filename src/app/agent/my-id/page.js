'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases } from '@/appwrite';
import { DB_ID, COLLECTION_AGENTS } from '@/appwrite/config';
import { Query } from 'appwrite';
import { DigitalAgentID } from '@/components/agent/DigitalAgentID';
import { getTrainingProgress, TRAINING_MODULES, BADGES } from '@/lib/agent_training';
import {
    Loader2, Shield, CheckCircle, Clock, AlertCircle, Award,
    BookOpen, ArrowRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function MyAgentIDPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [agent, setAgent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                const currentUser = await account.get();
                setUser(currentUser);

                // Find agent profile
                const agentsResult = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENTS,
                    [Query.equal('user_id', currentUser.$id)]
                );

                if (agentsResult.documents.length > 0) {
                    setAgent(agentsResult.documents[0]);
                } else {
                    setError('no_agent');
                }
            } catch (e) {
                console.error(e);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error === 'no_agent') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Agent Profile Required</h1>
                    <p className="text-slate-500 mb-6">
                        You need to register as an agent to get your Digital ID card.
                    </p>
                    <Link
                        href="/agent/register"
                        className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                    >
                        Register as Agent
                    </Link>
                </div>
            </div>
        );
    }

    const progress = getTrainingProgress();
    const trainingPercent = Math.round((progress.completedModules.length / TRAINING_MODULES.length) * 100);
    const isVerified = agent?.verification_status === 'verified' || agent?.training_completed;
    const isKYCDone = agent?.kyc_verified || agent?.verification_status === 'verified';
    const isTrainingDone = agent?.training_completed || trainingPercent === 100;
    const canGetID = isKYCDone && isTrainingDone;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Digital Agent ID</h1>
                    <p className="text-slate-500">Your verified credentials as a LandSale.lk certified agent</p>
                </div>

                {canGetID ? (
                    /* Show Digital ID Card */
                    <div className="flex flex-col items-center">
                        <DigitalAgentID agent={agent} showDownload={true} />

                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 w-full max-w-md">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                How to Use Your ID
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">1</span>
                                    <span>Share your Digital ID with clients to build trust</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">2</span>
                                    <span>Clients can scan the QR code to verify your credentials</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">3</span>
                                    <span>Download and add to your business card or email signature</span>
                                </li>
                            </ul>
                        </div>

                        <Link
                            href={`/agents/${agent.$id}`}
                            className="mt-6 text-emerald-600 font-medium flex items-center gap-2 hover:underline"
                        >
                            View Your Public Profile <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    /* Show Requirements */
                    <div className="max-w-lg mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-10 h-10 text-slate-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Complete Requirements</h2>
                                <p className="text-slate-500">
                                    Complete the following to unlock your Digital Agent ID
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* KYC Status */}
                                <div className={`p-4 rounded-2xl border-2 ${isKYCDone
                                    ? 'border-emerald-200 bg-emerald-50'
                                    : 'border-slate-200 bg-slate-50'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isKYCDone ? 'bg-emerald-500' : 'bg-slate-300'
                                                }`}>
                                                {isKYCDone ? (
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                ) : (
                                                    <Shield className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">KYC Verification</h4>
                                                <p className="text-sm text-slate-500">Identity verification complete</p>
                                            </div>
                                        </div>
                                        {isKYCDone ? (
                                            <span className="text-emerald-600 font-bold text-sm">Done ✓</span>
                                        ) : (
                                            <Link
                                                href="/kyc"
                                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors"
                                            >
                                                Start KYC
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Training Status */}
                                <div className={`p-4 rounded-2xl border-2 ${isTrainingDone
                                    ? 'border-emerald-200 bg-emerald-50'
                                    : 'border-slate-200 bg-slate-50'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTrainingDone ? 'bg-emerald-500' : 'bg-slate-300'
                                                }`}>
                                                {isTrainingDone ? (
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                ) : (
                                                    <BookOpen className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Agent Training</h4>
                                                <p className="text-sm text-slate-500">
                                                    {isTrainingDone
                                                        ? 'All modules completed'
                                                        : `${trainingPercent}% complete (${progress.completedModules.length}/${TRAINING_MODULES.length})`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        {isTrainingDone ? (
                                            <span className="text-emerald-600 font-bold text-sm">Done ✓</span>
                                        ) : (
                                            <Link
                                                href="/agent/training"
                                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"
                                            >
                                                Continue <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                    {!isTrainingDone && (
                                        <div className="mt-3">
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                                    style={{ width: `${trainingPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-slate-100 rounded-xl text-center">
                                <p className="text-slate-600 text-sm">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Complete both requirements to unlock your Digital Agent ID
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
