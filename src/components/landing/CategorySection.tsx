//src/components/pages/landing-page/CategorySection.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import CategoryCard from '@/components/ui/CategoryCard';
import { useStore } from '@/components/providers/StoreProvider';

const CategorySection = () => {
    const t = useTranslations('Categories');
    const { categories } = useStore();

    // Limit to 9 main categories for the home page as requested
    const homeCategories = categories
        .filter((cat) => cat.show_in_menu)
        .slice(0, 9);

    // When categories are being fetched client-side, show a lightweight skeleton
    // instead of rendering nothing (better perceived performance).
    if (homeCategories.length === 0) {
        return (
            <section className="mt-8 mb-12">
                <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="shrink-0 w-[92px] md:w-[110px]">
                            <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                            <div className="mt-2 h-3 w-3/4 mx-auto rounded bg-gray-100 animate-pulse" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mt-8 mb-12">
            <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                {homeCategories.map((cat) => (
                    <CategoryCard
                        key={cat.id}
                        label={cat.name}
                        image={cat.image_url}
                        href={`/categories/${cat.slug || cat.id}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
