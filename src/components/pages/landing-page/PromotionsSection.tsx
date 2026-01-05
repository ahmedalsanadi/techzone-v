'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import { useCartStore } from '@/store/useCartStore';

const products = [
    {
        id: 1,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 2,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 3,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 4,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 5,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
];

const PromotionsSection = () => {
    const t = useTranslations('Promotions');
    const addItem = useCartStore((state) => state.addItem);

    return (
        <section className="mt-12 mb-16" dir="rtl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {t('title')}
                </h2>
                <button className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-bold transition-all">
                    {t('more')}
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={t(product.nameKey)}
                        image={product.image}
                        price={product.price}
                        oldPrice={product.oldPrice}
                        href={`/products/${product.id}`}
                        discountBadge={t('save', {
                            amount: product.discountAmount,
                        })}
                        addToCartLabel={t('addToCart')}
                        onAddToCartClick={() => {
                            addItem({
                                id: String(product.id),
                                name: t(product.nameKey),

                                image: product.image,
                                price: product.price,
                                categoryId: 'promo', // Placeholder
                            });
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

export default PromotionsSection;
