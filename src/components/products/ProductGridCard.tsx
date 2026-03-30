'use client';

import { memo, useCallback } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import type { Product } from '@/types/store';
import { getProductDisplayPrice } from '@/lib/products/price';

export interface ProductGridCardProps {
    product: Product;
    index: number;
    addToCartLabel: string;
    discountBadge?: string;
    onAddToCart?: (product: Product) => void;
    isAddingProductId?: number | null;
    /** Next/Image priority for LCP (e.g. first row). */
    priority?: boolean;
}

function ProductGridCardInner({
    product,
    index,
    addToCartLabel,
    discountBadge,
    onAddToCart,
    isAddingProductId,
    priority = false,
}: ProductGridCardProps) {
    const handleAdd = useCallback(() => {
        onAddToCart?.(product);
    }, [onAddToCart, product]);

    const { price, originalPrice, discountPercent } =
        getProductDisplayPrice(product);

    return (
        <ProductCard
            name={product.title}
            image={product.cover_image_url || ''}
            price={price}
            oldPrice={originalPrice}
            discountBadge={discountBadge}
            href={`/products/${product.slug}`}
            productId={product.id}
            productSlug={product.slug}
            priority={priority}
            index={index}
            media={product.media}
            brand={product.brand}
            addToCartLabel={addToCartLabel}
            onAddToCartClick={handleAdd}
            isAdding={isAddingProductId === product.id}
        />
    );
}

export const ProductGridCard = memo(ProductGridCardInner);
