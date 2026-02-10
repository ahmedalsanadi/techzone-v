// src/components/pages/products/ProductFilters.tsx
'use client';

import React from 'react';
import { Category } from '@/types/store';
import ProductFiltersUI from './ProductFiltersUI';

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

    // Debounce the actual filter update for price
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
            page: '1',
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
        <ProductFiltersUI
            categories={categories}
            selectedCategoryIds={
                filters.category_id ? filters.category_id.split(',') : []
            }
            priceRange={priceRange}
            isFeatured={filters.is_featured === '1'}
            isLatest={filters.is_latest === '1'}
            onCategoryToggle={handleCategoryToggle}
            onPriceChange={handlePriceChange}
            onFeatureToggle={handleFeatureToggle}
            onReset={() => onFiltersChange({})}
        />
    );
};

export default ProductFilters;
