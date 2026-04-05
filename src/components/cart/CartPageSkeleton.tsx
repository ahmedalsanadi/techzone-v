'use client';

import { useTranslations } from 'next-intl';

export function CartPageSkeleton() {
    const t = useTranslations('Cart');

    return (
        <div className="space-y-6 py-4">
            <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-4">
                    {[0, 1, 2].map((idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 w-3/5 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-3 w-2/5 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-3 w-1/3 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                            <div className="w-28 h-10 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-4">
                        <div className="h-5 w-32 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse mt-4" />
                    </div>
                </div>
            </div>
            <p className="text-gray-500 text-sm mt-6">
                {t('loading') || 'Loading your cart...'}
            </p>
        </div>
    );
}
