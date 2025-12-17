'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function ROICalculator({ price }) {
    const [purchasePrice, setPurchasePrice] = useState(price || 10000000);
    const [rent, setRent] = useState(50000); // Monthly
    const [appreciation, setAppreciation] = useState(5); // % Annual
    const [years, setYears] = useState(5);

    const [roi, setRoi] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);

    useEffect(() => {
        const annualRent = rent * 12;
        const totalRent = annualRent * years;
        const finalValue = purchasePrice * Math.pow((1 + appreciation / 100), years);
        const profit = (totalRent + finalValue) - purchasePrice;

        setTotalProfit(profit);
        setRoi((profit / purchasePrice) * 100);
    }, [purchasePrice, rent, appreciation, years]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Investment ROI</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Rent (LKR)</label>
                        <input
                            type="number"
                            value={rent}
                            onChange={(e) => setRent(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Appreciation Rate (%)</label>
                        <input
                            type="number"
                            value={appreciation}
                            onChange={(e) => setAppreciation(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                        />
                    </div>
                </div>

                <div className="bg-indigo-900 p-6 rounded-2xl text-white flex flex-col justify-center">
                    <div className="mb-4">
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Total Return ({years} Years)</span>
                        <div className="text-3xl font-bold text-emerald-400">
                            {Math.round(roi)}%
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Projected Profit</span>
                        <div className="text-xl font-bold text-white">
                            LKR {totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
