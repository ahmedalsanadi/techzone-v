// src/components/pages/products/ProductsGrid.tsx
'use client';

import React from 'react';
import ProductCard from '@/components/ui/ProductCard';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import { useTranslations } from 'next-intl';
import Pagination from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/api';
import { Product } from '@/types/store';
import { getProductDisplayPrice } from '@/lib/products/price';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
    currentPage?: number;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    onAddToCart?: (product: Product) => void;
    getAddToCartLabel?: (product: Product) => string;
    isAddingProductId?: number | null;
    onPrefetchProduct?: (product: Product) => void;
    variant?: 'default' | 'compact';
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
    products,
    loading,
    currentPage,
    pagination,
    onPageChange,
    onAddToCart,
    getAddToCartLabel,
    isAddingProductId,
    onPrefetchProduct,
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
                        : 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
                )}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} index={i} />
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
                            : 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
                    )}>
                    {products.map((product, index) => {
                        const { price, originalPrice } =
                            getProductDisplayPrice(product);
                        return (
                        <ProductCard
                            key={product.id}
                            name={product.title}
                            image={product.cover_image_url || ''}
                            price={price}
                            oldPrice={originalPrice}
                            href={`/products/${product.slug}`}
                            productId={product.id}
                            productSlug={product.slug}
                            priority={index < 4}
                            index={index}
                            addToCartLabel={
                                getAddToCartLabel?.(product) || t('addToCart')
                            }
                            onAddToCartClick={() => onAddToCart?.(product)}
                            isAdding={isAddingProductId === product.id}
                            onPrefetch={() => onPrefetchProduct?.(product)}
                        />
                    );})}
                </div>
            </div>
        </div>
    );
};

export default ProductsGrid;
