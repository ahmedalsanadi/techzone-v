import OffersPageSkeleton from '@/components/offers/OffersPageSkeleton';

export default function Loading() {
    return (
        <section className="min-h-screen bg-gray-50/30 space-y-6">
            {/* Breadcrumbs skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
            </div>

            <OffersPageSkeleton />
        </section>
    );
}
