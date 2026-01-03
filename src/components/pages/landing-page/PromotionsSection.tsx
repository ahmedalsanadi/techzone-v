'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
                    <div
                        key={product.id}
                        className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-4 md:p-6 relative group shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col items-center">
                        {/* Wishlist Button */}
                        <button className="absolute top-4 right-4 w-9 h-9 md:w-10 md:h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all z-10 border border-gray-50">
                            <Heart className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        {/* Product Image */}
                        <div className="relative w-full aspect-square mb-6 group-hover:scale-105 transition-transform duration-500">
                            <Image
                                src={product.image}
                                alt={t(product.nameKey)}
                                fill
                                className="object-contain drop-shadow-xl"
                            />
                        </div>

                        {/* Product Info */}
                        <div className="w-full text-right space-y-2">
                            <h3 className="text-lg md:text-xl font-bold text-gray-800">
                                {t(product.nameKey)}
                            </h3>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <span className="text-xl md:text-2xl font-black text-gray-900">
                                        {product.price}
                                    </span>
                                    <Image
                                        src="/images/svgs/sar-riyal.svg"
                                        alt="SAR"
                                        width={14}
                                        height={14}
                                        className="opacity-90 md:w-4 md:h-4"
                                    />
                                    <span className="text-xs md:text-sm text-gray-400 line-through mr-1">
                                        {product.oldPrice}
                                    </span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                                    {t('save', {
                                        amount: product.discountAmount,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button className="w-full mt-8 bg-[#FEF4F1] hover:bg-[#FDE7E0] text-[#B44734] font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all group-active:scale-95 border border-[#FDE7E0]/50 shadow-sm">
                            <Plus className="w-5 h-5" />
                            <span className="text-sm md:text-base">
                                {t('addToCart')}
                            </span>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromotionsSection;
