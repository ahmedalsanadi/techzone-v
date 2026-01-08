// src/components/pages/products/ProductsGrid.tsx
'use client';

import React from 'react';
import { Product, PaginationMeta } from '@/services/types';
import ProductCard from '@/components/ui/ProductCard';
import { useTranslations } from 'next-intl';
import { useCartActions } from '@/hooks/useCartActions';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
    products,
    loading,
    pagination,
    onPageChange,
}) => {
    const t = useTranslations('Promotions');
    const { addToCart } = useCartActions();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-100 animate-pulse rounded-3xl aspect-square"
                    />
                ))}
            </div>
        );
    }

    if (!loading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-lg font-medium">{t('noProducts')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={product.title}
                        image={product.cover_image_url || ''}
                        price={product.price}
                        oldPrice={product.sale_price}
                        href={`/products/${product.slug || product.id}`}
                        addToCartLabel={t('addToCart')}
                        onAddToCartClick={() => {
                            addToCart({
                                id: String(product.id),
                                name: product.title,
                                image: product.cover_image_url || '',
                                price: product.price,
                                categoryId: String(
                                    product.categories[0]?.id || '',
                                ),
                            });
                        }}
                    />
                ))}
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.current_page === 1}
                        onClick={() =>
                            onPageChange?.(pagination.current_page - 1)
                        }>
                        <ChevronLeft className="w-4 h-4 mr-2 rtl:rotate-180" />
                        {t('previous')}
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({
                            length: Math.min(5, pagination.last_page),
                        }).map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={
                                        pagination.current_page === pageNum
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => onPageChange?.(pageNum)}>
                                    {pageNum}
                                </Button>
                            );
                        })}
                        {pagination.last_page > 5 && (
                            <span className="px-2">...</span>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                            pagination.current_page === pagination.last_page
                        }
                        onClick={() =>
                            onPageChange?.(pagination.current_page + 1)
                        }>
                        {t('next')}
                        <ChevronRight className="w-4 h-4 ml-2 rtl:rotate-180" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ProductsGrid;
