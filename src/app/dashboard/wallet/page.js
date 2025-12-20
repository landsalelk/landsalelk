'use client';

import { useState, useEffect, useCallback } from 'react';
import { account, databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_USER_WALLETS, COLLECTION_TRANSACTIONS } from '@/lib/constants';
import { Query, ID } from 'appwrite';
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [currency, setCurrency] = useState('LKR');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
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
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <header>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-emerald-600" />
                        My Wallet
                    </h1>
                    <p className="text-slate-500">Manage your earnings, deposits, and transaction history.</p>
                </header>

                {/* Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-emerald-100 font-medium mb-1">Total Balance</h2>
                            <div className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                                {formatCurrency(balance)}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setShowDepositModal(true)}
                                    className="px-6 py-3 bg-white text-emerald-800 rounded-xl font-bold font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                >
                                    <ArrowUpRight className="w-4 h-4" /> Deposit Funds
                                </button>
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="px-6 py-3 bg-emerald-700/50 text-white border border-emerald-500/30 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <ArrowDownLeft className="w-4 h-4" /> Withdraw
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Pending Clearance</h3>
                        <p className="text-3xl font-bold text-slate-700 mt-2">LKR 0.00</p>
                        <p className="text-sm text-slate-400 mt-2">Funds available in 2-3 days</p>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                />
                            </div>
                            <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                                        <tr key={tx.$id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                                <span className="block text-xs text-slate-400">
                                                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {tx.description || 'Transaction'}
                                                <span className="block text-xs text-slate-400 font-mono mt-0.5">{tx.$id}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-bold rounded capitalize ${tx.type === 'credit'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${tx.status === 'completed' ? 'text-emerald-600' :
                                                    tx.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' :
                                                        tx.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                                        }`} />
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Deposit Funds</h3>
                            <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (LKR)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                After initiating, you'll receive bank transfer details via email.
                            </p>
                            <button
                                onClick={handleDeposit}
                                disabled={processing}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                                {processing ? 'Processing...' : 'Initiate Deposit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
                            <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                                Available Balance: <span className="font-bold text-emerald-600">{formatCurrency(balance)}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (LKR)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    max={balance}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                Withdrawals are processed within 2-3 business days to your registered bank account.
                            </p>
                            <button
                                onClick={handleWithdraw}
                                disabled={processing}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownLeft className="w-4 h-4" />}
                                {processing ? 'Processing...' : 'Request Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
