'use client';

import React from 'react';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';

const categories = [
    { id: 1, key: 'all', isMain: true },
    { id: 2, key: 'pizza', image: '/images/images/pizza-slice.png' },
    { id: 3, key: 'burger', image: '/images/images/burgar.png' },
    { id: 4, key: 'sweets', image: '/images/images/sweets.png' },
    { id: 5, key: 'drinks', image: '/images/images/drink-can.png' },
    { id: 6, key: 'meals', image: '/images/images/food.png' },
    { id: 7, key: 'meals', image: '/images/images/dish.png' },
    { id: 8, key: 'burger', image: '/images/images/burgar.png' },
];

const CategorySection = () => {
    const t = useTranslations('Categories');
    return (
        <section className="mt-8 mb-12">
            <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex flex-col items-center min-w-[85px] md:min-w-[110px] group cursor-pointer">
                        <div className="w-full aspect-[4/5.2] bg-white border border-gray-200/60 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2.5 p-3 shadow-xs group-hover:shadow-md transition-all group-hover:border-[#B44734]/20">
                            {cat.isMain ? (
                                <div className="flex flex-col items-center gap-3 w-full">
                                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                                        <LayoutGrid
                                            size={32}
                                            className="text-[#B44734]"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <span className="text-[11px] md:text-sm font-bold text-gray-800 group-hover:text-[#B44734] transition-colors">
                                        {t(cat.key)}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="relative w-10 h-10 md:w-14 md:h-14">
                                        <Image
                                            src={cat.image || ''}
                                            alt={t(cat.key)}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="text-[11px] md:text-sm font-bold text-gray-800 group-hover:text-[#B44734] transition-colors leading-tight">
                                        {t(cat.key)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
