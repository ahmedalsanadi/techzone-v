'use client';

import React from 'react';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

const categories = [
    { id: 1, name: 'الأقسام', isMain: true },
    { id: 2, name: 'البيتزا', image: '/images/images/pizza-slice.png' },
    { id: 3, name: 'برجر', image: '/images/images/burgar.png' },
    { id: 4, name: 'الحلويات', image: '/images/images/sweets.png' },
    { id: 5, name: 'المشروبات', image: '/images/images/drink-can.png' },
    { id: 6, name: 'وجبات', image: '/images/images/food.png' },
    { id: 7, name: 'وجبات', image: '/images/images/dish.png' },
    { id: 8, name: 'برجر', image: '/images/images/burgar.png' },
];

const CategorySection = () => {
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
                                        {cat.name}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="relative w-10 h-10 md:w-14 md:h-14">
                                        <Image
                                            src={cat.image || ''}
                                            alt={cat.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="text-[11px] md:text-sm font-bold text-gray-800 group-hover:text-[#B44734] transition-colors leading-tight">
                                        {cat.name}
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
