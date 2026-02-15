import React from 'react';

export default function Loading() {
    return (
        <div className="pb-12 bg-white">
            {/* Hero skeleton */}
            <section className="container mx-auto px-0 md:px-4 mt-8 md:mt-10">
                <div className="h-[550px] sm:h-[600px] md:h-[500px] lg:h-[600px] rounded-2xl md:rounded-[2.5rem] bg-gray-100 animate-pulse" />
            </section>

            <div className="container mx-auto px-4 mt-8">
                {/* Categories skeleton */}
                <section className="mt-8 mb-12">
                    <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="shrink-0 w-[92px] md:w-[110px]">
                                <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="mt-2 h-3 w-3/4 mx-auto rounded bg-gray-100 animate-pulse" />
                            </div>
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
                                <div
                                    key={i}
                                    className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                    <div className="h-44 bg-gray-100 animate-pulse" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
                                        <div className="h-4 w-2/5 rounded bg-gray-100 animate-pulse" />
                                        <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

