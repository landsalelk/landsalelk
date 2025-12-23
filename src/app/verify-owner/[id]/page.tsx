"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { databases } from "@/lib/appwrite";
import { toast } from "sonner";
import {
  Check,
  X,
  ShieldCheck,
  MapPin,
  Loader2,
  User,
  Banknote,
} from "lucide-react";
import {
  declineListing,
  initiateAgentHiring,
} from "@/app/actions/owner-verification";

/**
 * OwnerVerificationPage component handles the owner verification process for a property listing.
 * It allows the property owner to approve or decline a listing created by an agent.
 * The owner can choose to hire the agent (and pay a service fee) or claim the listing
 * to sell it themselves for free.
 *
 * The page is accessed via a unique URL with a secret token sent to the owner's phone number.
 */
export default function OwnerVerificationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const secret = searchParams.get("secret");

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the listing details from the database and verifies the secret token.
   * It sets the component's state based on the fetched data or any errors encountered.
   */
  const fetchListing = useCallback(async () => {
    try {
      const doc = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "landsalelk",
        "listings",
        id,
      );

      if (doc.verification_code !== secret) {
        setError("Invalid or expired verification token.");
      } else if (doc.status !== "pending_owner") {
        if (doc.status === "active") {
          setError("This listing has already been verified.");
        } else if (doc.status === "rejected_by_owner") {
          setError("You have declined this listing.");
        } else {
          setError("Listing is not pending verification.");
        }
      } else {
        setListing(doc);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load listing details.");
    } finally {
      setLoading(false);
    }
  }, [id, secret]);

  useEffect(() => {
    if (id && secret) {
      fetchListing();
    } else {
      setError("Invalid verification link.");
      setLoading(false);
    }
  }, [id, secret, fetchListing]);

  const handleClaimFree = async () => {
    // Redirect to login/register logic via our Claim page
    // We pass the secret to ensure security holds
    toast.info("Please login or create an account to claim this listing.");
    // We redirect to a dedicated claim route which will enforce auth
    router.push(`/verify-owner/${id}/claim?secret=${secret}`);
  };

  /**
   * Handles the "Hire Agent" action.
   * It initiates the agent hiring process, which involves a service fee payment.
   * On success, it redirects the user to the PayHere payment gateway.
   */
  const handleHireAgent = async () => {
    setVerifying(true);
    try {
      const amount = listing.service_fee || 1500;
      const result = await initiateAgentHiring(id, secret, amount);

      if (!result || !result.success) {
        toast.error(result?.error || "Payment initiation failed.");
        setVerifying(false);
        return;
      }

      const params = result.paymentParams;

      if (!params) {
        toast.error("Could not retrieve payment details. Please try again.");
        setVerifying(false);
        return;
      }

      // Create and submit PayHere form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = params.sandbox
        ? "https://sandbox.payhere.lk/pay/checkout"
        : "https://www.payhere.lk/pay/checkout";

      // Add all payment parameters as hidden fields
      const fields = {
        merchant_id: params.merchant_id,
        return_url: params.return_url,
        cancel_url: params.cancel_url,
        notify_url: params.notify_url,
        order_id: params.order_id,
        items: params.items,
        currency: params.currency,
        amount: params.amount,
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone,
        address: params.address,
        city: params.city,
        country: params.country,
        hash: params.hash,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      toast.success("Redirecting to PayHere Gateway...");
      form.submit();
    } catch (err) {
      toast.error(err.message || "Payment initiation failed");
      setVerifying(false);
    }
  };

  /**
   * Handles the "Decline" action.
   * It prompts the user for confirmation and then declines the listing,
   * updating its status in the database.
   */
  const handleDecline = async () => {
    if (
      !confirm(
        "Are you sure you want to decline? This listing will be removed.",
      )
    )
      return;

    setVerifying(true);
    try {
      const result = await declineListing(id, secret);

      if (result.success) {
        toast.success("Listing declined.");
        setListing((prev) => ({ ...prev, status: "rejected_by_owner" }));
        setError("You have declined this listing.");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error("Error declining listing.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
            <X className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-slate-900">
            Access Denied
          </h1>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="btn-secondary mt-6 w-full py-3"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const firstImage = listing.images ? JSON.parse(listing.images)[0] : null;
  const serviceFee = listing.service_fee || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600">
            <ShieldCheck className="h-4 w-4" /> Owner Verification
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl">
            Is this your property?
          </h1>
          <p className="text-slate-500">
            An agent has listed this property. Please review and approve.
          </p>
        </div>

        {/* Property Card */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl">
          {firstImage && (
            <div className="relative h-64 w-full">
              <Image
                src={firstImage}
                alt="Property"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h2 className="text-xl font-bold text-white">
                  {listing.title}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/90">
                  <MapPin className="h-4 w-4" /> {listing.location}
                </p>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <p className="mb-1 text-sm font-bold text-slate-500 uppercase">
                  Listing Price
                </p>
                <p className="text-2xl font-bold text-[#10b981]">
                  LKR {listing.price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-sm font-bold text-slate-500 uppercase">
                  Commission
                </p>
                <p className="text-xl font-bold text-slate-700">
                  {listing.agreed_commission}%
                </p>
              </div>
            </div>

            <h3 className="mb-4 font-bold text-slate-800">Agent Proposal</h3>
            <div className="mb-8 flex items-start gap-4 rounded-2xl bg-blue-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">
                  Agent Service
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  I will manage inquiries, show the property, and negotiate the
                  best price for you.
                </p>
                {serviceFee > 0 ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                    <Banknote className="h-4 w-4" /> Service Fee: LKR{" "}
                    {serviceFee.toLocaleString()}
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                    <Banknote className="h-4 w-4" />
                    Free Service (Commission Only)
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={handleHireAgent}
                disabled={verifying}
                className="btn-primary py-4 text-lg bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {verifying ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Hire Agent
                    {serviceFee > 0 && (
                      <span className="block text-xs font-normal opacity-80">
                        Pay LKR {serviceFee.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={handleClaimFree}
                disabled={verifying}
                className="rounded-xl border-2 border-[#10b981] px-6 py-4 font-bold text-[#10b981] transition-colors hover:bg-green-50"
              >
                I'll Sell It Myself
                <span className="block text-xs font-normal text-green-600/70">
                  Claim for Free
                </span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleDecline}
                className="text-sm text-slate-400 transition-colors hover:text-red-500"
              >
                This is not my property / Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
