"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAgencyBySlug } from "@/lib/agency";
import { databases, Query } from "@/lib/appwrite";
import { DB_ID, COLLECTION_LISTINGS, COLLECTION_AGENTS } from "@/appwrite/config";
import { formatShortPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
    Building2,
    ShieldCheck,
    MapPin,
    Phone,
    Mail,
    Globe,
    Loader2,
    Home,
    Users,
    Scale,
    ExternalLink,
    Calendar,
    Star,
} from "lucide-react";

export default function AgencyPublicProfile() {
    const params = useParams();
    const slug = params.slug;

    const [agency, setAgency] = useState(null);
    const [listings, setListings] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgencyData = async () => {
            try {
                // Fetch agency
                const agencyData = await getAgencyBySlug(slug);
                if (!agencyData) {
                    setError("Agency not found");
                    setLoading(false);
                    return;
                }

                // Only show approved agencies publicly
                if (agencyData.status !== "approved") {
                    setError("This agency is not yet verified");
                    setLoading(false);
                    return;
                }

                setAgency(agencyData);

                // Fetch agency's listings (placeholder - would need agency_id on listings)
                // For now, we'll show listings from the owner
                try {
                    const listingsRes = await databases.listDocuments(
                        DB_ID,
                        COLLECTION_LISTINGS,
                        [
                            Query.equal("user_id", agencyData.owner_id),
                            Query.equal("status", "active"),
                            Query.limit(6),
                            Query.orderDesc("$createdAt"),
                        ]
                    );
                    setListings(listingsRes.documents);
                } catch (e) {
                    console.warn("Could not fetch listings:", e);
                }

                // Fetch agents under this agency (if agency_id field exists on agents)
                // This is a placeholder for future implementation
                try {
                    const agentsRes = await databases.listDocuments(
                        DB_ID,
                        COLLECTION_AGENTS,
                        [
                            Query.equal("agency_id", agencyData.$id),
                            Query.equal("is_verified", true),
                            Query.limit(10),
                        ]
                    );
                    setAgents(agentsRes.documents);
                } catch (e) {
                    // agency_id field may not exist yet on agents
                    console.warn("Could not fetch agents for agency:", e);
                }
            } catch (err) {
                console.error("Error fetching agency:", err);
                setError("Failed to load agency profile");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchAgencyData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <Building2 className="mx-auto h-16 w-16 text-slate-300" />
                    <h1 className="mt-4 text-2xl font-bold text-slate-800">{error}</h1>
                    <p className="mt-2 text-slate-500">
                        The agency you&apos;re looking for doesn&apos;t exist or isn&apos;t available.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const formatPrice = (price) => formatShortPrice(price, 'LKR');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                        {/* Logo */}
                        <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            {agency.logo_url ? (
                                <Image
                                    src={agency.logo_url}
                                    alt={agency.name}
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 rounded-xl object-cover"
                                />
                            ) : (
                                <Building2 className="h-14 w-14 text-white/70" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                <h1 className="text-3xl font-bold text-white md:text-4xl">
                                    {agency.name}
                                </h1>
                                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400">
                                    <ShieldCheck className="h-4 w-4" />
                                    Lawyer Verified
                                </div>
                            </div>

                            {agency.description && (
                                <p className="mx-auto max-w-2xl text-lg text-white/70 md:mx-0">
                                    {agency.description}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60 md:justify-start">
                                {agency.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {agency.city}
                                        {agency.district && `, ${agency.district}`}
                                    </span>
                                )}
                                {agency.verified_at && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Verified{" "}
                                        {new Date(agency.verified_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-emerald-100 p-3">
                                        <Home className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Active Listings</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {agency.total_listings || listings.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-blue-100 p-3">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Agents</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {agency.total_agents || agents.length || 1}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-amber-100 p-3">
                                        <Scale className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Legal Partner</p>
                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                                            {agency.lawyer_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lawyer Verification Badge */}
                        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-emerald-100 p-3">
                                    <ShieldCheck className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-900 text-lg">
                                        Lawyer-Verified Agency
                                    </h3>
                                    <p className="mt-1 text-emerald-700/80">
                                        This agency has been verified by <strong>{agency.lawyer_name}</strong>.
                                        All listings from this agency undergo legal verification to ensure
                                        authenticity and compliance.
                                    </p>
                                    {agency.lawyer_regnum && (
                                        <p className="mt-2 text-sm text-emerald-600">
                                            Registration: {agency.lawyer_regnum}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Listings Section */}
                        {listings.length > 0 && (
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Featured Listings
                                    </h2>
                                    <Link
                                        href={`/properties?agency=${agency.slug}`}
                                        className="text-sm font-medium text-emerald-600 hover:underline"
                                    >
                                        View All →
                                    </Link>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {listings.map((listing) => (
                                        <Link
                                            key={listing.$id}
                                            href={`/properties/${listing.slug}`}
                                            className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                                {listing.images?.[0] ? (
                                                    <Image
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Home className="h-10 w-10 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600">
                                                    {listing.title}
                                                </h3>
                                                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                                    <MapPin className="h-3 w-3" />
                                                    {listing.location}
                                                </p>
                                                <p className="mt-2 text-lg font-bold text-emerald-600">
                                                    LKR {formatPrice(listing.price)}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Agents Section */}
                        {agents.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-xl font-bold text-slate-900">
                                    Our Agents
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {agents.map((agent) => (
                                        <Link
                                            key={agent.$id}
                                            href={`/agents/${agent.$id}`}
                                            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                {agent.avatar_url ? (
                                                    <Image
                                                        src={agent.avatar_url}
                                                        alt={agent.name}
                                                        width={56}
                                                        height={56}
                                                        className="h-14 w-14 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-400">
                                                        {agent.name?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900">{agent.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {agent.experience_years} years experience
                                                </p>
                                                {agent.rating > 0 && (
                                                    <div className="mt-1 flex items-center gap-1 text-amber-500">
                                                        <Star className="h-3 w-3 fill-current" />
                                                        <span className="text-sm font-medium">
                                                            {agent.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">
                                Contact Agency
                            </h3>
                            <div className="space-y-4">
                                <a
                                    href={`tel:${agency.contact_phone}`}
                                    className="flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 transition-colors"
                                >
                                    <Phone className="h-5 w-5" />
                                    {agency.contact_phone}
                                </a>

                                {agency.contact_email && (
                                    <a
                                        href={`mailto:${agency.contact_email}`}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Mail className="h-5 w-5 text-slate-400" />
                                        <span className="truncate">{agency.contact_email}</span>
                                    </a>
                                )}

                                {agency.website && (
                                    <a
                                        href={agency.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Globe className="h-5 w-5 text-slate-400" />
                                        <span className="truncate">Visit Website</span>
                                        <ExternalLink className="h-4 w-4 ml-auto text-slate-400" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Address Card */}
                        {agency.address && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h3 className="mb-3 text-lg font-bold text-slate-900">
                                    Office Location
                                </h3>
                                <p className="text-slate-600">
                                    {agency.address}
                                    {agency.city && <>, {agency.city}</>}
                                    {agency.district && <>, {agency.district}</>}
                                </p>
                            </div>
                        )}

                        {/* Social Links */}
                        {agency.social_facebook && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h3 className="mb-3 text-lg font-bold text-slate-900">
                                    Follow Us
                                </h3>
                                <a
                                    href={agency.social_facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    Facebook Page
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        )}

                        {/* CTA Card */}
                        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                            <h3 className="text-lg font-bold">Looking to list your property?</h3>
                            <p className="mt-2 text-sm text-white/70">
                                Get lawyer-verified listings and premium exposure for your property.
                            </p>
                            <Link
                                href="/properties/create"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white hover:bg-emerald-400 transition-colors"
                            >
                                <Home className="h-4 w-4" />
                                List Your Property
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
