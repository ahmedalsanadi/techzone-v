'use client';

import React from 'react';
import { Product } from '@/services/types';
import ProductCard from '@/components/ui/ProductCard';
import { useTranslations } from 'next-intl';
import { useCartActions } from '@/hooks/useCartActions';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
    const t = useTranslations('Promotions');
    const { addToCart } = useCartActions();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-100 animate-pulse rounded-3xl aspect-square"
                    />
                ))}
            </div>
        );
    }

    if (!loading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-lg font-medium">{t('noProducts')}</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 mb-20">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    name={product.title}
                    image={product.cover_image_url || ''}
                    price={
                        typeof product.price === 'string'
                            ? parseFloat(product.price)
                            : product.price
                    }
                    oldPrice={
                        product.sale_price
                            ? typeof product.sale_price === 'string'
                                ? parseFloat(product.sale_price)
                                : product.sale_price
                            : undefined
                    }
                    href={`/products/${product.id}`}
                    addToCartLabel={t('addToCart')}
                    onAddToCartClick={() => {
                        addToCart({
                            id: String(product.id),
                            name: product.title,
                            image: product.cover_image_url || '',
                            price:
                                typeof product.price === 'string'
                                    ? parseFloat(product.price)
                                    : product.price,
                            categoryId: String(product.categoryId),
                        });
                    }}
                />
            ))}
        </div>
    );
};

export default ProductsGrid;
