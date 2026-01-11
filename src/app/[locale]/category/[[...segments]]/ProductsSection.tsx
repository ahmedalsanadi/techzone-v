// src/app/[locale]/category/[[...segments]]/ProductsSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import type { Product } from '@/services/types';
import { TRANSITIONS, MIN_HEIGHTS } from './constants';
import ProductsSkeleton from './ProductsSkeleton';

interface ProductsSectionProps {
    products: Product[];
    isLoading: boolean;
    isFetching: boolean;
}

/**
 * Products section with loading states, empty state handling, and smooth transitions.
 * Prevents layout shift by maintaining minimum height.
 */
export default function ProductsSection({
    products,
    isLoading,
    isFetching,
}: ProductsSectionProps) {
    const t = useTranslations('Category');
    const [displayProducts, setDisplayProducts] = useState<Product[]>(products);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Smooth product list transitions
    useEffect(() => {
        if (products.length !== displayProducts.length || 
            products.some((p, i) => p.id !== displayProducts[i]?.id)) {
            setIsTransitioning(true);
            const timer = setTimeout(() => {
                setDisplayProducts(products);
                setIsTransitioning(false);
            }, TRANSITIONS.PRODUCT_FADE_DURATION / 2);

            return () => clearTimeout(timer);
        }
    }, [products, displayProducts]);

    if (isLoading) {
        return <ProductsSkeleton />;
    }

    const isRefetching = isFetching && !isLoading;
    const hasProducts = displayProducts.length > 0;

    return (
        <section 
            className="space-y-8 pt-8 border-t border-gray-100"
            style={{ minHeight: `${MIN_HEIGHTS.PRODUCTS_GRID}px` }}>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {t('products')}
                </h2>
                <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {displayProducts.length} {t('items_count')}
                </span>
            </div>

            <div
                className={`transition-all ${
                    isTransitioning || isRefetching
                        ? 'opacity-50 scale-[0.98]'
                        : 'opacity-100 scale-100'
                }`}
                style={{ 
                    minHeight: hasProducts ? 'auto' : `${MIN_HEIGHTS.EMPTY_STATE}px`,
                    transitionDuration: `${TRANSITIONS.PRODUCT_FADE_DURATION}ms`,
                }}>
                {hasProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayProducts.map((p, index) => (
                            <div
                                key={p.id}
                                className="animate-in fade-in slide-in-from-bottom-4"
                                style={{
                                    animationDelay: `${Math.min(index * 50, 300)}ms`,
                                    animationDuration: `${TRANSITIONS.PRODUCT_FADE_DURATION}ms`,
                                    animationFillMode: 'both',
                                }}>
                                <ProductCard
                                    name={p.title}
                                    image={p.cover_image_url}
                                    price={p.price}
                                    oldPrice={p.sale_price}
                                    href={`/products/${p.id}`}
                                    addToCartLabel={t('addToCart')}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div 
                        className="text-center py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200 animate-in fade-in duration-300"
                        style={{ minHeight: `${MIN_HEIGHTS.EMPTY_STATE}px` }}>
                        <p className="text-gray-400 font-medium">
                            {t('no_products')}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
