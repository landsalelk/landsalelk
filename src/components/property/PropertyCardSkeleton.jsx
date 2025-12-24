export function PropertyCardSkeleton() {
    return (
        <div className="glass-card rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-row md:flex-col h-full animate-pulse">
            {/* Image Skeleton */}
            <div className="relative w-[130px] md:w-auto md:aspect-[4/3] shrink-0 m-2 md:m-2 rounded-xl md:rounded-[1.5rem] bg-slate-200">
                {/* Skeleton Badges (Optional) */}
                <div className="absolute top-2 left-2 w-16 h-6 bg-white/50 rounded-full hidden md:block"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-3 md:p-5 flex flex-col flex-1 min-w-0 justify-center md:justify-start space-y-3">

                {/* Mobile Price Skeleton */}
                <div className="md:hidden flex items-center justify-between mb-1">
                    <div className="w-12 h-4 bg-slate-200 rounded"></div>
                    <div className="w-20 h-5 bg-slate-200 rounded"></div>
                </div>

                {/* Title Skeleton */}
                <div className="space-y-2">
                    <div className="w-full h-5 md:h-6 bg-slate-200 rounded-lg"></div>
                    <div className="w-2/3 h-5 md:h-6 bg-slate-200 rounded-lg hidden md:block"></div>
                </div>

                {/* Location Skeleton */}
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                    <div className="w-1/2 h-3 md:h-4 bg-slate-200 rounded"></div>
                </div>

                {/* Specs Skeleton */}
                <div className="mt-auto pt-2 md:pt-3 border-t border-slate-100 flex gap-2">
                    <div className="w-16 h-6 bg-slate-200 rounded-lg"></div>
                    <div className="w-16 h-6 bg-slate-200 rounded-lg"></div>
                    <div className="w-16 h-6 bg-slate-200 rounded-lg hidden md:block"></div>
                </div>
            </div>
        </div>
    );
}
