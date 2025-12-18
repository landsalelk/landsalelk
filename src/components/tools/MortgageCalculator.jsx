'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar, PieChart } from 'lucide-react';

export function MortgageCalculator({ defaultPrice = 25000000 }) {
    const [price, setPrice] = useState(defaultPrice);
    const [downPayment, setDownPayment] = useState(defaultPrice * 0.2);
    const [interestRate, setInterestRate] = useState(12.5); // Common in SL
    const [loanTerm, setLoanTerm] = useState(20);
    const [maxPrice, setMaxPrice] = useState(100000000);

    const [results, setResults] = useState({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0
    });

    useEffect(() => {
        calculateMortgage();
    }, [price, downPayment, interestRate, loanTerm]);

    const calculateMortgage = () => {
        const principal = price - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (monthlyRate === 0) {
            setResults({
                monthlyPayment: principal / numberOfPayments,
                totalPayment: principal,
                totalInterest: 0
            });
            return;
        }

        const monthlyPayment =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - principal;

        setResults({
            monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
            totalPayment: isNaN(totalPayment) ? 0 : totalPayment,
            totalInterest: isNaN(totalInterest) ? 0 : totalInterest
        });
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-400" /> Mortgage Calculator
                    </h2>
                    <p className="text-slate-400 text-sm opacity-80">Estimate your monthly payments</p>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Inputs */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                            <span>Property Price</span>
                            <span className="text-emerald-600">{formatCurrency(price)}</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold text-slate-700"
                            />
                        </div>
                        <input
                            type="range"
                            min="1000000"
                            max={maxPrice}
                            step="100000"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full mt-3 accent-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                            <span>Down Payment</span>
                            <span className="text-emerald-600">{formatCurrency(downPayment)} ({((downPayment / price) * 100).toFixed(0)}%)</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={downPayment}
                                onChange={(e) => setDownPayment(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold text-slate-700"
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={price}
                            step="100000"
                            value={downPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="w-full mt-3 accent-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Interest Rate (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold text-slate-700"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Loan Term (Years)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center relative overflow-hidden">
                    {/* Background deco */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-2xl" />

                    <div className="text-center relative z-10">
                        <p className="text-slate-500 font-medium mb-1">Estimated Monthly Payment</p>
                        <h3 className="text-4xl lg:text-5xl font-extrabold text-emerald-700 mb-6">
                            {formatCurrency(results.monthlyPayment)}
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-emerald-200/50">
                                <span className="text-slate-600 font-medium">Loan Amount</span>
                                <span className="font-bold text-slate-800">{formatCurrency(price - downPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-emerald-200/50">
                                <span className="text-slate-600 font-medium">Total Interest</span>
                                <span className="font-bold text-slate-800">{formatCurrency(results.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-600 font-medium">Total Cost of Loan</span>
                                <span className="font-bold text-slate-800">{formatCurrency(results.totalPayment)}</span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/60 rounded-xl text-xs text-slate-500 leading-relaxed text-left">
                            * This is an estimate only. Actual rates and payments may vary based on your credit score, down payment, and lender terms. Doesn't include insurance or taxes.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
