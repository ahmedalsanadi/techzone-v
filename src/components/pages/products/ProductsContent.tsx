// src/components/pages/products/ProductsContent.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import ProductsGrid from './ProductsGrid';
import ProductsSorting from './ProductsSorting';
import ProductFilters from './ProductFilters';


interface ProductsContentProps {
    initialFilters: Record<string, string | undefined>;
}

const ProductsContent = ({ initialFilters }: ProductsContentProps) => {
    const t = useTranslations('Product');
    const router = useRouter();
    const pathname = usePathname();

    const [filters, setFilters] = useState(initialFilters);

    const { data: productsResult, isLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => storeService.getCategories(true),
    });

    const updateFilters = (newFilters: Record<string, string | undefined>) => {
        setFilters(newFilters);

        // Update URL
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        const queryString = params.toString();
        router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, {
            scroll: false,
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <ProductFilters
                    categories={categories}
                    filters={filters}
                    onFiltersChange={updateFilters}
                />

                {/* Products Section */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">{t('products')}</h1>
                        <ProductsSorting
                            sortBy={filters.sort}
                            order={filters.order}
                            onSortChange={(
                                sort: string | undefined,
                                order: string | undefined,
                            ) => updateFilters({ ...filters, sort, order })}
                        />
                    </div>

                    <ProductsGrid
                        products={productsResult?.data || []}
                        loading={isLoading}
                        pagination={productsResult?.meta}
                        onPageChange={(page) =>
                            updateFilters({ ...filters, page: page.toString() })
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductsContent;
