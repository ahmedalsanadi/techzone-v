// src/components/pages/collections/OffersProductsSection.tsx
'use client';

import React from 'react';
import ProductsGrid from '../products/ProductsGrid';
import { PaginationMeta } from '@/types/api';
import { Product } from '@/types/store';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';

interface OffersProductsSectionProps {
    products: Product[];
    loading: boolean;
    isFetching: boolean;
    isPending: boolean;
    currentPage: number;
    pagination?: PaginationMeta;
    onPageChange: (page: number) => void;
}

export function OffersProductsSection({
    products,
    loading,
    isFetching,
    isPending,
    currentPage,
    pagination,
    onPageChange,
}: OffersProductsSectionProps) {
    const t = useTranslations('Collections');
    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
                {t('productsInCollection')}
            </h2>

            <div
                className={cn(
                    'transition-opacity duration-200 min-h-[600px]',
                    isFetching || isPending
                        ? 'opacity-50 pointer-events-none'
                        : 'opacity-100',
                )}>
                <ProductsGrid
                    products={products}
                    loading={loading}
                    currentPage={currentPage}
                    pagination={pagination}
                    onPageChange={onPageChange}
                    onAddToCart={handleAddClick}
                    getAddToCartLabel={(product) =>
                        requiresConfiguration(product)
                            ? t('customize') || 'Customize'
                            : t('addToCart') || 'Add to cart'
                    }
                    isAddingProductId={loadingProductId}
                    onPrefetchProduct={prefetchProduct}
                />
            </div>
        </div>
    );
}
