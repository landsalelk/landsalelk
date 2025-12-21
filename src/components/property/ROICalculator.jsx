'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Building2, Home } from 'lucide-react';

export default function ROICalculator({ price }) {
    const [purchasePrice, setPurchasePrice] = useState(price || 10000000);
    const [rent, setRent] = useState(50000); // Monthly
    const [appreciation, setAppreciation] = useState(5); // % Annual
    const [years, setYears] = useState(5);
    const [type, setType] = useState('residential'); // residential | commercial

    const [roi, setRoi] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [breakeven, setBreakeven] = useState(0);

    // Costs
    const stampDuty = purchasePrice * 0.04; // 4%
    const legalFees = purchasePrice * 0.01; // 1%
    const totalCost = purchasePrice + stampDuty + legalFees;

    useEffect(() => {
        // Adjust defaults based on type
        if (type === 'commercial' && appreciation === 5) setAppreciation(8);
        if (type === 'residential' && appreciation === 8) setAppreciation(5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]); // appreciation intentionally excluded to prevent infinite loop

    useEffect(() => {
        const annualRent = rent * 12;
        const totalRent = annualRent * years;
        const finalValue = purchasePrice * Math.pow((1 + appreciation / 100), years);

        const profit = (totalRent + finalValue) - totalCost;

        setTotalProfit(profit);
        setRoi((profit / totalCost) * 100);

        // Simple breakeven calc (years to cover costs via rent + appreciation)
        // This is an approximation
        let year = 0;
        let currentVal = purchasePrice;
        let earned = 0;
        while (earned + (currentVal - purchasePrice) < (stampDuty + legalFees) && year < 30) {
            year++;
            earned += (rent * 12);
            currentVal *= (1 + appreciation / 100);
        }
        setBreakeven(year);

    }, [purchasePrice, rent, appreciation, years, totalCost, stampDuty, legalFees]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Investment ROI</h3>
                </div>

                {/* Type Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setType('residential')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${type === 'residential' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Home className="w-4 h-4" /> Res
                    </button>
                    <button
                        onClick={() => setType('commercial')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${type === 'commercial' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Building2 className="w-4 h-4" /> Com
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Rent (LKR)</label>
                        <input
                            type="number"
                            value={rent}
                            onChange={(e) => setRent(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Appreciation Rate (%)</label>
                        <input
                            type="number"
                            value={appreciation}
                            onChange={(e) => setAppreciation(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                         <div className="flex justify-between text-xs text-slate-500 mb-1">
                             <span>Stamp Duty (4%)</span>
                             <span>LKR {stampDuty.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-xs text-slate-500">
                             <span>Legal Fees (1%)</span>
                             <span>LKR {legalFees.toLocaleString()}</span>
                         </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <div className="mb-4 relative z-10">
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Total Return ({years} Years)</span>
                        <div className="text-3xl font-bold text-emerald-400">
                            {Math.round(roi)}%
                        </div>
                    </div>
                    <div className="relative z-10">
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Projected Profit</span>
                        <div className="text-xl font-bold text-white mb-2">
                            LKR {totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-slate-400">
                            Breakeven estimated in <span className="text-white font-bold">{breakeven} years</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
