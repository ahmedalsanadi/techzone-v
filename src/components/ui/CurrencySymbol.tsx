'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface CurrencySymbolProps {
    className?: string;
}

const CurrencySymbol = ({ className }: CurrencySymbolProps) => {
    const t = useTranslations('Product');
    const currency = t('currency');

    if (currency === 'ر.س') {
        return (
            <Image
                src="/images/svgs/sar-riyal.svg"
                alt="SAR"
                width={16}
                height={16}
                className={cn('inline-block opacity-90', className)}
            />
        );
    }

    return <span className={cn('font-bold', className)}>{currency}</span>;
};

export default CurrencySymbol;
