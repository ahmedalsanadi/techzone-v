// src/components/pages/products/ProductFiltersUI.tsx
'use client';

import React from 'react';
import { Category } from '@/services/types';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/CheckboxField';
import { Label } from '@/components/ui/LabelField';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Slider } from '@/components/ui/Slider';
import { Filter, Layers, Sliders, Zap, X } from 'lucide-react';

interface ProductFiltersUIProps {
    categories: Category[];
    selectedCategoryIds: string[];
    priceRange: [number, number];
    isFeatured: boolean;
    isLatest: boolean;
    onCategoryToggle: (id: string) => void;
    onPriceChange: (values: number[]) => void;
    onFeatureToggle: (key: 'is_featured' | 'is_latest') => void;
    onReset: () => void;
}

const ProductFiltersUI = ({
    categories,
    selectedCategoryIds,
    priceRange,
    isFeatured,
    isLatest,
    onCategoryToggle,
    onPriceChange,
    onFeatureToggle,
    onReset,
}: ProductFiltersUIProps) => {
    const t = useTranslations('Product');

    return (
        <div className="space-y-6 lg:sticky lg:top-24 lg:z-10 lg:self-start">
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
                                    checked={selectedCategoryIds.includes(
                                        category.id.toString(),
                                    )}
                                    onCheckedChange={() =>
                                        onCategoryToggle(category.id.toString())
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
                        onChange={onPriceChange}
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
                            checked={isFeatured}
                            onCheckedChange={() =>
                                onFeatureToggle('is_featured')
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
                            checked={isLatest}
                            onCheckedChange={() => onFeatureToggle('is_latest')}
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
                onClick={onReset}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:text-white bg-white hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-3xl transition-all duration-300 shadow-sm">
                <X className="w-4 h-4" />
                {t('clear_all')}
            </button>
        </div>
    );
};

export default ProductFiltersUI;
