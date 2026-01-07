'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Product, Category } from '@/services/types';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import CategoryTabs from './CategoryTabs';
import SubCategorySelection from './SubCategorySelection';
import ProductsGrid from './ProductsGrid';

interface ProductsContentProps {
    initialCategorySlug?: string;
    initialCategoryId?: string;
}

const ProductsContent = ({
    initialCategorySlug,
    initialCategoryId,
}: ProductsContentProps) => {
    const t = useTranslations('Product');
    const router = useRouter();
    const pathname = usePathname();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        initialCategoryId || '',
    );
    const [selectedSubCategoryId, setSelectedSubCategoryId] =
        useState<string>('');

    const { data: categories = [], isLoading: categoriesLoading } = useQuery<
        Category[]
    >({
        queryKey: ['categories'],
        queryFn: () => storeService.getCategories(true),
    });

    const { data: productsResult, isLoading: productsLoading } = useQuery({
        queryKey: ['products', selectedCategoryId],
        queryFn: () =>
            storeService.getProducts({ category_id: selectedCategoryId }),
    });

    const allProducts = productsResult?.data || [];

    // Update selected category if slug is provided but ID isn't set yet (e.g. initial mount)
    useEffect(() => {
        if (
            initialCategorySlug &&
            !selectedCategoryId &&
            categories.length > 0
        ) {
            const cat = categories.find((c) => c.slug === initialCategorySlug);
            if (cat) setSelectedCategoryId(cat.id.toString());
        }
    }, [initialCategorySlug, categories, selectedCategoryId]);

    const activeCategory = useMemo(
        () => categories.find((c) => c.id.toString() === selectedCategoryId),
        [categories, selectedCategoryId],
    );

    const subCategories = useMemo(
        () => activeCategory?.children || [],
        [activeCategory],
    );

    const filteredProducts = useMemo(() => {
        if (!selectedSubCategoryId) return allProducts;

        return allProducts.filter((p) => {
            // In a real API, products might already be filtered by the main category_id from the query
            // We just need to filter by subcategory if selected
            return p.categoryId?.toString() === selectedSubCategoryId;
        });
    }, [allProducts, selectedSubCategoryId]);

    const handleCategoryChange = (id: string) => {
        const idStr = id.toString();
        setSelectedCategoryId(idStr);
        setSelectedSubCategoryId(''); // Reset subcategory when main category changes

        const category = categories.find((c) => c.id.toString() === idStr);

        // Update URL slug without refreshing
        if (category) {
            const query = new URLSearchParams();
            if (category.slug) query.set('category', category.slug);
            query.set('category_id', category.id.toString());

            router.replace(`${pathname}?${query.toString()}`, {
                scroll: false,
            });
        } else {
            router.replace(pathname, { scroll: false });
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
