'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types/store';
import ProductSection from './ProductSection';

export default function HomeProductSection({
    namespace,
    moreHref,
    products,
    priority,
}: {
    namespace: 'FeaturedProducts' | 'NewArrivals' | 'Promotions';
    moreHref: string;
    products: Product[];
    priority?: boolean;
}) {
    const t = useTranslations(namespace);

    return (
        <ProductSection
            title={t('title')}
            moreHref={moreHref}
            products={products}
            translationNamespace={namespace}
            priority={priority}
        />
    );
}
