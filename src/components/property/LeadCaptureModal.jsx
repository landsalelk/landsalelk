'use client';

import { useState, useEffect } from 'react';
import { X, Phone, MessageCircle, Loader2, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { sendLeadOTP, verifyLeadOTP } from '@/app/actions/leadOtp';
import { toast } from 'sonner';

const VERIFICATION_KEY = 'landsale_verified_phone';
const VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function LeadCaptureModal({
    isOpen,
    onClose,
    onVerified,
    listingId,
    listingTitle,
    sellerPhone,
    sellerName,
    contactType = 'whatsapp' // 'whatsapp' or 'call'
}) {
    const [step, setStep] = useState('phone'); // 'phone', 'otp', 'verified'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Check if already verified on mount
    useEffect(() => {
        if (isOpen) {
            const verified = checkVerification();
            if (verified) {
                onVerified(verified.phone);
                onClose();
            }
        }
    }, [isOpen]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const checkVerification = () => {
        try {
            const stored = localStorage.getItem(VERIFICATION_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.expires > Date.now()) {
                    return data;
                }
                localStorage.removeItem(VERIFICATION_KEY);
            }
        } catch (e) {
            console.error('Error checking verification:', e);
        }
        return null;
    };

    const saveVerification = (phone) => {
        try {
            localStorage.setItem(VERIFICATION_KEY, JSON.stringify({
                phone,
                expires: Date.now() + VERIFICATION_EXPIRY
            }));
        } catch (e) {
            console.error('Error saving verification:', e);
        }
    };

    const handleSendOTP = async () => {
        if (!phone || phone.length < 9) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const result = await sendLeadOTP(phone);
            if (result.success) {
                toast.success('OTP sent to your phone!');
                setStep('otp');
                setCountdown(60); // 60 seconds before resend
            } else {
                toast.error(result.error || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const result = await verifyLeadOTP(
                phone,
                otp,
                listingId,
                listingTitle,
                sellerPhone,
                sellerName
            );

            if (result.success) {
                setStep('verified');
                saveVerification(phone);
                toast.success('Phone verified successfully!');

                // Short delay then callback
                setTimeout(() => {
                    onVerified(phone);
                    onClose();
                }, 1500);
            } else {
                toast.error(result.error || 'Verification failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        await handleSendOTP();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* Phone Input Step */}
                {step === 'phone' && (
                    <div>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Verify Your Phone</h3>
                            <p className="text-slate-500 mt-2">
                                Enter your phone number to {
                                    {
                                        whatsapp: 'chat with',
                                        call: 'call',
                                        show_number: 'reveal the number of',
                                        offer: 'make an offer to',
                                        video_call: 'schedule a video call with'
                                    }[contactType] || 'contact'
                                } the seller
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                        +94
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="7X XXX XXXX"
                                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-lg outline-none focus:border-emerald-500 focus:bg-white"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={loading || phone.length < 9}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-400 text-center">
                                We'll send a 6-digit code to verify your number. Standard SMS rates may apply.
                            </p>
                        </div>
                    </div>
                )}

                {/* OTP Input Step */}
                {step === 'otp' && (
                    <div>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Enter OTP</h3>
                            <p className="text-slate-500 mt-2">
                                We sent a code to +94 {phone}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-2xl text-center tracking-[0.5em] outline-none focus:border-emerald-500 focus:bg-white"
                                    autoFocus
                                    maxLength={6}
                                />
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading || otp.length !== 6}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Continue
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0}
                                    className={`text-sm font-medium ${countdown > 0 ? 'text-slate-400' : 'text-emerald-600 hover:underline'}`}
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>

                            <button
                                onClick={() => { setStep('phone'); setOtp(''); }}
                                className="w-full text-slate-500 text-sm hover:text-slate-700"
                            >
                                ← Change phone number
                            </button>
                        </div>
                    </div>
                )}

                {/* Verified Step */}
                {step === 'verified' && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Verified!</h3>
                        <p className="text-slate-500">
                            Connecting you to the seller...
                        </p>
                    </div>
                )}

                {/* Security Badge */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    Your information is secure and only shared with the property seller
                </div>
            </div>
        </div>
    );
}
