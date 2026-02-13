// src/components/pages/products/ProductsView.tsx
'use client';

import ProductFilters from './ProductFilters';
import { useProductsView } from '@/hooks/products';
import { ProductsMainSection } from './ProductsMainSection';

export default function ProductsView() {
    const {
        filters,
        productsData,
        isLoadingProducts,
        isFetchingProducts,
        categories,
        isPending,
        updateFilters,
    } = useProductsView();

    return (
        <div className="container mx-auto px-4 py-10">
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
                <ProductsMainSection
                    products={productsData?.data ?? []}
                    loading={isLoadingProducts}
                    isFetching={isFetchingProducts}
                    isPending={isPending}
                    pagination={productsData?.meta}
                    currentPage={Number(filters.page || 1)}
                    filters={filters}
                    onUpdateFilters={updateFilters}
                />
            </div>
        </div>
    );
}
