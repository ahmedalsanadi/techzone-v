import React from 'react';

export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-6">
                {/* Breadcrumbs skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                </div>

                <div className="mt-8 mb-12">
                    <div className="h-10 w-44 rounded bg-gray-100 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        {/* Balance card skeleton */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-10 w-40 rounded bg-gray-100 animate-pulse" />
                                </div>
                                <div className="h-11 w-36 rounded-xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {/* Transactions list skeleton */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-6 bg-gray-100 rounded-full animate-pulse" />
                                <div className="h-6 w-40 rounded bg-gray-100 animate-pulse" />
                            </div>

                            <div className="space-y-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                                        <div className="flex flex-col flex-1 min-w-0 gap-2">
                                            <div className="h-4 w-48 rounded bg-gray-100 animate-pulse" />
                                            <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
                                        </div>
                                        <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
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

