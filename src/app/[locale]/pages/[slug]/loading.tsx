import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CMSPageLoading() {
    return (
        <section className="min-h-screen bg-linear-to-b from-white to-gray-50/40 py-8 relative overflow-hidden">
            {/* Background Blurs */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-theme-primary/10 blur-[120px]" />
                <div className="absolute top-1/3 -left-16 h-56 w-56 rounded-full bg-theme-secondary/10 blur-[120px]" />
            </div>

            <div className="container mx-auto px-2 sm:px-4 mt-2 md:mt-16">
                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-4 w-12 rounded" />
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <Skeleton className="h-4 w-24 rounded" />
                </div>

                <div className="mt-6 lg:mt-10 space-y-8">
                    {/* Header Skeleton */}
                    <header className="rounded-3xl border border-gray-100 bg-white/80 px-6 py-8 shadow-sm backdrop-blur-sm md:px-10">
                        <div className="flex flex-wrap items-center gap-3">
                            <Skeleton className="h-7 w-24 rounded-full" />
                            <Skeleton className="h-4 w-32 rounded-md" />
                        </div>

                        <Skeleton className="mt-5 h-10 md:h-12 w-3/4 rounded-xl" />
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-5 w-full rounded-md" />
                            <Skeleton className="h-5 w-2/3 rounded-md" />
                        </div>
                    </header>

                    {/* Content Section Skeleton */}
                    <section className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-[95%] rounded-md" />
                            <Skeleton className="h-6 w-[90%] rounded-md" />
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-[85%] rounded-md" />
                            <div className="pt-8 space-y-4">
                                <Skeleton className="h-8 w-1/3 rounded-lg" />
                                <Skeleton className="h-6 w-full rounded-md" />
                                <Skeleton className="h-6 w-[92%] rounded-md" />
                                <Skeleton className="h-6 w-[88%] rounded-md" />
                            </div>
                        </div>
                    </section>

                    {/* Footer Skeleton */}
                    <footer className="flex justify-center pt-4">
                        <Skeleton className="h-4 w-32 rounded" />
                    </footer>
                </div>
            </div>
        </section>
    );
}
