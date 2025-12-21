"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { account } from "@/appwrite";
import {
  getAgentProfile,
  getTrainingProgress,
  TRAINING_MODULES,
  getOverallProgress,
  formatTimeSpent,
  BADGES,
} from "@/lib/agent_training";
import {
  getUserListings,
  deleteProperty,
  renewProperty,
} from "@/lib/properties";
import {
  Loader2,
  Award,
  BookOpen,
  Home,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  Trophy,
  BarChart3,
  Building2,
  Shield,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateProfileCompleteness,
  getMissingFields,
} from "@/lib/profileUtils";

export default function AgentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const u = await account.get();
        setUser(u);

        const profile = await getAgentProfile(u.$id);
        setAgentProfile(profile);

        const progress = getTrainingProgress();
        setTrainingProgress(progress);

        const userListings = await getUserListings(u.$id);
        setListings(userListings);
        setStats({
          totalListings: userListings.length,
          activeListings: userListings.filter((l) => l.status === "active")
            .length,
          totalViews: userListings.reduce(
            (sum, l) => sum + (l.views_count || 0),
            0,
          ),
          totalInquiries: userListings.reduce(
            (sum, l) => sum + (l.inquiry_count || 0),
            0,
          ),
        });
      } catch (e) {
        console.error(e);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const isTrainingComplete =
    trainingProgress?.completedModules?.length === TRAINING_MODULES.length;
  const earnedBadges = trainingProgress?.badges || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Agent Dashboard
            </h1>
            <p className="text-slate-500">
              Welcome back, {user?.name || "Agent"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/properties/create"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-bold text-white transition-all hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Listing
            </Link>
            <Link
              href="/agent/training"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-800"
            >
              <GraduationCap className="h-5 w-5" />
              Training
            </Link>
          </div>
        </div>

        {/* Training Status Banner */}
        {!isTrainingComplete && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Complete Your Training</h3>
                  <p className="text-sm text-white/80">
                    {overallProgress}% complete •{" "}
                    {TRAINING_MODULES.length -
                      (trainingProgress?.completedModules?.length || 0)}{" "}
                    modules remaining
                  </p>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 md:w-auto">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20 md:w-48">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <Link
                  href="/agent/training"
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-2 font-bold text-amber-600 transition-all hover:shadow-lg"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Certified Badge */}
        {isTrainingComplete && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">Certified Agent</h3>
                  <span className="rounded bg-white/20 px-2 py-1 text-xs font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-sm text-white/80">
                  You've completed all training modules • {earnedBadges.length}{" "}
                  badges earned
                </p>
              </div>
              <Link
                href="/agent/training"
                className="ml-auto rounded-xl bg-white/20 px-6 py-2 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                View Certificate
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalListings}
            </div>
            <div className="text-sm text-slate-500">Total Listings</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalViews}
            </div>
            <div className="text-sm text-slate-500">Total Views</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalInquiries}
            </div>
            <div className="text-sm text-slate-500">Inquiries</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {earnedBadges.length}
            </div>
            <div className="text-sm text-slate-500">Badges Earned</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* My Listings */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Home className="h-5 w-5 text-emerald-500" />
                  My Listings
                </h2>
                <Link
                  href="/properties/create"
                  className="text-sm font-medium text-emerald-600 hover:underline"
                >
                  + Add New
                </Link>
              </div>

              {listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.slice(0, 5).map((listing) => (
                    <div
                      key={listing.$id}
                      className="group flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50"
                    >
                      <Link
                        href={`/properties/${listing.$id}`}
                        className="flex min-w-0 flex-1 items-center gap-4"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                          {listing.images?.[0] && (
                            <Image
                              src={
                                listing.images[0].startsWith("http")
                                  ? listing.images[0]
                                  : `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'}/storage/buckets/listing_images/files/${listing.images[0]}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'}`
                              }
                              alt={listing.title || "Property listing image"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-emerald-600">
                            {listing.title}
                          </h4>
                          <p className="truncate text-sm text-slate-500">
                            {listing.location}
                          </p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />{" "}
                              {listing.views_count || 0}
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 ${listing.status === "active"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {listing.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-emerald-500" />
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/properties/${listing.$id}/edit`}
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                          title="Edit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Promote this listing to the top? This will renew it and make it active.",
                              )
                            ) {
                              try {
                                await renewProperty(listing.$id);
                                toast.success("Listing promoted successfully!");
                                // Refresh listings
                                const user = await account.get();
                                const userListings = await getUserListings(
                                  user.$id,
                                );
                                setListings(userListings);
                                setStats({
                                  totalListings: userListings.length,
                                  activeListings: userListings.filter(
                                    (l) => l.status === "active",
                                  ).length,
                                  totalViews: userListings.reduce(
                                    (sum, l) => sum + (l.views_count || 0),
                                    0,
                                  ),
                                  totalInquiries: userListings.reduce(
                                    (sum, l) => sum + (l.inquiry_count || 0),
                                    0,
                                  ),
                                });
                              } catch (error) {
                                console.error(error);
                                toast.error("Failed to promote listing");
                              }
                            }
                          }}
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          title="Promote/Renew"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Are you sure you want to delete this listing? This action cannot be undone.",
                              )
                            ) {
                              try {
                                await deleteProperty(listing.$id);
                                toast.success("Listing deleted successfully");
                                // Refresh listings
                                const user = await account.get();
                                const userListings = await getUserListings(
                                  user.$id,
                                );
                                setListings(userListings);
                                setStats({
                                  totalListings: userListings.length,
                                  activeListings: userListings.filter(
                                    (l) => l.status === "active",
                                  ).length,
                                  totalViews: userListings.reduce(
                                    (sum, l) => sum + (l.views_count || 0),
                                    0,
                                  ),
                                  totalInquiries: userListings.reduce(
                                    (sum, l) => sum + (l.inquiry_count || 0),
                                    0,
                                  ),
                                });
                              } catch (error) {
                                console.error(error);
                                toast.error("Failed to delete listing");
                              }
                            }
                          }}
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 font-bold text-slate-700">
                    No listings yet
                  </h3>
                  <p className="mb-4 text-sm text-slate-500">
                    Create your first property listing
                  </p>
                  <Link
                    href="/properties/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 font-medium text-white"
                  >
                    <Plus className="h-4 w-4" /> Add Listing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Training Progress */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                Training Progress
              </h2>

              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">Overall Progress</span>
                  <span className="font-bold text-emerald-600">
                    {overallProgress}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="mb-4 space-y-3">
                {TRAINING_MODULES.slice(0, 4).map((module, idx) => {
                  const isComplete =
                    trainingProgress?.completedModules?.includes(module.id);
                  return (
                    <div key={module.id} className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isComplete
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                          }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`truncate text-sm ${isComplete ? "text-slate-600" : "text-slate-400"}`}
                      >
                        {module.title}
                      </span>
                    </div>
                  );
                })}
                {TRAINING_MODULES.length > 4 && (
                  <div className="pl-9 text-xs text-slate-400">
                    +{TRAINING_MODULES.length - 4} more modules
                  </div>
                )}
              </div>

              <Link
                href="/agent/training"
                className="block w-full rounded-xl bg-slate-900 py-3 text-center font-bold text-white transition-colors hover:bg-slate-800"
              >
                {isTrainingComplete ? "View Certificate" : "Continue Training"}
              </Link>
            </div>

            {/* Profile Completeness */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Award className="h-5 w-5 text-blue-500" />
                Profile Strength
              </h2>
              {agentProfile ? (
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-500">Completeness</span>
                    <span className="font-bold text-blue-600">
                      {calculateProfileCompleteness(agentProfile)}%
                    </span>
                  </div>
                  <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${calculateProfileCompleteness(agentProfile) === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{
                        width: `${calculateProfileCompleteness(agentProfile)}%`,
                      }}
                    />
                  </div>

                  {calculateProfileCompleteness(agentProfile) < 100 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">
                        Missing Details:
                      </p>
                      {getMissingFields(agentProfile).map((field) => (
                        <div
                          key={field.key}
                          className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-600"
                        >
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                          {field.label}
                        </div>
                      ))}
                      <Link
                        href="/profile"
                        className="mt-2 block text-center text-xs font-bold text-blue-600 hover:underline"
                      >
                        Complete Profile
                      </Link>
                    </div>
                  )}
                  {calculateProfileCompleteness(agentProfile) === 100 && (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                      <CheckCircle className="h-4 w-4" /> All Set!
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Loading profile...</div>
              )}
            </div>

            {/* Badges (Existing) */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Trophy className="h-5 w-5 text-amber-500" />
                Badges
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(BADGES)
                  .slice(0, 8)
                  .map((badge) => {
                    const isEarned = earnedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`flex aspect-square items-center justify-center rounded-xl text-2xl ${isEarned
                            ? "border-2 border-amber-200 bg-gradient-to-br from-amber-100 to-amber-50"
                            : "bg-slate-100 opacity-30 grayscale"
                          }`}
                        title={badge.name}
                      >
                        {badge.icon}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                >
                  <Settings className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">Edit Profile</span>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                >
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">Messages</span>
                </Link>
                <Link
                  href="/kyc"
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                >
                  <Shield className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">Verification Status</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
