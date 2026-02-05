'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

export function ServiceUnavailableFallback() {
    const t = useTranslations('ServiceUnavailableFallback');
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
            <div className="max-w-md space-y-6">
                <div className="relative mx-auto h-24 w-24 opacity-20">
                    <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-full w-full text-gray-900">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {t('storeUnavailable')}
                </h1>
                <p className="text-lg text-gray-600">{t('description')}</p>
                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                        {t('tryAgain')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
