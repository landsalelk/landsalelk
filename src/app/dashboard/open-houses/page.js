'use client';

import { useState, useEffect } from 'react';
import { account } from '@/appwrite';
import { OpenHouseScheduler } from '@/components/dashboard/OpenHouseScheduler';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function OpenHousePage() {
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
        <div className="min-h-screen bg-slate-50 pt-24 pb-8">
            <div className="max-w-[1600px] mx-auto px-6">
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/dashboard" className="hover:text-emerald-600 flex items-center gap-1">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <span>/</span>
                    <span className="font-bold text-slate-800">Open Houses</span>
                </div>

                <OpenHouseScheduler userId={user.$id} />
            </div>
        </div>
    );
}
