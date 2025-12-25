'use client';

import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, MessageCircle, Maximize2, Minimize2, X, Calendar, Clock, User } from 'lucide-react';

// Note: This is a UI-only component. For actual video calls, integrate with:
// - Zoom SDK
// - Twilio Video
// - Daily.co
// - Jitsi Meet (open-source, free)

export function VideoCallButton({ agentName, agentId, propertyTitle, isVerified, onVerify }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleOpen = () => {
        if (!isVerified && onVerify) {
            onVerify();
            return;
        }
        setIsModalOpen(true);
    };

    const handleSchedule = (e) => {
        e.preventDefault();
        // In production, save to Appwrite and send notifications
        console.log('Video call scheduled:', {
            agentId,
            date: scheduledDate,
            time: scheduledTime,
            property: propertyTitle
        });
        setIsSubmitted(true);
    };

    const handleStartCall = () => {
        // In production, generate a meeting room and redirect
        // For demo, open Jitsi Meet in a new window
        const roomId = `landsale-${Date.now()}`;
        window.open(`https://meet.jit.si/${roomId}`, '_blank', 'width=1200,height=800');
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleOpen}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
                <Video className="w-5 h-5" />
                Virtual Tour / Video Call
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up">
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setIsScheduling(false);
                                setIsSubmitted(false);
                            }}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        {isSubmitted ? (
                            /* Success State */
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Call Scheduled!</h3>
                                <p className="text-slate-500 mb-2">
                                    Your video call with {agentName} has been scheduled.
                                </p>
                                <p className="text-emerald-600 font-bold">
                                    {new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {scheduledTime}
                                </p>
                                <p className="text-sm text-slate-400 mt-4">
                                    You'll receive a confirmation email with the meeting link.
                                </p>
                            </div>
                        ) : isScheduling ? (
                            /* Schedule Form */
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Schedule Video Call</h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Pick a date and time with {agentName}
                                    </p>
                                </div>

                                <form onSubmit={handleSchedule} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Confirm Schedule
                                    </button>
                                </form>

                                <button
                                    onClick={() => setIsScheduling(false)}
                                    className="w-full mt-3 py-2 text-slate-500 text-sm font-medium hover:text-slate-700"
                                >
                                    ← Back to options
                                </button>
                            </>
                        ) : (
                            /* Options View */
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Video className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Video Tour</h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Connect with {agentName} for a virtual property viewing
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {/* Start Now */}
                                    <button
                                        onClick={handleStartCall}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Video className="w-5 h-5" />
                                        Start Call Now
                                    </button>

                                    {/* Schedule */}
                                    <button
                                        onClick={() => setIsScheduling(true)}
                                        className="w-full py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Schedule for Later
                                    </button>
                                </div>

                                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                                    <h4 className="font-bold text-slate-700 text-sm mb-2">What to expect:</h4>
                                    <ul className="text-xs text-slate-500 space-y-1">
                                        <li>• Live walkthrough of the property</li>
                                        <li>• Q&A with the agent in real-time</li>
                                        <li>• View specific areas on request</li>
                                        <li>• No downloads required</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// Mini in-call UI for future implementation
export function VideoCallUI({ roomId, onEnd }) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className={`bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full max-w-4xl mx-auto'}`}>
            {/* Video Area */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                {/* Remote Video Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-12 h-12 text-slate-500" />
                        </div>
                        <p className="text-slate-400">Connecting to agent...</p>
                    </div>
                </div>

                {/* Local Video (PiP) */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-700 rounded-lg border-2 border-slate-600 flex items-center justify-center">
                    {isVideoOn ? (
                        <Video className="w-6 h-6 text-slate-400" />
                    ) : (
                        <VideoOff className="w-6 h-6 text-red-400" />
                    )}
                </div>

                {/* Fullscreen Toggle */}
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-5 h-5 text-white" />
                    ) : (
                        <Maximize2 className="w-5 h-5 text-white" />
                    )}
                </button>

                {/* Call Duration */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                    00:00
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 flex items-center justify-center gap-4">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-4 rounded-full transition-colors ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                <button
                    onClick={onEnd}
                    className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>

                <button className="p-4 bg-slate-700 text-white rounded-full hover:bg-slate-600 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
