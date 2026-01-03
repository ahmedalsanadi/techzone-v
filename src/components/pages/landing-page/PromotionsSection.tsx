'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';

const products = [
    {
        id: 1,
        name: 'اسم الطبق',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discount: 'وفر 5%',
    },
    {
        id: 2,
        name: 'اسم الطبق',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discount: 'وفر 5%',
    },
    {
        id: 3,
        name: 'اسم الطبق',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discount: 'وفر 5%',
    },
    {
        id: 4,
        name: 'اسم الطبق',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discount: 'وفر 5%',
    },
    {
        id: 5,
        name: 'اسم الطبق',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discount: 'وفر 5%',
    },
];

const PromotionsSection = () => {
    return (
        <section className="mt-12 mb-16" dir="rtl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    العروض
                </h2>
                <button className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-bold transition-all">
                    المزيد
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white border border-gray-100 rounded-[2.5rem] p-5 relative group hover:shadow-xl transition-all duration-500 flex flex-col items-center">
                        {/* Wishlist Button */}
                        <button className="absolute top-4 right-4 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all z-10 border border-gray-50">
                            <Heart className="w-5 h-5" />
                        </button>

                        {/* Product Image */}
                        <div className="relative w-full aspect-square mb-4 group-hover:scale-105 transition-transform duration-500">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain drop-shadow-lg"
                            />
                        </div>

                        {/* Product Info */}
                        <div className="w-full text-right space-y-1">
                            <h3 className="text-lg font-bold text-gray-800">
                                {product.name}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-gray-900">
                                        {product.price}
                                    </span>
                                    <Image
                                        src="/images/svgs/sar-riyal.svg"
                                        alt="SAR"
                                        width={14}
                                        height={14}
                                        className="opacity-80"
                                    />
                                    <span className="text-sm text-gray-400 line-through mr-1">
                                        {product.oldPrice}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                                    {product.discount}
                                </span>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button className="w-full mt-6 bg-[#FEF4F1] hover:bg-[#FDE7E0] text-[#B44734] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all group-active:scale-95 border border-[#FDE7E0]/50">
                            <Plus className="w-5 h-5" />
                            <span>اضافة إلى السلة</span>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromotionsSection;
