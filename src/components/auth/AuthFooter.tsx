'use client';

import React from 'react';
import Image from 'next/image';

interface AuthFooterProps {
    locale?: string;
}

export default function AuthFooter({ locale }: AuthFooterProps) {
    const isArabic = locale === 'ar';

    return (
        <div className="mt-auto flex flex-col items-center gap-3 pt-8 pb-4 shrink-0 border-t border-gray-50/50 lg:border-0">
            <div className="flex items-center gap-3 flex-wrap justify-center group opacity-70 hover:opacity-100 transition-opacity duration-300">
                <span className="text-gray-400 text-sm md:text-base font-bold tracking-tight">
                    {isArabic ? 'يعمل بواسطة' : 'Powered by'}
                </span>
                <div className="relative h-6 md:h-7 w-20 md:w-24">
                    <Image
                        src="/images/logo/libro-copywrite-dark.svg"
                        alt="Libro"
                        fill
                        className="grayscale opacity-60 object-contain group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    />
                </div>
            </div>
        </div>
    );
}
