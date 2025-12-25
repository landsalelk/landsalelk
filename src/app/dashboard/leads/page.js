'use client';

import { useState, useEffect } from 'react';
import { account } from '@/appwrite';
import { LeadCRM } from '@/components/dashboard/LeadCRM';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function LeadsPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const session = await account.get();
                setUser(session);
            } catch (error) {
                // Handle redirect or error
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
                <span className="font-bold text-slate-800">Leads</span>
            </div>

            <LeadCRM userId={user.$id} />
        </div>
    );
}
