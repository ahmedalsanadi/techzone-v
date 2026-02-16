import CategoryCardSkeleton from '@/components/ui/CategoryCardSkeleton';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';

export default function Loading() {
    return (
        <div className="pb-12 bg-white animate-in fade-in duration-500">
            {/* Hero skeleton */}
            <section className="container mx-auto px-0 md:px-4 mt-8 md:mt-10">
                <div className="aspect-video md:aspect-21/9 w-full rounded-2xl md:rounded-[2.5rem] bg-gray-100 animate-pulse" />
            </section>

            <div className="container mx-auto px-4 mt-8">
                {/* Categories skeleton */}
                <section className="mt-8 mb-12">
                    <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <CategoryCardSkeleton key={i} index={i} />
                        ))}
                    </div>
                </section>

                {/* Products skeleton */}
                {Array.from({ length: 2 }).map((_, sectionIdx) => (
                    <section key={sectionIdx} className="mt-12 mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
                            <div className="h-9 w-24 rounded-xl bg-gray-100 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <ProductCardSkeleton key={i} index={i} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
