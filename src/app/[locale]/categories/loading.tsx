import CategoryCardSkeleton from '@/components/ui/CategoryCardSkeleton';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';

function CategoryTabsSkeleton() {
    return (
        <div className="bg-transparent -mx-4 px-4 py-2 border-b border-gray-100 mb-4 overflow-hidden">
            <div className="flex items-center gap-3 md:gap-4 overflow-x-auto py-2 scrollbar-hide rtl justify-start lg:justify-center px-4 -mx-4 md:mx-0">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CategoryCardSkeleton key={i} index={i} />
                ))}
            </div>
        </div>
    );
}

function SubCategoryRowSkeleton() {
    return (
        <div className="w-full mb-4 overflow-hidden">
            <div className="bg-theme-primary/5 border border-theme-primary/10 rounded-xl md:rounded-2xl py-2 md:py-4 px-2 md:px-3">
                <div className="flex items-stretch gap-3 md:gap-4 overflow-x-auto scrollbar-hide rtl justify-start lg:justify-center p-1.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProductsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} index={i} />
            ))}
        </div>
    );
}

export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50/30 space-y-4">
            {/* Breadcrumbs skeleton - compact */}
            <div className="flex items-center gap-1.5 mt-2">
                <div className="h-3.5 w-16 rounded bg-gray-100 animate-pulse" />
                <div className="h-3.5 w-3.5 rounded bg-gray-100 animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-gray-100 animate-pulse" />
            </div>

            <CategoryTabsSkeleton />

            <div className="container mx-auto px-4 space-y-4 pb-20">
                {/* Subcategory rows skeleton */}
                <div className="space-y-3">
                    {Array.from({ length: 1 }).map((_, i) => (
                        <SubCategoryRowSkeleton key={i} />
                    ))}
                </div>

                <div className="min-h-[400px] flex flex-col">
                    <ProductsGridSkeleton />
                </div>
            </div>
        </main>
    );
}
