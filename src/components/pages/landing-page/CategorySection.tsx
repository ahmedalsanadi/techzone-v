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
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-center px-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex flex-col items-center gap-2 min-w-[100px] group cursor-pointer">
                        <div className="w-16 h-20 md:w-20 md:h-24 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:border-red-100">
                            {cat.isMain ? (
                                <LayoutGrid className="w-8 h-8 text-[#B44734]" />
                            ) : (
                                <div className="relative w-12 h-12 md:w-14 md:h-14">
                                    <Image
                                        src={cat.image || ''}
                                        alt={cat.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#B44734] transition-colors">
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
