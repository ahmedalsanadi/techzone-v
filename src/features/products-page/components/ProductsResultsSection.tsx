'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/store';
import type { ProductsPageOrder, ProductsPageSort } from '../types';
import ProductsSorting from '@/components/products/ProductsSorting';
import { ProductsGrid } from './ProductsGrid';
import { useTranslations } from 'next-intl';

export function ProductsResultsSection({
    products,
    sort,
    order,
    onSortChange,
    dimmed,
    onAddToCart,
    getAddToCartLabel,
    isAddingProductId,
    onPrefetchProduct,
    children,
}: {
    products: Product[];
    sort: ProductsPageSort;
    order: ProductsPageOrder;
    onSortChange: (sort: ProductsPageSort | undefined, order: ProductsPageOrder | undefined) => void;
    dimmed?: boolean;
    onAddToCart?: (product: Product) => void;
    getAddToCartLabel?: (product: Product) => string;
    isAddingProductId?: number | null;
    onPrefetchProduct?: (product: Product) => void;
    // for loading/empty/error content above/below grid
    children?: React.ReactNode;
}) {
    const t = useTranslations('Product');
    return (
        <div className="space-y-8 relative z-0 p-1">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('products')}</h1>
                <ProductsSorting
                    sortBy={sort}
                    order={order}
                    onSortChange={(s, o) =>
                        onSortChange(
                            (s as ProductsPageSort | undefined) ?? undefined,
                            (o as ProductsPageOrder | undefined) ?? undefined,
                        )
                    }
                />
            </div>

            <div
                className={cn(
                    'transition-opacity duration-200',
                    dimmed ? 'opacity-50 pointer-events-none' : 'opacity-100',
                )}>
                {children}
                <ProductsGrid
                    products={products}
                    onAddToCart={onAddToCart}
                    getAddToCartLabel={getAddToCartLabel}
                    isAddingProductId={isAddingProductId}
                    onPrefetchProduct={onPrefetchProduct}
                />
            </div>
        </div>
    );
}

