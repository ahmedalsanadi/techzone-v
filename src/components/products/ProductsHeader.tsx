// src/components/pages/products/ProductsHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductsSorting from './ProductsSorting';

interface ProductsHeaderProps {
    sortBy?: string;
    order?: string;
    onSortChange: (sort: string | undefined, order: string | undefined) => void;
}

const ProductsHeader = ({
    sortBy,
    order,
    onSortChange,
}: ProductsHeaderProps) => {
    const t = useTranslations('Product');

    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t('products')}</h1>
            <ProductsSorting
                sortBy={sortBy}
                order={order}
                onSortChange={onSortChange}
            />
        </div>
    );
};

export default ProductsHeader;
