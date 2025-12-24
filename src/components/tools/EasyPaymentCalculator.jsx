'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar, Briefcase, Building2 } from 'lucide-react';

export default function EasyPaymentCalculator({ price }) {
    const [mode, setMode] = useState('company'); // 'company' or 'bank'
    const [amount, setAmount] = useState(price || 1000000);

    // Company Plan State
    const [reservationFee, setReservationFee] = useState(100000);
    const [downPaymentPct, setDownPaymentPct] = useState(40);
    const [months, setMonths] = useState(18); // Interest free period

    // Bank Loan State
    const [bankDownPayment, setBankDownPayment] = useState(20);
    const [bankInterest, setBankInterest] = useState(12);
    const [bankYears, setBankYears] = useState(20);

    const [result, setResult] = useState({ monthly: 0, totalInterest: 0 });

    useEffect(() => {
        if (!amount) return;

        if (mode === 'company') {
            // Logic: (Price - Reserve - Down) / Months
            const downPayment = amount * (downPaymentPct / 100);
            const balance = amount - reservationFee - downPayment;
            if (balance > 0 && months > 0) {
                setResult({
                    monthly: balance / months,
                    totalInterest: 0 // Interest free
                });
            } else {
                setResult({ monthly: 0, totalInterest: 0 });
            }
        } else {
            // Bank Logic
            const principal = amount * (1 - (bankDownPayment / 100));
            const r = (bankInterest / 100) / 12;
            const n = bankYears * 12;

            if (r === 0) {
                setResult({ monthly: principal / n, totalInterest: 0 });
            } else {
                const m = principal * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
                setResult({
                    monthly: m,
                    totalInterest: (m * n) - principal
                });
            }
        }
    }, [amount, mode, reservationFee, downPaymentPct, months, bankDownPayment, bankInterest, bankYears]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">

            {/* Header with Toggles */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Payment Estimator</h3>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setMode('company')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'company' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" /> Easy Payment
                    </button>
                    <button
                        onClick={() => setMode('bank')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'bank' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Building2 className="w-4 h-4" /> Bank Loan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                    {/* Common Price Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Property Price (LKR)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                            />
                        </div>
                    </div>

                    {mode === 'company' ? (
                        <>
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="text-sm text-emerald-800 font-medium mb-1 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-xs text-emerald-800 font-bold">1</span>
                                    Reservation Fee
                                </div>
                                <input
                                    type="number"
                                    value={reservationFee}
                                    onChange={(e) => setReservationFee(Number(e.target.value))}
                                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-emerald-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Down Payment ({downPaymentPct}%)</label>
                                <input
                                    type="range"
                                    min="20"
                                    max="60"
                                    step="5"
                                    value={downPaymentPct}
                                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                                    className="w-full accent-emerald-500 mb-2"
                                />
                                <div className="text-right text-sm font-bold text-slate-700">
                                    LKR {Math.round(amount * (downPaymentPct / 100)).toLocaleString()}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Interest-Free Period ({months} Months)</label>
                                <input
                                    type="range"
                                    min="6"
                                    max="24"
                                    step="6"
                                    value={months}
                                    onChange={(e) => setMonths(Number(e.target.value))}
                                    className="w-full accent-emerald-500 mb-2"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Down Pay %</label>
                                    <input
                                        type="number"
                                        value={bankDownPayment}
                                        onChange={(e) => setBankDownPayment(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Rate %</label>
                                    <input
                                        type="number"
                                        value={bankInterest}
                                        onChange={(e) => setBankInterest(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Duration ({bankYears} Years)</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    value={bankYears}
                                    onChange={(e) => setBankYears(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Result Card */}
                <div className="flex flex-col justify-center">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Estimated Monthly</p>
                        <div className="text-4xl font-bold text-emerald-400 mb-6">
                            LKR {Math.round(result.monthly).toLocaleString()}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-800 text-sm text-slate-300">
                            {mode === 'company' ? (
                                <>
                                    <div className="flex justify-between">
                                        <span>Initial Payment (Res + Down)</span>
                                        <span className="font-bold text-white">LKR {(reservationFee + (amount * (downPaymentPct / 100))).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Interest</span>
                                        <span className="font-bold text-emerald-400">LKR 0 (0%)</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span>Principal Amount</span>
                                        <span className="font-bold text-white">LKR {Math.round(amount * (1 - bankDownPayment / 100)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Interest Pay</span>
                                        <span className="font-bold text-white">LKR {Math.round(result.totalInterest).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {mode === 'company' && (
                            <div className="mt-6 p-3 bg-white/10 rounded-xl text-xs text-center leading-relaxed">
                                Note: Prices may vary strictly based on the land sale company's terms. This is an estimate for interest-free schemes.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
