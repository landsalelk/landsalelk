'use client';

import { useState } from 'react';
import { X, Bell, Loader2, CheckCircle, MapPin, DollarSign, Mail, Phone, Calendar } from 'lucide-react';
import { createSavedSearch } from '@/app/actions/savedSearch';
import { toast } from 'sonner';

export function SavedSearchModal({ isOpen, onClose, initialLocation, initialType, initialPrice }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('form'); // 'form' or 'success'

    // Form State
    const [location, setLocation] = useState(initialLocation || '');
    const [maxPrice, setMaxPrice] = useState(initialPrice || '');
    const [landType, setLandType] = useState(initialType || '');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [frequency, setFrequency] = useState('daily');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email && !phone) {
            toast.error("Please provide either Email or Phone");
            return;
        }

        setLoading(true);
        try {
            const result = await createSavedSearch({
                location,
                max_price: maxPrice,
                land_type: landType,
                email,
                phone,
                frequency
            });

            if (result.success) {
                setStep('success');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl animate-scale-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {step === 'success' ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Alert Set Successfully!</h3>
                        <p className="text-slate-500 mb-6">
                            We'll notify you when new properties in <span className="font-bold text-slate-900">{location}</span> become available.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Back to Property
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Get Property Alerts</h3>
                                <p className="text-sm text-slate-500">Never miss a matching property again.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Preferences Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-500 focus:bg-white outline-none"
                                            placeholder="City or Area"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Max Price</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs</div>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-500 focus:bg-white outline-none"
                                            placeholder="Budget"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 my-4"></div>

                            {/* Contact Section */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Email Address (Recommended)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-500 focus:bg-white outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">WhatsApp Number (Optional)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-500 focus:bg-white outline-none"
                                        placeholder="07X XXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">Alert Frequency</p>
                                    <p className="text-xs text-slate-500">How often should we update you?</p>
                                </div>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-2 py-1 outline-none"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Alert
                            </button>

                            <p className="text-[10px] text-center text-slate-400">
                                You can unsubscribe at any time. We respect your privacy.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
