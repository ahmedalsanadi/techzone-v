import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-2 sm:px-6 mt-8">
                {/* Breadcrumbs skeleton */}
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-4 w-16 md:h-6 md:w-20 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24 md:h-6 md:w-28 rounded" />
                </div>

                <div className="mt-8 mb-12">
                    <Skeleton className="h-10 w-44 md:h-12 md:w-56 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        {/* Balance card skeleton */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16 md:w-20 rounded" />
                                <Skeleton className="h-10 w-32 md:h-12 md:w-48 rounded-xl" />
                            </div>
                            <Skeleton className="h-12 w-32 md:w-40 rounded-xl" />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {/* Transactions list skeleton */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-6 bg-gray-200 rounded-full" />
                                <Skeleton className="h-7 w-40 rounded-lg" />
                            </div>

                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                                        <div className="flex flex-col flex-1 min-w-0 gap-2">
                                            <Skeleton className="h-5 w-3/4 md:w-1/2 rounded-md" />
                                            <Skeleton className="h-6 w-24 md:h-8 md:w-32 rounded-lg" />
                                        </div>
                                        <Skeleton className="h-4 w-20 md:w-24 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
