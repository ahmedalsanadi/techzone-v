// src/components/pages/products/SubCategorySelection.tsx
'use client';

import React from 'react';
import { Category } from '@/types/store';
import CategoryCard from '@/components/ui/CategoryCard';
import { useTranslations } from 'next-intl';

interface SubCategorySelectionProps {
    subCategories: Category[];
    activeSubCategoryId: string;
    onSubCategorySelect?: (id: string) => void;
    currentCategoryLabel?: string;
    currentCategoryImage?: string | null;
    parentHref?: string;
}

const SubCategorySelection: React.FC<SubCategorySelectionProps> = ({
    subCategories,
    activeSubCategoryId,
    // onSubCategorySelect,
    parentHref,
}) => {
    const t = useTranslations('Category');
    if (subCategories.length === 0) return null;
    return (
        <div className="w-full mb-4 overflow-hidden">
            <div className="bg-theme-primary/4 border border-theme-primary/30 rounded-xl md:rounded-2xl py-2 md:py-4 px-2 md:px-3">
                <div className="flex items-stretch gap-3 md:gap-4 overflow-x-auto scrollbar-hide rtl justify-start lg:justify-center p-1.5">
                    {/* "All" option for subcategories */}
                    <CategoryCard
                        label={t('all') || 'الكل'}
                        isMain={true}
                        image={null}
                        isActive={activeSubCategoryId === 'all_sub'}
                        href={parentHref}
                        scroll={false}
                        index={0}
                    />

                    {subCategories.map((sub, index) => (
                        <CategoryCard
                            key={sub.id}
                            label={sub.name}
                            image={sub.image_url}
                            isActive={activeSubCategoryId === sub.id.toString()}
                            href={`/categories/${sub.slug || sub.id}`}
                            scroll={false}
                            index={index + 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubCategorySelection;
