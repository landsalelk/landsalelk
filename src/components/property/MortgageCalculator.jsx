'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

export default function MortgageCalculator({ price }) {
    const [amount, setAmount] = useState(price || 10000000);
    const [downPayment, setDownPayment] = useState(20); // %
    const [interest, setInterest] = useState(12); // %
    const [term, setTerm] = useState(20); // Years

    const [monthly, setMonthly] = useState(0);

    useEffect(() => {
        if (!amount) return;

        const principal = amount * (1 - (downPayment / 100));
        const r = (interest / 100) / 12;
        const n = term * 12;

        if (r === 0) {
            setMonthly(principal / n);
        } else {
            const m = principal * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
            setMonthly(m);
        }
    }, [amount, downPayment, interest, term]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Mortgage Calculator</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Property Price (LKR)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Down Payment %</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3 w-3 h-3 text-slate-400" />
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Interest Rate %</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3 w-3 h-3 text-slate-400" />
                                <input
                                    type="number"
                                    value={interest}
                                    onChange={(e) => setInterest(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-accent font-medium text-slate-600 mb-2">Loan Term: {term} Years</label>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            value={term}
                            onChange={(e) => setTerm(Number(e.target.value))}
                            className="w-full accent-emerald-600"
                        />
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl text-white text-center">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Estimated Monthly</p>
                    <div className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-4">
                        LKR {Math.round(monthly).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                        <p>Total Principal: LKR {(amount * (1 - downPayment / 100)).toLocaleString()}</p>
                        <p>Total Interest: LKR {((monthly * term * 12) - (amount * (1 - downPayment / 100))).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
