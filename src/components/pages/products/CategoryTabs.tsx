'use client';

import React from 'react';
import { Category } from '@/data/mock-data';
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
    onCategorySelect,
}) => {
    const t = useTranslations('Categories');

    return (
        <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-6 scrollbar-hide rtl justify-start lg:justify-center px-4">
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    label={t(cat.key)}
                    image={cat.image}
                    isMain={cat.isMain}
                    isActive={activeCategoryId === cat.id}
                    onClick={() => onCategorySelect(cat.id)}
                />
            ))}
        </div>
    );
};

export default CategoryTabs;
