'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    CATEGORIES,
    Category,
    Product,
    fetchCategories,
    fetchProducts,
} from '@/data/mock-data';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import CategoryTabs from './CategoryTabs';
import SubCategorySelection from './SubCategorySelection';
import ProductsGrid from './ProductsGrid';

interface ProductsContentProps {
    initialCategorySlug?: string;
}

const ProductsContent = ({ initialCategorySlug }: ProductsContentProps) => {
    const t = useTranslations('Product');
    const router = useRouter();
    const pathname = usePathname();

    const initialCategory = useMemo(() => {
        if (!initialCategorySlug) return CATEGORIES[0];
        return (
            CATEGORIES.find((c) => c.slug === initialCategorySlug) ||
            CATEGORIES[0]
        );
    }, [initialCategorySlug]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        initialCategory.id,
    );
    const [selectedSubCategoryId, setSelectedSubCategoryId] =
        useState<string>('');

    const { data: categories = [], isLoading: categoriesLoading } = useQuery<
        Category[]
    >({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { data: allProducts = [], isLoading: productsLoading } = useQuery<
        Product[]
    >({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    const activeCategory = useMemo(
        () => categories.find((c: Category) => c.id === selectedCategoryId),
        [categories, selectedCategoryId],
    );

    const subCategories = useMemo(
        () => activeCategory?.children || [],
        [activeCategory],
    );

    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === '1' || !selectedCategoryId)
            return allProducts;

        return allProducts.filter((p: Product) => {
            const isMainCategoryMatch = p.categoryId === selectedCategoryId;
            if (!isMainCategoryMatch) return false;

            // If no subcategory is selected, show all in this category
            if (!selectedSubCategoryId) return true;

            const subCat = subCategories.find(
                (s: Category) => s.id === selectedSubCategoryId,
            );
            if (subCat?.slug === 'all') return true;

            return p.subCategoryId === selectedSubCategoryId;
        });
    }, [allProducts, selectedCategoryId, selectedSubCategoryId, subCategories]);

    const handleCategoryChange = (id: string) => {
        setSelectedCategoryId(id);
        const category = categories.find((c: Category) => c.id === id);

        // Update URL slug without refreshing
        if (category && category.id !== '1') {
            router.replace(`${pathname}?category=${category.slug}`, {
                scroll: false,
            });
        } else {
            router.replace(pathname, { scroll: false });
        }

        if (category?.children && category.children.length > 0) {
            // Default to 'All' subcategory if it exists
            const allSub = category.children.find(
                (s: Category) => s.slug === 'all',
            );
            setSelectedSubCategoryId(allSub?.id || category.children[0].id);
        } else {
            setSelectedSubCategoryId('');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="sr-only">{t('products')}</h1>
            <CategoryTabs
                categories={categories}
                activeCategoryId={selectedCategoryId}
                onCategorySelect={handleCategoryChange}
            />

            <SubCategorySelection
                subCategories={subCategories}
                activeSubCategoryId={selectedSubCategoryId}
                onSubCategorySelect={setSelectedSubCategoryId}
            />

            <ProductsGrid
                products={filteredProducts}
                loading={productsLoading || categoriesLoading}
            />
        </div>
    );
};

export default ProductsContent;
