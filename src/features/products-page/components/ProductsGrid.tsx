'use client';

import React from 'react';
import ProductCard from '@/components/ui/ProductCard';
import type { Product } from '@/types/store';
import { getProductDisplayPrice } from '@/lib/products/price';

export function ProductsGrid({
    products,
    onAddToCart,
    getAddToCartLabel,
    isAddingProductId,
    onPrefetchProduct,
}: {
    products: Product[];
    onAddToCart?: (product: Product) => void;
    getAddToCartLabel?: (product: Product) => string;
    isAddingProductId?: number | null;
    onPrefetchProduct?: (product: Product) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {products.map((product) => {
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
                        addToCartLabel={getAddToCartLabel?.(product)}
                        onAddToCartClick={() => onAddToCart?.(product)}
                        isAdding={isAddingProductId === product.id}
                        onPrefetch={() => onPrefetchProduct?.(product)}
                    />
                );
            })}
        </div>
    );
}
