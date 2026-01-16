// src/components/pages/products/ProductsSorting.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/SelectField';


interface ProductsSortingProps {
    sortBy?: string;
    order?: string;
    onSortChange: (sort: string | undefined, order: string | undefined) => void;
}

const ProductsSorting = ({
    sortBy,
    order,
    onSortChange,
}: ProductsSortingProps) => {
    const t = useTranslations('Product');

    const handleValueChange = (value: string) => {
        if (value === 'default') {
            onSortChange(undefined, undefined);
            return;
        }
        const [sort, ord] = value.split(':');
        onSortChange(sort, ord);
    };

    const currentValue = sortBy && order ? `${sortBy}:${order}` : 'default';

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:inline-block">
                {t('sortBy')}:
            </span>
            <Select value={currentValue} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                    <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">{t('default')}</SelectItem>
                    <SelectItem value="price:asc">
                        {t('price_low_high')}
                    </SelectItem>
                    <SelectItem value="price:desc">
                        {t('price_high_low')}
                    </SelectItem>
                    <SelectItem value="created_at:desc">
                        {t('newest')}
                    </SelectItem>
                    <SelectItem value="title:asc">{t('name_a_z')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default ProductsSorting;
