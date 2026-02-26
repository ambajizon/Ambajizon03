/**
 * Reusable skeleton components for lazy-loading states.
 * They pulse to indicate loading and match the shape of real content.
 */

export function SkeletonPulse({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

/** Matches the shopkeeper metric card shape */
export function MetricCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <SkeletonPulse className="w-10 h-10 rounded-xl" />
            <SkeletonPulse className="w-16 h-7" />
            <SkeletonPulse className="w-24 h-3" />
        </div>
    )
}

/** Matches the mobile order card shape */
export function OrderCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                    <SkeletonPulse className="w-28 h-4" />
                    <SkeletonPulse className="w-36 h-3" />
                </div>
                <SkeletonPulse className="w-16 h-6 rounded-lg" />
            </div>
            <div className="space-y-1">
                <SkeletonPulse className="w-40 h-4" />
                <SkeletonPulse className="w-24 h-3" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <SkeletonPulse className="w-16 h-5 rounded-full" />
                <SkeletonPulse className="w-20 h-5" />
            </div>
        </div>
    )
}

/** Matches the product row shape */
export function ProductRowSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
            <SkeletonPulse className="w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <SkeletonPulse className="w-3/4 h-4" />
                <SkeletonPulse className="w-1/2 h-3" />
            </div>
            <SkeletonPulse className="w-12 h-6 rounded-full shrink-0" />
        </div>
    )
}

/** Matches the CRM customer card shape */
export function CustomerCardSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
                <SkeletonPulse className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <SkeletonPulse className="w-36 h-4" />
                    <SkeletonPulse className="w-24 h-3" />
                </div>
                <SkeletonPulse className="w-14 h-5 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-gray-100">
                <SkeletonPulse className="h-8 rounded-lg" />
                <SkeletonPulse className="h-8 rounded-lg" />
                <SkeletonPulse className="h-8 rounded-lg" />
            </div>
        </div>
    )
}

/** Matches a storefront product grid card */
export function ProductGridSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
            <SkeletonPulse className="w-full aspect-square rounded-none" />
            <div className="p-3 space-y-2 mt-auto">
                <SkeletonPulse className="w-full h-4" />
                <SkeletonPulse className="w-2/3 h-5 mt-2" />
                <SkeletonPulse className="w-full h-8 mt-2 rounded-lg" />
            </div>
        </div>
    )
}

/** Matches the storefront horizontal category rail item shape */
export function CategoryRailSkeleton() {
    return (
        <div className="flex-shrink-0 w-[76px] flex flex-col items-center gap-2">
            <SkeletonPulse className="w-[68px] h-[68px] rounded-full" />
            <SkeletonPulse className="w-12 h-3 mx-auto" />
        </div>
    )
}
