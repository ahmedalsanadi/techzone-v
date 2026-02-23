import CategoryCardSkeleton from '@/components/ui/CategoryCardSkeleton';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';

export default function Loading() {
    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Hero skeleton */}
            <div className="aspect-video md:aspect-21/9 w-full rounded-2xl md:rounded-[32px] bg-gray-100 animate-pulse" />

            <div className="space-y-12">
                {/* Categories skeleton */}
                <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} index={i} />
                    ))}
                </div>

                {/* Products skeleton */}
                {Array.from({ length: 2 }).map((_, sectionIdx) => (
                    <div key={sectionIdx} className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
                            <div className="h-9 w-24 rounded-xl bg-gray-100 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <ProductCardSkeleton key={i} index={i} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
