//src/components/pages/landing-page/CategorySection.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import CategoryCard from '@/components/categories/CategoryCard';
import CategoryCardSkeleton from '@/components/categories/CategoryCardSkeleton';
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
            <section className="animate-in fade-in duration-700 fill-mode-both">
                <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-center">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="animate-in fade-in duration-700 fill-mode-both">
            <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-center">
                {homeCategories.map((cat, index) => (
                    <CategoryCard
                        key={cat.id}
                        label={cat.name}
                        image={cat.image_url}
                        href={`/categories/${cat.slug || cat.id}`}
                        priority={index < 6}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
