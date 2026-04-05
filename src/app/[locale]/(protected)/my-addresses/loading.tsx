import React from 'react';

export default function Loading() {
    return (
        <div className="space-y-6 py-2">
            {/* Header card skeleton (matches MyAddressesView hero card) */}
            <div className="bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-end justify-between gap-3 sm:gap-4 md:gap-6 overflow-hidden relative rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
                <div className="absolute top-0 inset-s-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-theme-primary/5 rounded-full -ms-10 -mt-10 sm:-ms-12 sm:-mt-12 md:-ms-16 md:-mt-16" />

                <div className="flex flex-col items-center md:items-start text-center md:text-start relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl bg-theme-primary/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 ring-2 sm:ring-4 md:ring-8 ring-theme-primary/5">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-theme-primary/20 animate-pulse" />
                    </div>
                    <div className="h-8 w-40 rounded bg-gray-100 animate-pulse" />
                    <div className="mt-2 h-4 w-56 rounded bg-gray-100 animate-pulse" />
                </div>

                <div className="h-12 w-full md:w-40 rounded-2xl bg-gray-100 animate-pulse relative z-10" />
            </div>

            {/* Addresses list skeleton */}
            <div className="bg-theme-primary/5 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 border border-gray-100/80 min-h-[260px] sm:min-h-[320px] md:min-h-[400px] flex flex-col items-center justify-center w-full">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="h-5 w-40 rounded bg-gray-100 animate-pulse" />
                                <div className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                                <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-10 flex-1 rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-10 w-10 rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-10 w-10 rounded-2xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
