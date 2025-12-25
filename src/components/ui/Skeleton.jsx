/**
 * Skeleton - Reusable loading skeleton components
 */

export function SkeletonBlock({ className = "" }) {
    return (
        <div
            className={`bg-slate-200 rounded-lg animate-pulse ${className}`}
            style={{ animationDuration: "2s" }}
        />
    );
}

export function SkeletonText({ lines = 1, className = "" }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-slate-200 rounded animate-pulse"
                    style={{
                        width: i === lines - 1 && lines > 1 ? "60%" : "100%",
                        animationDuration: "2s",
                    }}
                />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = "md", className = "" }) {
    const sizes = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
    };

    return (
        <div
            className={`${sizes[size]} bg-slate-200 rounded-full animate-pulse ${className}`}
            style={{ animationDuration: "2s" }}
        />
    );
}

export function PropertyCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            {/* Image skeleton */}
            <div className="aspect-[4/3] bg-slate-200 animate-pulse" style={{ animationDuration: "2s" }} />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                <SkeletonText lines={1} className="w-3/4" />
                <SkeletonText lines={1} className="w-1/2" />
                <div className="flex gap-2 pt-2">
                    <SkeletonBlock className="w-16 h-6" />
                    <SkeletonBlock className="w-16 h-6" />
                    <SkeletonBlock className="w-16 h-6" />
                </div>
            </div>
        </div>
    );
}

export function AgentCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
            <div className="flex justify-center mb-4">
                <SkeletonCircle size="xl" />
            </div>
            <SkeletonText lines={1} className="w-2/3 mx-auto mb-2" />
            <SkeletonText lines={1} className="w-1/2 mx-auto" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }) {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <SkeletonBlock className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function DashboardStatSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
                <SkeletonCircle size="md" />
                <div className="flex-1">
                    <SkeletonText lines={1} className="w-1/2 mb-2" />
                    <SkeletonBlock className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}
