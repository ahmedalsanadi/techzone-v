'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import { useCartActions } from '@/hooks/useCartActions';
import { Link } from '@/i18n/navigation';

const products = [
    {
        id: 1,
        slug: 'classic-burger', // Realistic mock slug
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 2,
        slug: 'cheeseburger',
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 3,
        slug: 'chicken-burger',
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 4,
        slug: 'veggie-burger',
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
    {
        id: 5,
        slug: 'double-burger',
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
    },
];

const PromotionsSection = () => {
    const t = useTranslations('Promotions');
    const { addToCart } = useCartActions();

    return (
        <section className="mt-12 mb-16" dir="rtl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {t('title')}
                </h2>
                <Link
                    href="/products"
                    className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-bold transition-all inline-block cursor-pointer hover:text-libero-red hover:scale-105">
                    {t('more')}
                </Link>
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
                        href={`/products/${product.slug}`}
                        productId={product.id}
                        productSlug={product.slug}
                        discountBadge={t('save', {
                            amount: product.discountAmount,
                        })}
                        addToCartLabel={t('addToCart')}
                        onAddToCartClick={() => {
                            const name = t(product.nameKey);
                            addToCart({
                                id: String(product.id),
                                name,
                                image: product.image,
                                price: product.price,
                                categoryId: 'promo', // Placeholder
                                metadata: {
                                    productId: product.id, // CRITICAL: Required for API calls
                                    productSlug: product.slug,
                                },
                            });
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

export default PromotionsSection;
