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
