"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <Sidebar className="flex-shrink-0" />

                    {/* Main Content */}
                    <main className="flex-1 w-full min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
