// src/components/pages/products/CategoryTabs.tsx
'use client';

import React from 'react';
import { Category } from '@/services/types';
import CategoryCard from '@/components/ui/CategoryCard';
import { useTranslations } from 'next-intl';

interface CategoryTabsProps {
    categories: Category[];
    activeCategoryId: string;
    onCategorySelect: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    activeCategoryId,
    // onCategorySelect,
}) => {
    const t = useTranslations('Category');

    return (
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide rtl justify-start lg:justify-center px-4 -mx-4 md:mx-0">
            {/* All Products Tab */}
            <CategoryCard
                label={t('all_products') || 'كل المنتجات'}
                isMain={true}
                isActive={activeCategoryId === 'all'}
                href="/categories"
                scroll={false}
            />

            {/* Category Tabs */}
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    label={cat.name}
                    image={cat.icon_url || cat.image_url}
                    isActive={activeCategoryId === cat.id.toString()}
                    href={`/categories/${cat.slug || cat.id}`}
                    scroll={false}
                />
            ))}
        </div>
    );
};

export default CategoryTabs;
