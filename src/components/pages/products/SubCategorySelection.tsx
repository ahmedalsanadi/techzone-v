// src/components/pages/products/SubCategorySelection.tsx
'use client';

import React from 'react';
import { Category } from '@/services/types';
import CategoryCard from '@/components/ui/CategoryCard';

interface SubCategorySelectionProps {
    subCategories: Category[];
    activeSubCategoryId: string;
    onSubCategorySelect: (id: string) => void;
    currentCategoryLabel?: string;
    currentCategoryImage?: string | null;
}

const SubCategorySelection: React.FC<SubCategorySelectionProps> = ({
    subCategories,
    activeSubCategoryId,
    onSubCategorySelect,
    currentCategoryLabel,
    currentCategoryImage,
}) => {
    if (subCategories.length === 0) return null;

    return (
        <div className="w-full mb-10 overflow-hidden">
            <div className="bg-[#FEF4F1]/60 border-y border-[#B44734]/10 py-8 md:py-10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide rtl justify-start lg:justify-center">
                        {/* "All" option for subcategories */}
                        <CategoryCard
                            variant="circular"
                            label={currentCategoryLabel || 'الكل'}
                            image={currentCategoryImage}
                            isActive={activeSubCategoryId === 'all_sub'}
                            onClick={() => onSubCategorySelect('all_sub')}
                        />

                        {subCategories.map((sub) => (
                            <CategoryCard
                                key={sub.id}
                                variant="circular"
                                label={sub.name}
                                image={sub.image_url}
                                isActive={
                                    activeSubCategoryId === sub.id.toString()
                                }
                                onClick={() =>
                                    onSubCategorySelect(sub.id.toString())
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubCategorySelection;
