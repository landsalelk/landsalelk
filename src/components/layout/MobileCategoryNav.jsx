'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

export function MobileCategoryNav({ navLinks }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentType = searchParams.get('type');

    return (
        <div className="md:hidden mt-2 overflow-x-auto hide-scrollbar pb-2 pl-1">
            <div className="flex gap-3 whitespace-nowrap">
                {navLinks.map((link) => {
                    // Simple active check logic
                    const isActive = (currentType && link.href.includes(`type=${currentType}`)) ||
                        (!currentType && link.href === pathname);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${isActive
                                ? 'bg-[#10b981] text-white border-[#10b981] shadow-md'
                                : 'bg-white text-slate-600 border-white/50 hover:bg-slate-50'
                                }`}
                        >
                            {link.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
