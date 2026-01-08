'use client';

import React from 'react';
import { Category } from '@/services/types';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/CheckboxField';
import { Label } from '@/components/ui/LabelField';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Slider } from '@/components/ui/Slider';

interface ProductFiltersProps {
    categories: Category[];
    filters: Record<string, string | undefined>;
    onFiltersChange: (newFilters: Record<string, string | undefined>) => void;
}

const ProductFilters = ({
    categories,
    filters,
    onFiltersChange,
}: ProductFiltersProps) => {
    const t = useTranslations('Product');

    const handleCategoryToggle = (categoryId: string) => {
        const currentCategoryIds = filters.category_id
            ? filters.category_id.split(',')
            : [];
        let newCategoryIds: string[];

        if (currentCategoryIds.includes(categoryId)) {
            newCategoryIds = currentCategoryIds.filter(
                (id) => id !== categoryId,
            );
        } else {
            newCategoryIds = [...currentCategoryIds, categoryId];
        }

        onFiltersChange({
            ...filters,
            category_id:
                newCategoryIds.length > 0
                    ? newCategoryIds.join(',')
                    : undefined,
            page: '1', // Reset to first page
        });
    };

    const handlePriceChange = (values: number[]) => {
        onFiltersChange({
            ...filters,
            min_price: values[0]?.toString(),
            max_price: values[1]?.toString(),
            page: '1',
        });
    };

    const handleFeatureToggle = (key: 'is_featured' | 'is_latest') => {
        onFiltersChange({
            ...filters,
            [key]: filters[key] === '1' ? undefined : '1',
            page: '1',
        });
    };

    return (
        <div className="space-y-8 sticky top-24">
            {/* Categories */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('categories')}</h3>
                <ScrollArea className="h-48 lg:h-auto">
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Checkbox
                                    id={`cat-${category.id}`}
                                    checked={filters.category_id
                                        ?.split(',')
                                        .includes(category.id.toString())}
                                    onCheckedChange={() =>
                                        handleCategoryToggle(
                                            category.id.toString(),
                                        )
                                    }
                                />
                                <Label
                                    htmlFor={`cat-${category.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    {category.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('price_range')}</h3>
                <Slider
                    defaultValue={[
                        parseInt(filters.min_price || '0'),
                        parseInt(filters.max_price || '1000'),
                    ]}
                    max={1000}
                    step={10}
                    onValueCommit={handlePriceChange}
                    className="py-4"
                />
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{filters.min_price || 0} SR</span>
                    <span>{filters.max_price || 1000} SR</span>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('quick_filters')}</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                            id="is_featured"
                            checked={filters.is_featured === '1'}
                            onCheckedChange={() =>
                                handleFeatureToggle('is_featured')
                            }
                        />
                        <Label
                            htmlFor="is_featured"
                            className="text-sm cursor-pointer">
                            {t('featured')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                            id="is_latest"
                            checked={filters.is_latest === '1'}
                            onCheckedChange={() =>
                                handleFeatureToggle('is_latest')
                            }
                        />
                        <Label
                            htmlFor="is_latest"
                            className="text-sm cursor-pointer">
                            {t('latest')}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Reset Button */}
            <button
                onClick={() => onFiltersChange({})}
                className="w-full py-2 text-sm font-medium text-red-500 hover:text-red-600 border border-red-200 rounded-lg transition-colors">
                {t('clear_all')}
            </button>
        </div>
    );
};

export default ProductFilters;
