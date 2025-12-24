'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Award, CheckCircle, Calendar, MapPin, Phone, Mail, Download, Share2, BadgeCheck } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * Digital Agent ID Card Component
 * Shows a verifiable ID card with QR code for certified agents
 */
export function DigitalAgentID({ agent, showDownload = true, compact = false }) {
    const cardRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    if (!agent) return null;

    const isVerified = agent.verification_status === 'verified' || agent.training_completed;
    const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://landsale.lk'}/verify/agent/${agent.$id}`;

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `LandSale_Agent_ID_${agent.name?.replace(/\s+/g, '_') || 'agent'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Download failed:', e);
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${agent.name} - Verified LandSale.lk Agent`,
                    text: `Verify ${agent.name}'s credentials on LandSale.lk`,
                    url: verificationUrl,
                });
            } catch (e) {
                // Share cancelled by user
            }
        } else {
            navigator.clipboard.writeText(verificationUrl);
            alert('Verification link copied to clipboard!');
        }
    };

    if (compact) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG value={verificationUrl} size={60} level="M" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{agent.name}</span>
                        {isVerified && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-400">Scan to verify</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ID Card */}
            <div
                ref={cardRef}
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl"
                style={{ aspectRatio: '1.6/1', maxWidth: '500px' }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Card Content */}
                <div className="relative h-full p-6 flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">LANDSALE.LK</h3>
                                <p className="text-slate-400 text-xs">Certified Agent</p>
                            </div>
                        </div>

                        {/* Verification Badge */}
                        {isVerified && (
                            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-bold">VERIFIED</span>
                            </div>
                        )}
                    </div>

                    {/* Agent Info */}
                    <div className="flex items-end justify-between mt-4">
                        <div className="flex-1">
                            {/* Profile Photo Placeholder */}
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
                                {agent.name?.[0]?.toUpperCase() || 'A'}
                            </div>

                            <h2 className="text-white text-xl font-bold leading-tight">{agent.name}</h2>

                            {agent.specialization && (
                                <p className="text-slate-400 text-sm mt-1">{agent.specialization}</p>
                            )}

                            <div className="flex items-center gap-4 mt-3">
                                {agent.location && (
                                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                                        <MapPin className="w-3 h-3" />
                                        <span>{agent.location}</span>
                                    </div>
                                )}
                                {agent.certified_at && (
                                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(agent.certified_at).getFullYear()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Agent ID */}
                            <div className="mt-3">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Agent ID</p>
                                <p className="text-white font-mono text-sm">{agent.$id?.slice(0, 12).toUpperCase() || 'N/A'}</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-3 rounded-2xl shadow-xl">
                            <QRCodeSVG
                                value={verificationUrl}
                                size={80}
                                level="H"
                                includeMargin={false}
                                fgColor="#0f172a"
                            />
                            <p className="text-center text-slate-500 text-[8px] mt-1 font-medium">SCAN TO VERIFY</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Stripe */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            </div>

            {/* Actions */}
            {showDownload && (
                <div className="flex gap-3 max-w-[500px]">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        {downloading ? 'Downloading...' : 'Download ID'}
                    </button>
                    <button
                        onClick={handleShare}
                        className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-5 h-5" />
                        Share
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Mini QR Badge for displaying in listings and profiles
 */
export function AgentQRBadge({ agentId, agentName, size = 'sm' }) {
    const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://landsale.lk'}/verify/agent/${agentId}`;

    const sizes = {
        sm: { qr: 40, text: 'text-[8px]', padding: 'p-2', container: 'gap-2' },
        md: { qr: 60, text: 'text-[10px]', padding: 'p-3', container: 'gap-3' },
        lg: { qr: 80, text: 'text-xs', padding: 'p-4', container: 'gap-4' },
    };

    const s = sizes[size] || sizes.sm;

    return (
        <div className={`inline-flex items-center ${s.container} bg-slate-900 rounded-xl ${s.padding}`}>
            <div className="bg-white p-1 rounded-lg">
                <QRCodeSVG value={verificationUrl} size={s.qr} level="M" />
            </div>
            <div>
                <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-bold">VERIFIED</span>
                </div>
                <p className={`text-white font-medium ${s.text}`}>{agentName}</p>
                <p className={`text-slate-400 ${s.text}`}>Scan to verify</p>
            </div>
        </div>
    );
}
