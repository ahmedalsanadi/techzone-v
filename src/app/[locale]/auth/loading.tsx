import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Main Auth Content Side */}
            <div className="w-full lg:w-3/5 bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 relative shadow-2xl lg:shadow-none z-10">
                {/* AuthHeader Skeleton */}
                <div className="flex justify-start items-center mb-8 lg:mb-16 px-2 sm:px-4">
                    <div className="flex items-center gap-4 w-full">
                        <Skeleton className="size-10 md:size-12 rounded-full shrink-0" />
                        <Skeleton className="h-7 md:h-8 w-48 md:w-64 rounded-lg" />
                    </div>
                </div>

                {/* Main Content Area Skeleton */}
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center lg:-mt-20 space-y-8 sm:space-y-10">
                    <div className="space-y-6">
                        {/* Form Title/Subtitle Skeleton */}
                        <div className="space-y-3 px-1 text-start">
                            <Skeleton className="h-8 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-md opacity-60" />
                        </div>

                        {/* Input Group Skeleton */}
                        <div className="space-y-4">
                            <div className="space-y-2 flex flex-col">
                                <Skeleton className="h-4 w-20 self-start mb-1" />
                                <Skeleton className="h-12 sm:h-14 md:h-16 w-full rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100" />
                            </div>
                        </div>

                        {/* Terms Text Skeleton */}
                        <div className="space-y-2 px-1">
                            <Skeleton className="h-3 w-full rounded-full opacity-40" />
                            <Skeleton className="h-3 w-2/3 rounded-full opacity-40" />
                        </div>

                        {/* Submit Button Skeleton */}
                        <Skeleton className="h-12 sm:h-14 md:h-16 w-full rounded-xl sm:rounded-2xl shadow-sm" />
                    </div>
                </div>

                {/* AuthFooter Skeleton */}
                <div className="mt-auto flex flex-col items-center gap-4 pt-8">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-24 rounded-md opacity-60" />
                        <Skeleton className="h-7 w-20 rounded-md opacity-40" />
                    </div>
                </div>
            </div>

            {/* Branding Side Skeleton (Desktop Only) */}
            <div className="hidden lg:flex w-2/5 flex-col items-center justify-center p-12 relative bg-theme-primary overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-48 -mb-48 blur-3xl" />

                <div className="flex flex-col items-center space-y-10 relative z-10">
                    {/* Logo Plate */}
                    <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        <Skeleton className="size-32 md:size-40 rounded-3xl bg-white/20" />
                    </div>

                    {/* Brand Name Skeleton */}
                    <div className="space-y-4 flex flex-col items-center">
                        <Skeleton className="h-16 md:h-20 w-64 md:w-80 rounded-2xl bg-white/20" />
                        <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
