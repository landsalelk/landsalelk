"use client";

import { useState, useEffect, useCallback } from 'react';
import { account, databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_USER_WALLETS, COLLECTION_TRANSACTIONS } from '@/appwrite/config';
import { Query, ID } from 'appwrite';
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [currency, setCurrency] = useState("LKR");
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [user, setUser] = useState(null);
    const [processing, setProcessing] = useState(false);

    const loadWalletData = useCallback(async () => {
        try {
            const userData = await account.get();
            setUser(userData);

            // 1. Fetch Wallet Balance
            // We search for a wallet document associated with this user
            const walletRes = await databases.listDocuments(
                DB_ID,
                COLLECTION_USER_WALLETS,
                [Query.equal('user_id', userData.$id)]
            );

            if (walletRes.documents.length > 0) {
                const wallet = walletRes.documents[0];
                setBalance(wallet.balance);
                setCurrency(wallet.currency_code);
            } else {
                // Determine if we should create a wallet? For now, assume 0.
                setBalance(0);
            }

            // 2. Fetch Transactions
            const txRes = await databases.listDocuments(
                DB_ID,
                COLLECTION_TRANSACTIONS,
                [
                    Query.equal('user_id', userData.$id),
                    Query.orderDesc('created_at')
                ]
            );
            setTransactions(txRes.documents);

        } catch (error) {
            console.error('Wallet Error:', error);
            // Only redirect to login if it's an authentication error
            if (error.code === 401 || error.type === 'general_unauthorized_scope' || error.message?.includes('Unauthorized')) {
                router.push('/auth/login');
            } else {
                toast.error("Failed to load wallet information");
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadWalletData();
    }, [loadWalletData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        setProcessing(true);
        try {
            // Create pending deposit transaction
            await databases.createDocument(DB_ID, COLLECTION_TRANSACTIONS, ID.unique(), {
                user_id: user.$id,
                type: 'deposit',
                amount: parseFloat(amount),
                status: 'pending',
                description: 'Wallet deposit',
                created_at: new Date().toISOString()
            });
            toast.success('Deposit initiated! Pay via your preferred method. Balance updates after verification.');
            setShowDepositModal(false);
            setAmount('');
            loadWalletData();
        } catch (e) {
            toast.error('Failed to initiate deposit');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        const withdrawAmount = parseFloat(amount);
        if (!amount || withdrawAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (withdrawAmount > balance) {
            toast.error('Insufficient balance');
            return;
        }
        setProcessing(true);
        try {
            await databases.createDocument(DB_ID, COLLECTION_TRANSACTIONS, ID.unique(), {
                user_id: user.$id,
                type: 'withdrawal',
                amount: -withdrawAmount,
                status: 'pending',
                description: 'Withdrawal request',
                created_at: new Date().toISOString()
            });
            toast.success('Withdrawal requested! Processing in 2-3 business days.');
            setShowWithdrawModal(false);
            setAmount('');
            loadWalletData();
        } catch (e) {
            toast.error('Failed to request withdrawal');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-12 md:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header>
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                        <Wallet className="h-8 w-8 text-emerald-600" />
                        My Wallet
                    </h1>
                    <p className="text-slate-500">
                        Manage your earnings, deposits, and transaction history.
                    </p>
                </header>

                {/* Balance Card */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white shadow-xl md:col-span-2">
                        <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="mb-1 font-medium text-emerald-100">
                                Total Balance
                            </h2>
                            <div className="mb-8 text-4xl font-bold tracking-tight md:text-5xl">
                                {formatCurrency(balance)}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setShowDepositModal(true)}
                                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
                                >
                                    <ArrowUpRight className="h-4 w-4" /> Deposit Funds
                                </button>
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-700/50 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
                                >
                                    <ArrowDownLeft className="h-4 w-4" /> Withdraw
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Clock className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Pending Clearance
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-slate-700">LKR 0.00</p>
                        <p className="mt-2 text-sm text-slate-400">
                            Funds available in 2-3 days
                        </p>
                    </div>
                </div>

                {/* Transactions */}
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center">
                        <h3 className="text-xl font-bold text-slate-900">
                            Transaction History
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-sm outline-none focus:border-emerald-500"
                                />
                            </div>
                            <button className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-left text-xs font-bold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr
                                            key={tx.$id}
                                            className="transition-colors hover:bg-slate-50/50"
                                        >
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                                <span className="block text-xs text-slate-400">
                                                    {new Date(tx.created_at).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {tx.description || "Transaction"}
                                                <span className="mt-0.5 block font-mono text-xs text-slate-400">
                                                    {tx.$id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-bold capitalize ${tx.type === "credit"
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-orange-50 text-orange-700"
                                                        }`}
                                                >
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`flex items-center gap-1.5 text-xs font-bold capitalize ${tx.status === "completed"
                                                            ? "text-emerald-600"
                                                            : tx.status === "pending"
                                                                ? "text-amber-600"
                                                                : "text-red-600"
                                                        }`}
                                                >
                                                    <div
                                                        className={`h-1.5 w-1.5 rounded-full ${tx.status === "completed"
                                                                ? "bg-emerald-500"
                                                                : tx.status === "pending"
                                                                    ? "bg-amber-500"
                                                                    : "bg-red-500"
                                                            }`}
                                                    />
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td
                                                className={`px-6 py-4 text-right text-sm font-bold whitespace-nowrap ${tx.type === "credit"
                                                        ? "text-emerald-600"
                                                        : "text-slate-900"
                                                    }`}
                                            >
                                                {tx.type === "credit" ? "+" : "-"}
                                                {formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-slate-500"
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">
                                Deposit Funds
                            </h3>
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Amount (LKR)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                After initiating, you'll receive bank transfer details via
                                email.
                            </p>
                            <button
                                onClick={handleDeposit}
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowUpRight className="h-4 w-4" />
                                )}
                                {processing ? "Processing..." : "Initiate Deposit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">
                                Withdraw Funds
                            </h3>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                                Available Balance:{" "}
                                <span className="font-bold text-emerald-600">
                                    {formatCurrency(balance)}
                                </span>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Amount (LKR)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    max={balance}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                Withdrawals are processed within 2-3 business days to your
                                registered bank account.
                            </p>
                            <button
                                onClick={handleWithdraw}
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowDownLeft className="h-4 w-4" />
                                )}
                                {processing ? "Processing..." : "Request Withdrawal"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
