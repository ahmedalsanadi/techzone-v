'use client';

import React from 'react';
import { Category } from '@/services/types';
import CategoryCard from '@/components/ui/CategoryCard';

interface SubCategorySelectionProps {
    subCategories: Category[];
    activeSubCategoryId: string;
    onSubCategorySelect: (id: string) => void;
}

const SubCategorySelection: React.FC<SubCategorySelectionProps> = ({
    subCategories,
    activeSubCategoryId,
    onSubCategorySelect,
}) => {
    if (subCategories.length === 0) return null;

    return (
        <div className="mx-4 mb-10">
            <div className="bg-[#FEF4F1]/30 border border-[#B44734]/10 rounded-[32px] p-6 md:p-8">
                <div className="flex items-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide rtl">
                    {subCategories.map((sub) => (
                        <CategoryCard
                            key={sub.id}
                            variant="circular"
                            label={sub.name}
                            image={sub.image_url}
                            isActive={activeSubCategoryId === sub.id.toString()}
                            onClick={() =>
                                onSubCategorySelect(sub.id.toString())
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubCategorySelection;
