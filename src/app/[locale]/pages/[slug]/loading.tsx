// src/app/[locale]/[slug]/loading.tsx
import React from 'react';

export default function CMSPageLoading() {
    return (
        <div className="min-h-screen bg-gray-50/30 py-8 lg:py-16">
            <div className="container mx-auto px-4 ">
                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2 mb-8 animate-pulse">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                    <div className="h-4 w-4 bg-gray-200 rounded-full" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>

                {/* Header Skeleton */}
                <div className="mb-12">
                    <div className="h-8 w-32 bg-gray-200 rounded-full mb-6 animate-pulse" />
                    <div className="h-16 lg:h-20 w-3/4 bg-gray-200 rounded-3xl mb-6 animate-pulse" />
                    <div className="h-6 w-1/2 bg-gray-200 rounded-xl animate-pulse" />
                </div>

                {/* Content Area Skeleton */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-lg border border-gray-100 min-h-[500px]">
                    <div className="space-y-6">
                        <div className="h-6 w-full bg-gray-100 rounded-xl animate-pulse" />
                        <div className="h-6 w-[95%] bg-gray-100 rounded-xl animate-pulse" />
                        <div className="h-6 w-[90%] bg-gray-100 rounded-xl animate-pulse" />
                        <div className="h-6 w-full bg-gray-100 rounded-xl animate-pulse" />
                        <div className="mt-12 space-y-4">
                            <div className="h-10 w-48 bg-gray-200 rounded-2xl animate-pulse" />
                            <div className="h-6 w-full bg-gray-100 rounded-xl animate-pulse" />
                            <div className="h-6 w-[92%] bg-gray-100 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
