import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col gap-10 md:gap-16 pb-24 relative pt-12 px-2 md:px-6 max-w-7xl mx-auto w-full">
            {/* Breadcrumbs skeleton */}
            <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-16 rounded" />
                <div className="h-1 w-1 rounded-full bg-gray-200" />
                <Skeleton className="h-4 w-20 rounded" />
                <div className="h-1 w-1 rounded-full bg-gray-200" />
                <Skeleton className="h-4 w-40 rounded" />
            </div>

            <div className="flex flex-col gap-10">
                {/* Top Section: Info & Gallery (Split Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                    {/* Info Column (Mobile Order 2) */}
                    <div className="lg:col-span-7 flex flex-col gap-8 order-2">
                        {/* Share actions */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-10 md:size-11 rounded-full" />
                            <Skeleton className="size-10 md:size-11 rounded-full" />
                            <Skeleton className="size-10 md:size-11 rounded-full" />
                        </div>

                        {/* ProductInfo skeleton */}
                        <div className="space-y-6">
                            {/* Badges */}
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-4/5 rounded" />
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-32 rounded-lg" />
                                <Skeleton className="h-6 w-20 rounded-lg opacity-30" />
                            </div>

                            {/* Prep / Calories InfoItems */}
                            <div className="flex items-center gap-4 mt-2">
                                <Skeleton className="h-12 w-36 rounded-2xl" />
                                <Skeleton className="h-12 w-36 rounded-2xl" />
                            </div>
                        </div>

                        {/* Notes textarea skeleton */}
                        <div className="space-y-3 mt-4">
                            <Skeleton className="h-5 w-24 rounded" />
                            <Skeleton className="h-32 w-full rounded-2xl border border-gray-100" />
                        </div>

                        {/* ProductActionBar skeleton */}
                        <div className="border-t border-gray-100 pt-8 mt-auto">
                            <div className="flex items-center justify-end gap-5">
                                <Skeleton className="h-14 w-36 rounded-xl" />
                                <Skeleton className="h-14 w-64 rounded-xl shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Gallery Column (Mobile Order 1) */}
                    <div className="lg:col-span-5 order-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Main Swiper Area */}
                            <div className="relative w-full aspect-video md:aspect-square rounded-4xl overflow-hidden bg-gray-50 border border-gray-100/50">
                                <Skeleton className="w-full h-full" />
                            </div>

                            {/* Thumbnails (Simulating Swiper Pagination/Thumbs) */}
                            <div className="flex items-center justify-center gap-2">
                                <Skeleton className="size-2 rounded-full" />
                                <Skeleton className="size-2 rounded-full" />
                                <Skeleton className="size-2.5 rounded-full bg-gray-300" />
                                <Skeleton className="size-2 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Grid (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-12 border-t border-gray-50">
                {/* Variant Selector Mock */}
                {[1, 2, 3].map((idx) => (
                    <div
                        key={idx}
                        className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <Skeleton className="h-6 w-32 rounded" />
                            <Skeleton className="h-5 w-16 rounded-full opacity-50" />
                        </div>

                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-5 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-28 rounded" />
                                        <Skeleton className="h-3 w-40 rounded opacity-40" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-12 rounded" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Reviews Section skeleton */}
            <div className="rounded-[2.5rem] border border-gray-50 bg-white/50 p-8 md:p-12 space-y-8 mt-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>

                <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4">
                            <Skeleton className="size-12 rounded-full shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32 rounded" />
                                    <Skeleton className="h-4 w-20 rounded" />
                                </div>
                                <Skeleton className="h-4 w-1/4 rounded bg-amber-50" />
                                <div className="space-y-2 pt-1">
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-2/3 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
