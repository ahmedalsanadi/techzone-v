//src/components/ui/CurrencySymbol.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface CurrencySymbolProps {
    className?: string;
}

const CurrencySymbol = ({ className }: CurrencySymbolProps) => {
    const locale = useLocale();

    // Requirement:
    // - Arabic UI: keep the Riyal icon (currency shown as "ريال" in branding)
    // - English UI: show "SAR"
    if (locale?.startsWith('en')) {
        return (
            <span
                className={cn(
                    className,
                    'inline-flex items-center justify-center w-auto h-auto text-[11px] font-black tracking-wide text-gray-900 opacity-90',
                )}>
                SAR
            </span>
        );
    }

    return (
        <Image
            src="/images/svgs/sar-riyal.svg"
            alt="ريال"
            width={16}
            height={16}
            className={cn('inline-block opacity-90', className)}
        />
    );
};


export default CurrencySymbol;
