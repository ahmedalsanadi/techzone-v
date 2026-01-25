// src/components/pages/products/ProductsGrid.tsx
'use client';

import React from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { useTranslations } from 'next-intl';
import Pagination from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';
import { PaginationMeta, Product } from '@/services/types';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
    currentPage?: number;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    onAddToCart?: (product: Product) => void;
    variant?: 'default' | 'compact';
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
    products,
    loading,
    currentPage,
    pagination,
    onPageChange,
    onAddToCart,
    variant = 'default',
}) => {
    const t = useTranslations('Promotions');

    if (loading && products.length === 0) {
        // ... skeleton remains same
        return (
            <div
                className={cn(
                    'grid grid-cols-1 gap-4 md:gap-6',
                    variant === 'compact'
                        ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                )}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center gap-4 animate-pulse shadow-sm">
                        <div className="w-full aspect-square bg-gray-100 rounded-2xl" />
                        <div className="w-3/4 h-5 bg-gray-100 rounded-md" />
                        <div className="w-1/2 h-6 bg-gray-100 rounded-md mt-auto" />
                        <div className="w-full h-10 bg-gray-50 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (!loading && products.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-500 min-h-[400px]">
                <span className="text-lg font-medium">{t('noProducts')}</span>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-10">
                <div
                    className={cn(
                        'grid grid-cols-1 gap-4 md:gap-6',
                        variant === 'compact'
                            ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                    )}>
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            name={product.title}
                            image={product.cover_image_url || ''}
                            price={product.price}
                            oldPrice={product.sale_price}
                            href={`/products/${product.slug}`}
                            productId={product.id}
                            productSlug={product.slug}
                            addToCartLabel={t('addToCart')}
                            onAddToCartClick={() => onAddToCart?.(product)}
                        />
                    ))}
                </div>
            </div>

            {pagination && (
                <div className="pt-10">
                    <Pagination
                        currentPage={currentPage || pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={(page: number) => onPageChange?.(page)}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductsGrid;
