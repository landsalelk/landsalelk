"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb - Navigation breadcrumb component
 * @param {Array} items - Array of {label, href} objects
 */
export function Breadcrumb({ items = [] }) {
    if (!items || items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-sm">
                {/* Home link */}
                <li>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors min-h-[44px] px-1"
                    >
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center gap-1">
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            {isLast ? (
                                <span className="text-slate-700 font-medium px-1" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-slate-400 hover:text-emerald-600 transition-colors min-h-[44px] inline-flex items-center px-1"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
