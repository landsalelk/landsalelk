'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { databases, ID, account } from '@/appwrite';
import { DB_ID, COLLECTION_AGENTS, COLLECTION_LISTINGS } from '@/appwrite/config';
import { toast } from 'sonner';
import { DigitalAgentID, AgentQRBadge } from '@/components/agent/DigitalAgentID';
import { PropertyCard } from '@/components/property/PropertyCard';
import {
    Loader2, MapPin, Phone, Mail, Calendar, Star, Shield,
    CheckCircle, Award, Building2, MessageSquare, ExternalLink,
    Clock, Trophy, BadgeCheck, TrendingUp, Users, PenTool, X
} from 'lucide-react';
import { AgentBadges } from '@/components/agent/AgentBadges';

export default function AgentProfilePage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [agent, setAgent] = useState(null);
    const [listings, setListings] = useState([]);
    const [error, setError] = useState(null);

    // Review State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const user = await account.get();
            await databases.createDocument(
                DB_ID,
                'reviews',
                ID.unique(),
                {
                    agent_id: id,
                    user_id: user.$id,
                    rating: reviewRating,
                    comment: reviewComment,
                    is_approved: false
                }
            );
            toast.success('Review submitted for moderation!');
            setIsReviewOpen(false);
            setReviewComment('');
        } catch (error) {
            console.error(error);
            if (error.code === 401) {
                toast.error('Please login to write a review');
                // optional: router.push('/auth/login');
            } else {
                toast.error('Failed to submit review');
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        async function loadAgent() {
            if (!id) return;

            try {
                // Fetch agent profile
                const agentDoc = await databases.getDocument(DB_ID, COLLECTION_AGENTS, id);
                setAgent(agentDoc);

                // Fetch agent's listings
                try {
                    const listingsResult = await databases.listDocuments(
                        DB_ID,
                        COLLECTION_LISTINGS,
                        [
                            Query.equal('agent_id', id),
                            Query.equal('status', 'active'),
                            Query.orderDesc('$createdAt'),
                            Query.limit(6)
                        ]
                    );
                    setListings(listingsResult.documents);
                } catch (e) {
                    // Could not fetch listings - continue gracefully
                }
            } catch (e) {
                console.error(e);
                setError('Agent not found');
            } finally {
                setLoading(false);
            }
        }
        loadAgent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Agent Not Found</h1>
                    <p className="text-slate-500 mb-4">This agent profile does not exist.</p>
                    <Link href="/agents" className="text-emerald-600 hover:underline">
                        Browse All Agents
                    </Link>
                </div>
            </div>
        );
    }

    const isVerified = agent.verification_status === 'verified' || agent.training_completed;
    const memberSince = agent.$createdAt ? new Date(agent.$createdAt).getFullYear() : null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left: Agent Info */}
                        <div className="flex-1">
                            <div className="flex items-start gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-lg shrink-0">
                                    {agent.name?.[0]?.toUpperCase() || 'A'}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-3xl md:text-4xl font-bold">{agent.name}</h1>
                                        {isVerified && (
                                            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 flex items-center gap-1">
                                                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                                                <span className="text-emerald-400 text-sm font-bold">Verified Agent</span>
                                            </div>
                                        )}
                                    </div>

                                    {agent.specialization && (
                                        <p className="text-slate-400 text-lg mt-2">{agent.specialization}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 mt-4">
                                        {agent.location && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <MapPin className="w-4 h-4" />
                                                <span>{agent.location}</span>
                                            </div>
                                        )}
                                        {memberSince && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Calendar className="w-4 h-4" />
                                                <span>Member since {memberSince}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-6 mt-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-emerald-400">{listings.length}</div>
                                            <div className="text-xs text-slate-400">Active Listings</div>
                                        </div>
                                        {agent.deals_closed !== undefined && (
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">{agent.deals_closed || 0}</div>
                                                <div className="text-xs text-slate-400">Deals Closed</div>
                                            </div>
                                        )}
                                        {agent.rating && (
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                                                    <Star className="w-5 h-5 fill-current" />
                                                    {agent.rating}
                                                </div>
                                                <div className="text-xs text-slate-400">Rating</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="flex flex-wrap gap-3 mt-8">
                                {agent.phone && (
                                    <a
                                        href={`tel:${agent.phone}`}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Call Now
                                    </a>
                                )}
                                {agent.whatsapp && (
                                    <a
                                        href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        WhatsApp
                                    </a>
                                )}
                                {agent.email && (
                                    <a
                                        href={`mailto:${agent.email}`}
                                        className="px-6 py-3 border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Email
                                    </a>
                                )}

                                <button
                                    onClick={() => setIsReviewOpen(true)}
                                    className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center gap-2"
                                >
                                    <PenTool className="w-5 h-5" />
                                    Write Review
                                </button>
                            </div>
                        </div>

                        {/* Right: Digital ID Card */}
                        <div className="w-full lg:w-auto">
                            <DigitalAgentID agent={agent} showDownload={true} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: About & Credentials */}
                    <div className="space-y-6">
                        {/* About */}
                        {agent.bio && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">About</h2>
                                <p className="text-slate-600 leading-relaxed">{agent.bio}</p>
                            </div>
                        )}

                        {/* Agent Badges */}
                        <AgentBadges userId={agent.user_id} />

                        {/* Credentials */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                Verification Status
                            </h2>

                            <div className="space-y-4">
                                {/* KYC Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Identity Verified</span>
                                    {agent.kyc_verified || agent.verification_status === 'verified' ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-amber-500" />
                                    )}
                                </div>

                                {/* Training Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Training Completed</span>
                                    {agent.training_completed ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-amber-500" />
                                    )}
                                </div>

                                {/* Certified Date */}
                                {agent.certified_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Certified Since</span>
                                        <span className="text-slate-900 font-medium">
                                            {new Date(agent.certified_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {isVerified && (
                                <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8 text-emerald-500" />
                                        <div>
                                            <h4 className="font-bold text-emerald-700">Certified Agent</h4>
                                            <p className="text-sm text-emerald-600">KYC verified and training completed</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specializations */}
                        {agent.services && agent.services.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Services</h2>
                                <div className="flex flex-wrap gap-2">
                                    {agent.services.map((service, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Areas Served */}
                        {agent.areas_served && agent.areas_served.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-500" />
                                    Areas Served
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {agent.areas_served.map((area, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Agent's Listings */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-emerald-500" />
                                Properties by {agent.name?.split(' ')[0]}
                            </h2>
                            {listings.length > 0 && (
                                <Link
                                    href={`/properties?agent=${id}`}
                                    className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    View All <ExternalLink className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {listings.map(listing => (
                                    <PropertyCard key={listing.$id} property={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 mb-2">No Active Listings</h3>
                                <p className="text-slate-500">This agent doesn't have any active listings at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {isReviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up">
                        <button
                            onClick={() => setIsReviewOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <h3 className="text-xl font-bold text-slate-900 mb-6">Rate this Agent</h3>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-center font-medium text-amber-500">
                                {reviewRating === 1 && "Poor"}
                                {reviewRating === 2 && "Fair"}
                                {reviewRating === 3 && "Good"}
                                {reviewRating === 4 && "Very Good"}
                                {reviewRating === 5 && "Excellent!"}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Your Experience</label>
                                <textarea
                                    required
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Share your experience working with this agent..."
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none resize-none h-32"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
