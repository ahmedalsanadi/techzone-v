// src/components/pages/products/ProductsContent.tsx
'use client';

import React, { useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import ProductsGrid from './ProductsGrid';
import ProductsSorting from './ProductsSorting';
import ProductFilters from './ProductFilters';
import { cn } from '@/lib/utils';

interface ProductsContentProps {
    initialFilters?: Record<string, string | undefined>; // Optional, kept for API compatibility but not used (filters come from searchParams)
}

const ProductsContent = ({}: ProductsContentProps) => {
    const t = useTranslations('Product');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Derive filters from URL searchParams
    const filters = useMemo(() => {
        const queryParams: Record<string, string | undefined> = {};
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        // Ensure per_page is always set for the query key
        if (!queryParams.per_page) queryParams.per_page = '8';
        return queryParams;
    }, [searchParams]);

    const {
        data: productsResult,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
        placeholderData: keepPreviousData,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => storeService.getCategories(true),
    });

    const updateFilters = (newFilters: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        if (Object.keys(newFilters).length === 0) {
            // Clear all filters except per_page
            Array.from(params.keys()).forEach((key) => {
                if (key !== 'per_page') params.delete(key);
            });
        } else {
            // Merge new filters
            Object.entries(newFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });
        }

        // Always ensure per_page 10
        params.set('per_page', '8');

        const queryString = params.toString();
        const url = `${pathname}${queryString ? `?${queryString}` : ''}`;

        startTransition(() => {
            router.replace(url, { scroll: false });
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:sticky lg:top-24 lg:self-start lg:z-10">
                    <ProductFilters
                        categories={categories}
                        filters={filters}
                        onFiltersChange={updateFilters}
                    />
                </div>

                {/* Products Section */}
                <div className="lg:col-span-3 space-y-6 relative z-0">
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

                    <div
                        className={cn(
                            'transition-opacity duration-200 min-h-[600px] flex flex-col',
                            isFetching || isPending
                                ? 'opacity-50 pointer-events-none'
                                : 'opacity-100',
                        )}>
                        <ProductsGrid
                            products={productsResult?.data || []}
                            loading={isLoading}
                            currentPage={Number(filters.page || '1')}
                            pagination={productsResult?.meta}
                            variant="compact"
                            onPageChange={(page) =>
                                updateFilters({
                                    ...filters,
                                    page: page.toString(),
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsContent;
