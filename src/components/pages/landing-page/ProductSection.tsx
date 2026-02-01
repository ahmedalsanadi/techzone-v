//src/components/pages/landing-page/ProductSection.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import { Link } from '@/i18n/navigation';
import { Product } from '@/services/types';
import { useProductConfigFlow } from '@/hooks/useProductConfigFlow';
import { requiresConfiguration } from '@/lib/products/requirements';

interface ProductSectionProps {
    title: string;
    moreHref: string;
    products: Product[];
    translationNamespace?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
    title,
    moreHref,
    products,
    translationNamespace = 'Promotions',
}) => {
    const t = useTranslations(translationNamespace);
    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    // Don't render if no products
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="mt-12 mb-16">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {title}
                </h2>
                <Link
                    href={moreHref}
                    className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-bold transition-all inline-block cursor-pointer hover:text-libero-red hover:scale-105">
                    {t('more')}
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {products.map((product) => {
                    // Calculate discount
                    const salePrice = product.sale_price;
                    const hasDiscount =
                        salePrice !== undefined &&
                        salePrice !== null &&
                        salePrice < product.price;
                    const discountPercent =
                        hasDiscount && salePrice !== undefined
                            ? Math.round(
                                  ((product.price - salePrice) /
                                      product.price) *
                                      100,
                              )
                            : 0;

                    // Determine price and old price
                    const displayPrice = product.sale_price || product.price;
                    const oldPrice = hasDiscount ? product.price : undefined;

                    // Generate product href
                    const productHref = `/products/${product.slug}`;

                    // Get category ID for cart (use first category if available)
                    const categoryId =
                        product.categories && product.categories.length > 0
                            ? String(product.categories[0].id)
                            : 'general';

                    return (
                        <ProductCard
                            key={product.id}
                            name={product.title}
                            image={product.cover_image_url}
                            price={displayPrice}
                            oldPrice={oldPrice}
                            href={productHref}
                            productId={product.id}
                            productSlug={product.slug}
                            discountBadge={
                                hasDiscount
                                    ? t('save', {
                                          amount: `${discountPercent}%`,
                                      })
                                    : undefined
                            }
                            onAddToCartClick={() => handleAddClick(product)}
                            isAdding={loadingProductId === product.id}
                            addToCartLabel={
                                requiresConfiguration(product)
                                    ? t('customize') || 'Customize'
                                    : t('addToCart')
                            }
                            onPrefetch={() => prefetchProduct(product)}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default ProductSection;
