// src/components/pages/products/ProductsMainSection.tsx
'use client';

import React from 'react';
import ProductsHeader from './ProductsHeader';
import ProductsGrid from './ProductsGrid';
import { Product, PaginationMeta } from '@/services/types';
import { useCartActions } from '@/hooks/useCartActions';
import { cn } from '@/lib/utils';

interface ProductsMainSectionProps {
    products: Product[];
    loading: boolean;
    isFetching: boolean;
    isPending: boolean;
    pagination?: PaginationMeta;
    currentPage: number;
    filters: Record<string, string | undefined>;
    onUpdateFilters: (next: Record<string, string | undefined>) => void;
}

export function ProductsMainSection({
    products,
    loading,
    isFetching,
    isPending,
    pagination,
    currentPage,
    filters,
    onUpdateFilters,
}: ProductsMainSectionProps) {
    const { addToCart } = useCartActions();

    return (
        <div className="lg:col-span-3 space-y-6 relative z-0">
            <ProductsHeader
                sortBy={filters.sort}
                order={filters.order}
                onSortChange={(sort, order) =>
                    onUpdateFilters({
                        ...filters,
                        sort,
                        order,
                        page: '1',
                    })
                }
            />

            <div
                className={cn(
                    'transition-opacity duration-200',
                    isPending || isFetching
                        ? 'opacity-50 pointer-events-none'
                        : 'opacity-100',
                )}>
                <ProductsGrid
                    products={products}
                    loading={loading}
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={(p) =>
                        onUpdateFilters({ ...filters, page: String(p) })
                    }
                    onAddToCart={(product) => {
                        addToCart({
                            id: String(product.id),
                            name: product.title,
                            image: product.cover_image_url || '',
                            price: product.price,
                            categoryId: String(
                                product.categories?.[0]?.id || '',
                            ),
                            metadata: {
                                productId: product.id, // CRITICAL: Required for API calls
                                productSlug: product.slug,
                            },
                        });
                    }}
                />
            </div>
        </div>
    );
}
