import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8 text-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Choose the plan that's right for you. No hidden fees.
                    </p>
                </div>

                <div className="mt-10">
                    <Link
                        href="/"
                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
