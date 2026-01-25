// src/app/[locale]/category/[[...segments]]/ProductsSection.tsx
'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import type { Product } from '@/services/types';
import { TRANSITIONS, MIN_HEIGHTS } from './constants';
import ProductsSkeleton from './ProductsSkeleton';
import { useCartActions } from '@/hooks/useCartActions';

interface ProductsSectionProps {
    products: Product[];
    isLoading: boolean;
    isFetching: boolean;
}

/**
 * Products section with loading states, empty state handling, and smooth transitions.
 * Prevents layout shift by maintaining minimum height.
 * Uses key-based remounting for animations instead of state management.
 */
export default function ProductsSection({
    products,
    isLoading,
    isFetching,
}: ProductsSectionProps) {
    const t = useTranslations('Category');
    const { addToCart } = useCartActions();

    // Generate a unique key from products to trigger animations on change
    const productsKey = useMemo(
        () => products.map((p) => p.id).join('-') || 'empty',
        [products],
    );

    if (isLoading) {
        return <ProductsSkeleton />;
    }

    const isRefetching = isFetching && !isLoading;
    const hasProducts = products.length > 0;

    return (
        <section
            className="space-y-8 pt-8 border-t border-gray-100"
            style={{ minHeight: `${MIN_HEIGHTS.PRODUCTS_GRID}px` }}>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {t('products')}
                </h2>
                <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {products.length} {t('items_count')}
                </span>
            </div>

            <div
                key={productsKey}
                className={`transition-opacity ${
                    isRefetching ? 'opacity-60' : 'opacity-100'
                }`}
                style={{
                    minHeight: hasProducts
                        ? 'auto'
                        : `${MIN_HEIGHTS.EMPTY_STATE}px`,
                    transitionDuration: `${TRANSITIONS.PRODUCT_FADE_DURATION}ms`,
                }}>
                {hasProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {products.map((p, index) => {
                            // First 4 products (above fold) get priority loading
                            const isAboveFold = index < 4;

                            return (
                                <div
                                    key={p.id}
                                    className="animate-in fade-in slide-in-from-bottom-4"
                                    style={{
                                        animationDelay: `${Math.min(
                                            index * 50,
                                            300,
                                        )}ms`,
                                        animationDuration: `${TRANSITIONS.PRODUCT_FADE_DURATION}ms`,
                                        animationFillMode: 'both',
                                    }}>
                                    <ProductCard
                                        name={p.title}
                                        image={p.cover_image_url}
                                        price={p.price}
                                        oldPrice={p.sale_price}
                                        href={`/products/${p.slug}`}
                                        productId={p.id}
                                        productSlug={p.slug}
                                        addToCartLabel={t('addToCart')}
                                        priority={isAboveFold}
                                        onAddToCartClick={() => {
                                            addToCart({
                                                id: String(p.id),
                                                name: p.title,
                                                image: p.cover_image_url,
                                                price: p.price,
                                                categoryId: String(
                                                    p.categories?.[0]?.id || '',
                                                ),
                                                metadata: {
                                                    productId: p.id,
                                                    productSlug: p.slug,
                                                },
                                            });
                                        }}
                                    />
                                </div>
                            );
                        })}
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
