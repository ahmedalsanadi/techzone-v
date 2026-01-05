'use client';

import React from 'react';
import { Product } from '@/data/mock-data';
import ProductCard from '@/components/ui/ProductCard';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
    const t = useTranslations('Promotions');
    const tCart = useTranslations('Cart');
    const addItem = useCartStore((state) => state.addItem);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-100 animate-pulse rounded-3xl aspect-3/4"
                    />
                ))}
            </div>
        );
    }

    if (!loading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-lg font-medium">
                    لا توجد منتجات في هذا القسم حالياً
                </span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 mb-20">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    name={t(product.nameKey)}
                    image={product.image}
                    price={product.price}
                    oldPrice={product.oldPrice}
                    href={`/products/${product.id}`}
                    discountBadge={
                        product.discountAmount
                            ? t('save', { amount: product.discountAmount })
                            : undefined
                    }
                    addToCartLabel={t('addToCart')}
                    onAddToCartClick={() => {
                        const name = t(product.nameKey);
                        addItem({
                            id: String(product.id),
                            name,
                            image: product.image,
                            price: product.price,
                            categoryId: product.categoryId,
                        });
                        toast.success(tCart('added', { name }));
                    }}
                />
            ))}
        </div>
    );
};

export default ProductsGrid;
