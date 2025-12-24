"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { getInvitationByToken, acceptAgentInvitation, rejectAgentInvitation } from '@/actions/invitationActions';
import { toast } from 'sonner';
import { Loader2, Building2, ShieldCheck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function JoinPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState(null);
    const [invitation, setInvitation] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (!token) {
                setError("No invitation token provided.");
                setLoading(false);
                return;
            }

            try {
                // Check if user is logged in
                try {
                    const userData = await account.get();
                    setUser(userData);
                } catch (e) {
                    // Not logged in, will be handled in UI
                }

                // Fetch invitation details
                const result = await getInvitationByToken(token);
                if (!result.success || !result.invitation) {
                    setError("Invalid or expired invitation.");
                    setLoading(false);
                    return;
                }

                setInvitation(result.invitation);

                // Check if already accepted/rejected
                if (result.invitation.status === 'accepted') {
                    setError("This invitation has already been accepted.");
                } else if (result.invitation.status === 'rejected') {
                    setError("This invitation was declined.");
                } else if (result.invitation.status === 'expired' || new Date(result.invitation.expires_at) < new Date()) {
                    setError("This invitation has expired.");
                }

            } catch (err) {
                console.error(err);
                setError("Failed to load invitation details.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [token]);

    const handleAccept = async () => {
        if (!user) {
            toast.error("Please log in first");
            return;
        }

        setProcessing(true);
        try {
            const result = await acceptAgentInvitation(token, user.$id);
            if (result.success) {
                setSuccess(true);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to accept invitation");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to decline this invitation?")) return;

        setProcessing(true);
        try {
            const result = await rejectAgentInvitation(token);
            if (result.success) {
                toast.success("Invitation declined");
                router.push('/dashboard');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to decline invitation");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Invalid Invitation</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <Link
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to {invitation.agency_name}!</h1>
                    <p className="text-slate-600 mb-6">
                        You have successfully joined the agency. Your listings will now carry the agency's verified badge.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Agency Logo/Icon */}
                <div className="text-center mb-6">
                    {invitation.agency_logo ? (
                        <img
                            src={invitation.agency_logo}
                            alt={invitation.agency_name}
                            className="w-20 h-20 rounded-2xl mx-auto object-cover shadow-md"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                            <Building2 className="w-10 h-10 text-emerald-600" />
                        </div>
                    )}
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        You're Invited!
                    </h1>
                    <p className="text-slate-600">
                        <strong>{invitation.agency_name}</strong> has invited you to join their agency as an agent.
                    </p>
                </div>

                {/* Benefits */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-slate-800 mb-3">Benefits of Joining</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Lawyer-verified badge on listings
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            Listed under agency public profile
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            Increased trust and visibility
                        </li>
                    </ul>
                </div>

                {/* Expiry Notice */}
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-6">
                    <Clock className="w-4 h-4" />
                    <span>Expires on {new Date(invitation.expires_at).toLocaleDateString()}</span>
                </div>

                {/* Auth Check */}
                {!user ? (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 text-center mb-2">
                            Please log in to accept this invitation
                        </p>
                        <Link
                            href={`/auth/login?redirect=/agency/join?token=${token}`}
                            className="block w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-center hover:bg-emerald-700"
                        >
                            Log In to Accept
                        </Link>
                        <Link
                            href={`/auth/register/agent?invite=${token}`}
                            className="block w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-center hover:bg-slate-50"
                        >
                            Register as Agent
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={handleAccept}
                            disabled={processing}
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Accept Invitation
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={processing}
                            className="w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-5 h-5" />
                            Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        }>
            <JoinPageContent />
        </Suspense>
    );
}
