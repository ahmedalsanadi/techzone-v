import CategoryCardSkeleton from '@/components/ui/CategoryCardSkeleton';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';

function CategoryTabsSkeleton() {
    return (
        <div className="bg-transparent -mx-4 px-4 py-4 border-b border-gray-100 mb-8 overflow-hidden">
            <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide rtl justify-start lg:justify-center px-4 -mx-4 md:mx-0">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CategoryCardSkeleton key={i} index={i} />
                ))}
            </div>
        </div>
    );
}

function SubCategoryRowSkeleton() {
    return (
        <div className="w-full mb-6 overflow-hidden">
            <div className="bg-theme-primary/5 border border-theme-primary/10 rounded-2xl md:rounded-3xl py-3 md:py-8 px-2 md:px-4">
                <div className="flex items-stretch gap-4 md:gap-8 overflow-x-auto scrollbar-hide rtl justify-start lg:justify-center p-2">
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
        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} index={i} />
            ))}
        </div>
    );
}

export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50/30 pt-16 pb-20 px-8">
            <div className="container mx-auto px-4 mb-4">
                {/* Breadcrumbs skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                </div>
            </div>

            <CategoryTabsSkeleton />

            <div className="container mx-auto px-4 space-y-8 pb-20">
                {/* Subcategory rows skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <SubCategoryRowSkeleton key={i} />
                    ))}
                </div>

                <div className="min-h-[600px] flex flex-col">
                    <ProductsGridSkeleton />
                </div>
            </div>
        </main>
    );
}
