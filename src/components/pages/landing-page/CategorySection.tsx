'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import CategoryCard from '@/components/ui/CategoryCard';

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
                    <CategoryCard
                        key={cat.id}
                        label={t(cat.key)}
                        image={cat.image}
                        isMain={cat.isMain}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
