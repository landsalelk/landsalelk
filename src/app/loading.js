import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#10b981] mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading...</p>
            </div>
        </div>
    );
}
