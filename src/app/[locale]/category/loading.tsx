import React from 'react';

function SmallTileSkeleton() {
    return (
        <div className="flex flex-col w-[88px] sm:w-[100px] md:w-[116px] shrink-0">
            <div className="flex flex-col rounded-2xl overflow-hidden ring-2 ring-transparent shadow-sm bg-white/60 border border-white/80">
                {/* Image area */}
                <div className="relative w-full aspect-square flex items-center justify-center p-3 overflow-hidden">
                    <div className="relative w-full h-full min-h-[44px] min-w-[44px] rounded-xl overflow-hidden bg-gray-100 animate-pulse" />
                </div>
                {/* Label */}
                <div className="h-11 px-2 pb-2 pt-1 text-center flex items-end justify-center">
                    <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function CategoryTabsSkeleton() {
    return (
        <div className="bg-transparent -mx-4 px-4 py-4 border-b border-gray-100 mb-8 overflow-hidden">
            <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide rtl justify-start lg:justify-center px-4 -mx-4 md:mx-0">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SmallTileSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

function SubCategoryRowSkeleton() {
    return (
        <div className="w-full mb-6 overflow-hidden">
            <div className="bg-theme-primary/4 border border-theme-primary/30 rounded-2xl md:rounded-3xl py-3 md:py-8 px-2 md:px-4">
                <div className="flex items-stretch gap-4 md:gap-8 overflow-x-auto scrollbar-hide rtl justify-start lg:justify-center p-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <SmallTileSkeleton key={i} />
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
                <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center gap-4 animate-pulse shadow-sm">
                    <div className="w-full aspect-square bg-gray-100 rounded-2xl" />
                    <div className="w-3/4 h-5 bg-gray-100 rounded-md" />
                    <div className="w-1/2 h-6 bg-gray-100 rounded-md mt-auto" />
                    <div className="w-full h-10 bg-gray-50 rounded-xl" />
                </div>
            ))}
        </div>
    );
}

export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
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
                        <div key={i} className="animate-pulse">
                            <SubCategoryRowSkeleton />
                        </div>
                    ))}
                </div>

                <div className="min-h-[600px] flex flex-col">
                    <ProductsGridSkeleton />
                </div>
            </div>
        </main>
    );
}

