// src/hooks/useProductConfigFlow.ts
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartActions } from '@/hooks/cart';
import { generateCartItemId } from '@/lib/cart/utils';
import { requiresConfiguration } from '@/lib/products/requirements';
import { storeService } from '@/services/store-service';
import type { Product } from '@/types/store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useProductConfigContext } from '@/components/providers/ProductConfigProvider';
import { track } from '@vercel/analytics';

const PRODUCT_CACHE_TTL = 1000 * 60 * 5;

const getCacheKey = (slug: string) => `product-detail:${slug}`;

const readProductCache = (slug: string): Product | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(getCacheKey(slug));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
            data: Product;
            storedAt: number;
        };
        if (Date.now() - parsed.storedAt > PRODUCT_CACHE_TTL) {
            window.localStorage.removeItem(getCacheKey(slug));
            return null;
        }
        return parsed.data;
    } catch {
        return null;
    }
};

const writeProductCache = (slug: string, data: Product) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(
            getCacheKey(slug),
            JSON.stringify({ data, storedAt: Date.now() }),
        );
    } catch {
        // ignore storage write failures
    }
};

export function useProductConfigFlow() {
    const t = useTranslations('Product');
    const queryClient = useQueryClient();
    const { addToCart } = useCartActions();
    const { openWithProduct } = useProductConfigContext();
    const [loadingProductId, setLoadingProductId] = useState<number | null>(null);

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
            const cached = readProductCache(product.slug);
            if (cached) {
                queryClient.setQueryData(['product', product.slug], cached);
            }
            const detail = await queryClient.fetchQuery({
                queryKey: ['product', product.slug],
                queryFn: () => storeService.getProduct(product.slug),
                staleTime: PRODUCT_CACHE_TTL,
            });
            writeProductCache(product.slug, detail);

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
        const cached = readProductCache(product.slug);
        if (cached) {
            queryClient.setQueryData(['product', product.slug], cached);
            return;
        }
        await queryClient.prefetchQuery({
            queryKey: ['product', product.slug],
            queryFn: () => storeService.getProduct(product.slug),
            staleTime: PRODUCT_CACHE_TTL,
        });
        const data = queryClient.getQueryData<Product>([
            'product',
            product.slug,
        ]);
        if (data) {
            writeProductCache(product.slug, data);
        }
    };

    return {
        loadingProductId,
        handleAddClick,
        prefetchProduct,
    };
}
