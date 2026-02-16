// src/components/pages/products/SubCategorySelection.tsx
'use client';

import React from 'react';
import { Category } from '@/types/store';
import CategoryCard from '@/components/ui/CategoryCard';

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
    currentCategoryLabel,
    currentCategoryImage,
    parentHref,
}) => {
    if (subCategories.length === 0) return null;

    return (
        <div className="w-full mb-6 overflow-hidden">
            <div className="bg-theme-primary/4 border border-theme-primary/30 rounded-2xl md:rounded-3xl py-3 md:py-8 px-2 md:px-4">
                <div className="flex items-stretch gap-4 md:gap-8 overflow-x-auto scrollbar-hide rtl justify-start lg:justify-center p-2">
                    {/* "All" option for subcategories */}
                    <CategoryCard
                        label={currentCategoryLabel || 'الكل'}
                        image={currentCategoryImage}
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
