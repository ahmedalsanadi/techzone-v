'use client';

import React from 'react';
import Image from 'next/image';

interface AuthFooterProps {
    locale?: string;
}

export default function AuthFooter({ locale }: AuthFooterProps) {
    const isArabic = locale === 'ar';

    return (
        <div className="mt-auto flex flex-col items-center gap-3 pt-6 shrink-0">
            <div className="flex items-center gap-3 flex-wrap justify-center">
                <span className="text-gray-400 text-base md:text-lg font-bold">
                    {isArabic ? 'يعمل بواسطة' : 'Powered by'}
                </span>
                <Image
                    src="/images/logo/libro-copywrite-dark.svg"
                    alt="Libro"
                    width={80}
                    height={28}
                    className="grayscale opacity-60 h-6 md:h-7 w-auto"
                />
            </div>
        </div>
    );
}
