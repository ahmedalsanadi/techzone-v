// src/components/products/ProductsGrid.tsx
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { ProductGridCard } from '@/components/products/ProductGridCard';
import { useTranslations } from 'next-intl';
import { PaginationMeta } from '@/types/api';
import { Product } from '@/types/store';
import { getProductDisplayPrice } from '@/lib/products/price';
import { Loader2 } from 'lucide-react';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
    /** Optional: for non–infinite-scroll usage (e.g. search, offers) */
    currentPage?: number;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    onAddToCart?: (product: Product) => void;
    getAddToCartLabel?: (product: Product) => string;
    isAddingProductId?: number | null;
    /** Infinite scroll: load more when sentinel is visible */
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
    isFetchingNextPage?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
    products,
    loading,
    onAddToCart,
    getAddToCartLabel,
    isAddingProductId,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
}) => {
    const t = useTranslations('Promotions');
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = useCallback(() => {
        if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;
        fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;
        const el = loadMoreRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) handleLoadMore();
            },
            { rootMargin: '200px', threshold: 0.1 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore, fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (loading && products.length === 0) {
        return (
            <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
        <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product, index) => {
                    const { discountPercent } = getProductDisplayPrice(product);
                    return (
                        <ProductGridCard
                            key={product.id}
                            product={product}
                            index={index}
                            addToCartLabel={
                                getAddToCartLabel?.(product) || t('addToCart')
                            }
                            discountBadge={
                                discountPercent
                                    ? t('save', {
                                          amount: `${discountPercent}%`,
                                      })
                                    : undefined
                            }
                            onAddToCart={onAddToCart}
                            isAddingProductId={isAddingProductId}
                            priority={index < 5}
                        />
                    );
                })}
            </div>
            {hasNextPage === true && (
                <div
                    ref={loadMoreRef}
                    className="flex justify-center py-8 min-h-[80px]"
                    aria-hidden>
                    {isFetchingNextPage && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-sm font-medium">
                                {t('loading')}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductsGrid;
