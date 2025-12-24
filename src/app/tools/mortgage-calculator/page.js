import { MortgageCalculator } from '@/components/tools/MortgageCalculator';

export const metadata = {
    title: 'Mortgage Calculator | LandSale.lk',
    description: 'Calculate your estimated monthly mortgage payments for properties in Sri Lanka.',
};

export default function MortgageCalculatorPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-12 pb-24">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Mortgage Calculator</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Plan your property details with confidence. Estimate your monthly payments based on Sri Lankan interest rates.
                    </p>
                </div>

                <MortgageCalculator defaultPrice={25000000} />

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-2">Check Rates</h3>
                        <p className="text-slate-500 text-sm">
                            Current mortgage rates in Sri Lanka fluctuate. Check with local banks for the most accurate rates.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-2">Down Payment</h3>
                        <p className="text-slate-500 text-sm">
                            A higher down payment reduces your monthly installment and total interest paid over the loan term.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-2">Loan Term</h3>
                        <p className="text-slate-500 text-sm">
                            Longer terms mean lower monthly payments but higher total interest costs. Short terms save money long-term.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
