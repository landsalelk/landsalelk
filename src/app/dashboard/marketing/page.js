'use client';

import { useState, useEffect } from 'react';
import { account } from '@/appwrite';
import { MarketingTools } from '@/components/dashboard/MarketingTools';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function MarketingPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const session = await account.get();
                setUser(session);
            } catch (error) {
                // Handle redirect
            }
        };
        checkUser();
    }, []);

    if (!user) return null;

    return (
        <div className="animate-fade-in w-full">
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <Link href="/dashboard" className="hover:text-emerald-600 flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </Link>
                <span>/</span>
                <span className="font-bold text-slate-800">Marketing Tools</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Marketing Center</h1>
                <p className="text-slate-500 mt-2">Generate professional materials to promote your listings</p>
            </div>

            <MarketingTools userId={user.$id} />
        </div>
    );
}
