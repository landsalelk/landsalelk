"use client";

import { Home, Search, Heart, FileText, Users } from "lucide-react";
import Link from "next/link";

/**
 * EmptyState - Reusable component for empty data states
 * @param {string} type - Type of empty state (favorites, listings, messages, search, agents)
 * @param {string} title - Custom title (optional)
 * @param {string} description - Custom description (optional)
 * @param {string} actionText - CTA button text (optional)
 * @param {string} actionHref - CTA button link (optional)
 */
export function EmptyState({
    type = "default",
    title,
    description,
    actionText,
    actionHref,
    onAction,
}) {
    const configs = {
        favorites: {
            icon: Heart,
            iconColor: "text-red-400",
            iconBg: "bg-red-50",
            defaultTitle: "No Saved Properties Yet",
            defaultDescription: "Start exploring and save properties you love to see them here.",
            defaultAction: "Browse Properties",
            defaultHref: "/properties",
        },
        listings: {
            icon: Home,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-50",
            defaultTitle: "No Listings Yet",
            defaultDescription: "Create your first property listing to reach thousands of buyers.",
            defaultAction: "Create Listing",
            defaultHref: "/properties/create",
        },
        messages: {
            icon: FileText,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-50",
            defaultTitle: "No Messages",
            defaultDescription: "When you contact property owners or agents, your conversations will appear here.",
            defaultAction: "Find Properties",
            defaultHref: "/properties",
        },
        search: {
            icon: Search,
            iconColor: "text-slate-400",
            iconBg: "bg-slate-100",
            defaultTitle: "No Results Found",
            defaultDescription: "Try adjusting your filters or search for something else.",
            defaultAction: "Clear Filters",
            defaultHref: null,
        },
        agents: {
            icon: Users,
            iconColor: "text-purple-500",
            iconBg: "bg-purple-50",
            defaultTitle: "No Agents Found",
            defaultDescription: "We couldn't find any agents matching your criteria.",
            defaultAction: "View All Agents",
            defaultHref: "/agents",
        },
        default: {
            icon: FileText,
            iconColor: "text-slate-400",
            iconBg: "bg-slate-100",
            defaultTitle: "Nothing Here",
            defaultDescription: "There's no data to display at the moment.",
            defaultAction: null,
            defaultHref: null,
        },
    };

    const config = configs[type] || configs.default;
    const Icon = config.icon;

    const displayTitle = title || config.defaultTitle;
    const displayDescription = description || config.defaultDescription;
    const displayAction = actionText || config.defaultAction;
    const displayHref = actionHref || config.defaultHref;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {/* Icon */}
            <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mb-6`}>
                <Icon className={`w-10 h-10 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-slate-500 max-w-sm mb-6">
                {displayDescription}
            </p>

            {/* Action Button */}
            {displayAction && (displayHref || onAction) && (
                displayHref ? (
                    <Link
                        href={displayHref}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors min-h-[44px]"
                    >
                        {displayAction}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors min-h-[44px]"
                    >
                        {displayAction}
                    </button>
                )
            )}
        </div>
    );
}
