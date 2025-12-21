"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { account, storage } from "@/appwrite";
import {
  getPendingKYCRequests,
  updateKYCStatus,
  getKYCFileView,
} from "@/lib/kyc";
import { getPlatformStats } from "@/lib/analytics";
import {
  ShieldCheck,
  XCircle,
  CheckCircle,
  Loader2,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Wallet,
  Building,
  MessageSquare,
  Star,
  Trash2,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BUCKET_KYC, DB_ID, COLLECTION_REVIEWS } from "@/appwrite/config";
import { AdminCoupons } from "@/components/admin/AdminCoupons";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { EmailTemplates } from "@/components/admin/EmailTemplates";
import { SubscriptionPlans } from "@/components/admin/SubscriptionPlans";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAgents } from "@/components/admin/AdminAgents";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { databases } from "@/appwrite";
import { Query } from "appwrite";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    totalRevenue: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("kyc");

  const checkAuth = useCallback(async () => {
    try {
      const user = await account.get();

      // Properly check if user has admin label or is in admins team
      const hasAdminLabel = user.labels && user.labels.includes("admin");
      const hasAdminRole = user.prefs && user.prefs.role === "admin";

      if (!hasAdminLabel && !hasAdminRole) {
        // User is logged in but not an admin
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // User is admin, fetch admin data
      try {
        const [pending, platformStats, pendingReviews] = await Promise.all([
          getPendingKYCRequests(),
          getPlatformStats(),
          databases.listDocuments(DB_ID, COLLECTION_REVIEWS, [
            Query.equal("is_approved", false),
            Query.orderDesc("$createdAt"),
          ]),
        ]);
        setRequests(pending);
        setStats(platformStats);
        setReviews(pendingReviews.documents);
        setIsAdmin(true);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        // Even if data fetch fails, user is still admin
        setIsAdmin(true);
      }
    } catch (e) {
      // Not logged in
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleDecision = async (id, status) => {
    try {
      await updateKYCStatus(id, status);
      toast.success(`Request ${status} successfully`);
      setRequests((prev) => prev.filter((r) => r.$id !== id));
    } catch (e) {
      toast.error("Action failed");
      console.error(e);
    }
  };

  const handleReviewDecision = async (id, action) => {
    try {
      if (action === "approve") {
        await databases.updateDocument(DB_ID, COLLECTION_REVIEWS, id, {
          is_approved: true,
        });
        toast.success("Review approved!");
      } else {
        await databases.deleteDocument(DB_ID, COLLECTION_REVIEWS, id);
        toast.success("Review deleted");
      }
      setReviews((prev) => prev.filter((r) => r.$id !== id));
    } catch (e) {
      toast.error("Failed to process review");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!isAdmin && requests.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <AlertTriangle className="mb-4 h-16 w-16 text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="mb-6 max-w-md text-center text-slate-500">
          You do not have permission to view this page. Ensure you are logged in
          as an administrator (Label: admin or Team: admins).
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            Admin Portal
          </h1>
          <p className="text-slate-500">
            Manage identity verification requests.
          </p>
        </header>

        {/* Analytics Cards */}
        {/* ... (leaving analytics as is for now) ... */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* ... (reconstruct analytics cards) ... */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-500">Est. Revenue</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              LKR {stats.totalRevenue.toLocaleString()}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Building className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-500">Total Listings</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {stats.totalListings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-4">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-500">KYC Requests</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {stats.totalUsers}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-4">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-500">
                Verified Members
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {stats.verifiedUsers}
            </h3>
          </div>
        </div>

        <div className="mb-8 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("kyc")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "kyc" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            KYC Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "reviews" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Pending Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "coupons" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "logs" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "templates" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "plans" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Plans
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "users" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "agents" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-2 pb-4 font-bold transition-all ${activeTab === "analytics" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeTab === "agents" && <AdminAgents />}
          {activeTab === "kyc" &&
            (requests.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-100" />
                <h3 className="text-xl font-bold text-slate-900">
                  All caught up!
                </h3>
                <p className="text-slate-500">No pending KYC requests.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.$id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:flex-row"
                >
                  {/* Metadata using our storage file view logic could be added here if we had direct access to User name */}
                  <div className="border-b border-slate-100 p-6 md:w-1/3 md:border-r md:border-b-0">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 uppercase">
                        {req.request_type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(req.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold">
                      User ID: {req.user_id}
                    </h3>
                    <p className="mb-6 font-mono text-xs text-slate-400">
                      {req.$id}
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleDecision(req.$id, "approved")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleDecision(req.$id, "rejected")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 font-bold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Images Preview */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 md:w-2/3">
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-500 uppercase">
                        Front ID
                      </p>
                      <div className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {/* We use getKYCFileView to generate the URL */}
                        <Image
                          src={storage
                            .getFileView(BUCKET_KYC, req.nic_front_id)
                            .toString()}
                          alt="NIC Front ID"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <a
                          href={storage.getFileView(
                            BUCKET_KYC,
                            req.nic_front_id,
                          )}
                          target="_blank"
                          className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <FileText className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-500 uppercase">
                        Back ID
                      </p>
                      <div className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <Image
                          src={storage
                            .getFileView(BUCKET_KYC, req.nic_back_id)
                            .toString()}
                          alt="NIC Back ID"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <a
                          href={storage.getFileView(
                            BUCKET_KYC,
                            req.nic_back_id,
                          )}
                          target="_blank"
                          className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <FileText className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ))}

          {activeTab === "reviews" &&
            (reviews.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-emerald-100" />
                <h3 className="text-xl font-bold text-slate-900">
                  No pending reviews
                </h3>
                <p className="text-slate-500">
                  All user reviews have been moderated.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Reviewer</th>
                      <th className="px-6 py-4">Target (Agent/Listing)</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Comment</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviews.map((rev) => (
                      <tr
                        key={rev.$id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {rev.user_id}
                          <span className="mt-0.5 block font-mono text-xs text-slate-400">
                            {new Date(rev.$createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {rev.agent_id
                            ? "Agent: " + rev.agent_id
                            : "Listing: " + rev.listing_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-bold text-slate-700">
                              {rev.rating}
                            </span>
                          </div>
                        </td>
                        <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-600">
                          {rev.comment}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleReviewDecision(rev.$id, "approve")
                              }
                              className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100"
                              title="Approve"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleReviewDecision(rev.$id, "delete")
                              }
                              className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>

        {activeTab === "coupons" && <AdminCoupons />}
        {activeTab === "logs" && <AuditLogs />}
        {activeTab === "templates" && <EmailTemplates />}
        {activeTab === "plans" && <SubscriptionPlans />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
      </div>
    </div>
  );
}
