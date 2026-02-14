// src/hooks/useProductConfigFlow.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartActions } from '@/hooks/cart';
import { generateCartItemId } from '@/lib/cart/utils';
import { requiresConfiguration } from '@/lib/products/requirements';
import { storeService } from '@/services/store-service';
import type { Product } from '@/types/store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useProductConfigContext } from '@/components/providers/ProductConfigProvider';
import { track } from '@vercel/analytics';
import { useBranchStore } from '@/store/useBranchStore';
import { branchCookies } from '@/lib/branches';

const PRODUCT_CACHE_TTL = 1000 * 60 * 5;

export function useProductConfigFlow() {
    const t = useTranslations('Product');
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { addToCart } = useCartActions();
    const { openWithProduct } = useProductConfigContext();
    const [loadingProductId, setLoadingProductId] = useState<number | null>(null);

    const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
    const branchIdFromCookie = useMemo(() => {
        const raw = branchCookies.getBranchId();
        const n = raw ? Number(raw) : NaN;
        return Number.isFinite(n) ? n : null;
    }, [selectedBranchId]);
    const branchId = selectedBranchId ?? branchIdFromCookie;

    const tenantHost = useMemo(() => {
        if (typeof window === 'undefined') return 'server';
        return window.location.host || 'unknown-tenant';
    }, []);

    const productKey = useMemo(
        () => (slug: string) =>
            ['product', tenantHost, locale, branchId ?? 'no-branch', slug] as const,
        [tenantHost, locale, branchId],
    );

    // Avoid accumulating stale cross-branch product details in memory (optional but tidy).
    useEffect(() => {
        // When branch/locale changes, any in-flight detail fetch should not surface as "current".
        // Query keys already separate caches, so this is just a safety cancel.
        queryClient.cancelQueries({ queryKey: ['product', tenantHost, locale] });
    }, [branchId, locale, queryClient, tenantHost]);

    const addBasicItem = (product: Product) => {
        addToCart({
            id: generateCartItemId(product.id, {}),
            name: product.title,
            image: product.cover_image_url || '',
            price: product.sale_price || product.price,
            categoryId: String(product.categories?.[0]?.id || ''),
            metadata: {
                productId: product.id,
                productSlug: product.slug,
            },
        });
    };

    const handleAddClick = async (product: Product) => {
        if (loadingProductId === product.id) return;
        setLoadingProductId(product.id);

        try {
            const detail = await queryClient.fetchQuery({
                queryKey: productKey(product.slug),
                queryFn: () => storeService.getProduct(product.slug),
                staleTime: PRODUCT_CACHE_TTL,
            });

            if (!detail.is_available) {
                toast.error(t('outOfStock') || 'Out of stock');
                return;
            }

            if (requiresConfiguration(detail)) {
                track('product_config_required', {
                    productId: detail.id,
                    slug: detail.slug,
                });
                openWithProduct(detail);
            } else {
                track('product_direct_add', {
                    productId: detail.id,
                    slug: detail.slug,
                });
                addBasicItem(detail);
            }
        } catch {
            toast.error(
                t('loadProductError') || 'Unable to load product details',
            );
        } finally {
            setLoadingProductId(null);
        }
    };

    const prefetchProduct = async (product: Product) => {
        if (!product.slug) return;
        await queryClient.prefetchQuery({
            queryKey: productKey(product.slug),
            queryFn: () => storeService.getProduct(product.slug),
            staleTime: PRODUCT_CACHE_TTL,
        });
    };

    return {
        loadingProductId,
        handleAddClick,
        prefetchProduct,
    };
}
