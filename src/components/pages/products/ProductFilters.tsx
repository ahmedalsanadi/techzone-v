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

import { Filter, Layers, Sliders, Zap, X } from 'lucide-react';

const ProductFilters = ({
    categories,
    filters,
    onFiltersChange,
}: ProductFiltersProps) => {
    const t = useTranslations('Product');

    const [priceRange, setPriceRange] = React.useState<[number, number]>([
        parseInt(filters.min_price || '0'),
        parseInt(filters.max_price || '1000'),
    ]);

    // Update local state if filters change from outside (navigation/reset/clear)
    React.useEffect(() => {
        setPriceRange([
            parseInt(filters.min_price || '0'),
            parseInt(filters.max_price || '1000'),
        ]);
    }, [filters.min_price, filters.max_price]);

    // Debounce the actual filter update
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const isMinChanged =
                priceRange[0].toString() !== (filters.min_price || '0');
            const isMaxChanged =
                priceRange[1].toString() !== (filters.max_price || '1000');

            if (isMinChanged || isMaxChanged) {
                onFiltersChange({
                    ...filters,
                    min_price: priceRange[0].toString(),
                    max_price: priceRange[1].toString(),
                    page: '1',
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [priceRange, filters, onFiltersChange]);

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
        setPriceRange([values[0], values[1]]);
    };

    const handleFeatureToggle = (key: 'is_featured' | 'is_latest') => {
        onFiltersChange({
            ...filters,
            [key]: filters[key] === '1' ? undefined : '1',
            page: '1',
        });
    };

    return (
        <div className="space-y-6 sticky top-24">
            {/* Sidebar Header */}
            <div className="flex items-center gap-2 mb-2 px-1">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Filter className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                    {t('filters')}
                </h2>
            </div>

            {/* Categories Section */}
            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-2 mb-6">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-gray-800">
                        {t('categories')}
                    </h3>
                </div>
                <ScrollArea className="h-64 pr-4 -mr-4">
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="group flex items-center gap-3">
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
                                    className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors cursor-pointer select-none">
                                    {category.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Price Range Section */}
            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-2 mb-6">
                    <Sliders className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-gray-800">
                        {t('price_range')}
                    </h3>
                </div>
                <div className="px-1">
                    <Slider
                        value={priceRange}
                        max={1000}
                        step={10}
                        onChange={handlePriceChange}
                        className="py-4"
                    />
                    <div className="flex items-center justify-between mt-4">
                        <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-gray-700">
                            {priceRange[0]} SR
                        </div>
                        <div className="w-4 h-px bg-gray-200" />
                        <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-gray-700">
                            {priceRange[1]} SR
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Filters Section */}
            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-gray-800">
                        {t('quick_filters')}
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="group flex items-center gap-3">
                        <Checkbox
                            id="is_featured"
                            checked={filters.is_featured === '1'}
                            onCheckedChange={() =>
                                handleFeatureToggle('is_featured')
                            }
                        />
                        <Label
                            htmlFor="is_featured"
                            className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors cursor-pointer select-none">
                            {t('featured')}
                        </Label>
                    </div>
                    <div className="group flex items-center gap-3">
                        <Checkbox
                            id="is_latest"
                            checked={filters.is_latest === '1'}
                            onCheckedChange={() =>
                                handleFeatureToggle('is_latest')
                            }
                        />
                        <Label
                            htmlFor="is_latest"
                            className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors cursor-pointer select-none">
                            {t('latest')}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Reset Button */}
            <button
                onClick={() => onFiltersChange({})}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:text-white bg-white hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-3xl transition-all duration-300 shadow-sm">
                <X className="w-4 h-4" />
                {t('clear_all')}
            </button>
        </div>
    );
};

export default ProductFilters;
