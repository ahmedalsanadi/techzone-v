//src/components/pages/landing-page/ProductSection.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import { Link } from '@/i18n/navigation';
import { Product } from '@/types/store';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';
import { getProductDisplayPrice } from '@/lib/products/price';

interface ProductSectionProps {
    title: string;
    moreHref: string;
    products: Product[];
    translationNamespace?: string;
    priority?: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({
    title,
    moreHref,
    products,
    translationNamespace = 'Promotions',
    priority = false,
}) => {
    const t = useTranslations(translationNamespace);
    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    // Don't render if no products
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="animate-in fade-in duration-700 fill-mode-both">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    {title}
                </h2>
                <Link
                    href={moreHref}
                    className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-bold transition-all inline-block cursor-pointer hover:text-libero-red hover:scale-105">
                    {t('more')}
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ">
                {products.map((product, index) => {
                    const { price, originalPrice, discountPercent } =
                        getProductDisplayPrice(product);
                    const productHref = `/products/${product.slug}`;

                    return (
                        <ProductCard
                            key={product.id}
                            name={product.title}
                            image={product.cover_image_url}
                            price={price}
                            oldPrice={originalPrice}
                            href={productHref}
                            productId={product.id}
                            productSlug={product.slug}
                            priority={priority && index < 5}
                            discountBadge={
                                discountPercent
                                    ? t('save', {
                                          amount: `${discountPercent}%`,
                                      })
                                    : undefined
                            }
                            media={product.media}
                            onAddToCartClick={() => handleAddClick(product)}
                            isAdding={loadingProductId === product.id}
                            index={index}
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
