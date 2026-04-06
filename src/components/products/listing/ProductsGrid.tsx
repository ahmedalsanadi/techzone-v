'use client';

import { ProductGridCard } from '@/components/products/ProductGridCard';
import type { Product } from '@/types/store';
import { getProductDisplayPrice } from '@/lib/products/price';
import { useTranslations } from 'next-intl';

export function ProductsGrid({
    products,
    onAddToCart,
    getAddToCartLabel,
    isAddingProductId,
}: {
    products: Product[];
    onAddToCart?: (product: Product) => void;
    getAddToCartLabel?: (product: Product) => string;
    isAddingProductId?: number | null;
}) {
    const t = useTranslations('Promotions');

    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
    );
}
