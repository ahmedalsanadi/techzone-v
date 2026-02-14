// src/app/[locale]/products/page.tsx
import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductsPageClient from '@/features/products-page/ProductsPageClient';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { resolveSiteIdentity } from '@/lib/tenant/resolve-site';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import {
    productsPageStateFromUrlParams,
    type ProductsPageUrlParams,
} from '@/features/products-page/types';
import {
    productsPageProductsQueryOptions,
    productsPageFiltersVarsQueryOptions,
} from '@/features/products-page/queries';
import { cookies, headers } from 'next/headers';
import { BRANCH_COOKIES } from '@/lib/branches/constants';

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Product' });
    const site = await resolveSiteIdentity();
    const sp = (await searchParams) || {};
    const hasQuery = Object.values(sp).some((v) => v != null && v !== '');

    return {
        title: t('products'),
        description: t('products_description'),
        metadataBase: new URL(site.url),
        openGraph: {
            title: t('products'),
            description: t('products_description'),
            type: 'website',
        },
        robots: {
            // List page is indexable, but filtered/paginated variants should not be indexed.
            index: !hasQuery,
            follow: true,
        },
        alternates: {
            canonical: `${site.url}/${locale}/products`,
        },
    };
}

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<ProductsPageUrlParams>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Product' });
    const sp = await searchParams;

    const requestHeaders = await headers();
    const host = requestHeaders.get('x-forwarded-host')?.split(',')[0].trim() || requestHeaders.get('host') || 'server';
    const cookieStore = await cookies();
    const branchIdRaw = cookieStore.get(BRANCH_COOKIES.BRANCH_ID)?.value;
    const branchId = branchIdRaw && Number.isFinite(Number(branchIdRaw)) ? Number(branchIdRaw) : null;

    const queryClient = getQueryClient();
    const state = productsPageStateFromUrlParams(sp);
    const queryCtx = { tenantHost: host, locale, branchId };

    const filtersVarsArgs = {
        search: state.filters.search?.trim() ? state.filters.search.trim() : undefined,
        category_id:
            state.filters.categoryIds.length === 1
                ? state.filters.categoryIds[0]
                : undefined,
    };

    await Promise.all([
        queryClient.prefetchQuery(
            productsPageProductsQueryOptions(state, queryCtx, { keepPrevious: false }),
        ),
        queryClient.prefetchQuery(
            productsPageFiltersVarsQueryOptions(filtersVarsArgs, queryCtx),
        ),
    ]);

    return (
        <main className="min-h-screen bg-gray-50/30 py-12 px-4">
            <div className="container mx-auto px-4 pt-6">
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('products') },
                    ]}
                />
            </div>

            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProductsPageClient />
            </HydrationBoundary>
        </main>
    );
}
