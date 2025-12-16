'use client';

import { Sparkles, TrendingUp, Info } from 'lucide-react';
import { estimateValue } from '@/lib/valuation';

export function ValuationCard({ property }) {
    if (!property) return null;

    const { low, high, confidence } = estimateValue(property);
    const format = (v) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-all"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-purple-300 font-bold uppercase text-xs tracking-wider">
                    <Sparkles className="w-4 h-4" /> AI Valuation
                </div>

                <h3 className="text-xl font-bold mb-1">Estimated Market Value</h3>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl lg:text-3xl font-bold text-white shadow-sm">{format(low)}</span>
                    <span className="text-slate-400 text-sm">to</span>
                    <span className="text-2xl lg:text-3xl font-bold text-white shadow-sm">{format(high)}</span>
                </div>

                <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-sm text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-purple-400" />
                    <p>
                        Based on {(() => {
                            try { return JSON.parse(property.location)?.city || JSON.parse(property.location)?.address || property.location }
                            catch { return property.location || 'similar' }
                        })()} properties with {property.beds} beds and {property.perch_size} perches.
                        <span className="block mt-1 text-purple-300 font-bold">Confidence: {confidence}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
