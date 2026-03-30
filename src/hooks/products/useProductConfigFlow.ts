// src/hooks/useProductConfigFlow.ts
'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartActions } from '@/hooks/cart';
import { generateCartItemId } from '@/lib/cart/utils';
import {
    requiresConfiguration,
    requiresDetailsFetch,
} from '@/lib/products/requirements';
import { storeService } from '@/services/store-service';
import type { Product } from '@/types/store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useProductConfigActions } from '@/components/providers/ProductConfigProvider';
import { track } from '@vercel/analytics';
import { useBranchStore } from '@/store/useBranchStore';
import { branchCookies } from '@/lib/branches';

const PRODUCT_CACHE_TTL = 1000 * 60 * 5;

export function useProductConfigFlow() {
    const t = useTranslations('Product');
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { addToCart } = useCartActions();
    const { openWithProduct } = useProductConfigActions();
    const [loadingProductId, setLoadingProductId] = useState<number | null>(
        null,
    );
    const loadingProductIdRef = useRef(loadingProductId);
    loadingProductIdRef.current = loadingProductId;

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
            [
                'product',
                tenantHost,
                locale,
                branchId ?? 'no-branch',
                slug,
            ] as const,
        [tenantHost, locale, branchId],
    );

    useEffect(() => {
        queryClient.cancelQueries({ queryKey: ['product', tenantHost, locale] });
    }, [branchId, locale, queryClient, tenantHost]);

    const addBasicItem = useCallback(
        (product: Product) => {
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
        },
        [addToCart],
    );

    const handleAddClick = useCallback(
        async (product: Product) => {
            if (loadingProductIdRef.current === product.id) return;

            const needNetwork = requiresDetailsFetch(product);
            if (needNetwork) {
                setLoadingProductId(product.id);
            }

            try {
                let detail: Product;
                if (needNetwork) {
                    detail = await queryClient.fetchQuery({
                        queryKey: productKey(product.slug),
                        queryFn: () => storeService.getProduct(product.slug),
                        staleTime: PRODUCT_CACHE_TTL,
                    });
                } else {
                    queryClient.setQueryData(productKey(product.slug), product);
                    detail = product;
                }

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
                if (needNetwork) {
                    setLoadingProductId(null);
                }
            }
        },
        [queryClient, productKey, t, addBasicItem, openWithProduct],
    );

    return {
        loadingProductId,
        handleAddClick,
    };
}
