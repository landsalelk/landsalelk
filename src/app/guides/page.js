import { AreaGuidesList } from '@/components/guides/AreaGuidesList';
import { MapPin } from 'lucide-react';

export const metadata = {
    title: 'Neighborhood Guides | LandSale.lk',
    description: 'Explore the best neighborhoods in Sri Lanka. In-depth guides on schools, lifestyle, and property trends.',
};

export default function AreaGuidesPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4 inline-block">
                        Local Insights
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Explore <span className="text-emerald-600">Neighborhoods</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Discover the perfect place to live. Get insider information on schools, amenities, market trends, and lifestyle in Sri Lanka's top locations.
                    </p>
                </div>

                <AreaGuidesList />
            </div>
        </div>
    );
}
