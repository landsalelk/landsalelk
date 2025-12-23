"use client";

import { useState, useEffect } from "react";
import { client, databases, functions, Query } from "@/lib/appwrite";
import { toast } from "sonner";
import { Gavel, Clock, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export default function AuctionCard({ propertyId, initialPrice, endTime }) {
    const [highestBid, setHighestBid] = useState(initialPrice);
    const [bidAmount, setBidAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [error, setError] = useState("");

    const MIN_INCREMENT = 5000; // Minimum bid increment

    // Fetch highest bid and subscribe to updates
    useEffect(() => {
        const fetchHighestBid = async () => {
            try {
                const response = await databases.listDocuments(
                    "landsalelkdb",
                    "bids",
                    [
                        Query.equal("property_id", propertyId),
                        Query.orderDesc("amount"),
                        Query.limit(1),
                    ]
                );
                if (response.documents.length > 0) {
                    setHighestBid(response.documents[0].amount);
                }
            } catch (err) {
                console.error("Failed to fetch bids", err);
            }
        };

        fetchHighestBid();

        // Subscribe to realtime updates for this property's bids
        const unsubscribe = client.subscribe(
            `databases.landsalelkdb.collections.bids.documents`,
            (response) => {
                if (
                    response.events.includes("databases.*.collections.*.documents.*.create")
                ) {
                    const newBid = response.payload;
                    if (newBid.property_id === propertyId) {
                        setHighestBid((prev) => Math.max(prev, newBid.amount));
                        toast.success("New bid placed!");
                    }
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, [propertyId]);

    // Timer Logic
    useEffect(() => {
        if (!endTime) return;

        const calculateTimeLeft = () => {
            const difference = new Date(endTime) - new Date();
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                return `${days}d ${hours}h ${minutes}m`;
            }
            return "Auction Ended";
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);

        return () => clearInterval(timer);
    }, [endTime]);

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        setError("");

        const amount = parseFloat(bidAmount);
        if (!amount || amount <= highestBid) {
            setError(`Bid must be higher than LKR ${highestBid.toLocaleString()}`);
            return;
        }

        if (amount < highestBid + MIN_INCREMENT) {
            setError(`Minimum increment is LKR ${MIN_INCREMENT.toLocaleString()}`);
            return;
        }

        setLoading(true);

        try {
            // Get current user ID (client side knows who is logged in via account, 
            // but Function needs it in body or infers from execution context if set downstream. 
            // The function expects 'user_id' in body in our implementation)

            const { account } = await import("@/lib/appwrite");
            let user;
            try {
                user = await account.get();
            } catch (err) {
                toast.error("Please login to place a bid");
                setLoading(false);
                return;
            }

            await functions.createExecution(
                "place-bid",
                JSON.stringify({
                    property_id: propertyId,
                    amount: amount,
                    user_id: user.$id
                })
            );

            toast.success("Bid placed successfully!");
            setBidAmount("");
        } catch (err) {
            // console.error(err);
            try {
                // Try to parse function error if possible, though createExecution throws generic errors often
                // Ideally function returns json with error message, but createExecution returns execution object
                // Wait, createExecution is async: 'async' by default since 1.4? No, usage is 'sync' mostly check docs.
                // In recent Appwrite SDKs, createExecution returns immediately if async, or waits if sync.
                // Defaults to synchronous usually unless specified.
                // If the function throws, createExecution throws.
                toast.error("Failed to place bid. " + err.message);
            } catch (e) {
                toast.error("Failed to place bid");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-900">
                    <Gavel className="h-6 w-6 text-[#10b981]" />
                    <h3 className="font-bold text-lg">Auction Live</h3>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                    <Clock className="h-4 w-4" />
                    <span>{timeLeft}</span>
                </div>
            </div>

            <div className="mb-6 space-y-1">
                <p className="text-sm font-medium text-slate-500">Current Highest Bid</p>
                <p className="text-3xl font-bold text-slate-900">
                    LKR {highestBid.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>{0} bids total</span> {/* Count not implemented yet */}
                </div>
            </div>

            <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        LKR
                    </span>
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min: ${(highestBid + MIN_INCREMENT).toLocaleString()}`}
                        className={`w-full rounded-xl border-2 bg-slate-50 py-3 pl-14 pr-4 font-bold text-slate-900 outline-none transition-all focus:bg-white ${error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#10b981]"
                            }`}
                    />
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || timeLeft === "Auction Ended"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10b981] py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Placing Bid...
                        </>
                    ) : (
                        "Place Bid"
                    )}
                </button>
            </form>
        </div>
    );
}
