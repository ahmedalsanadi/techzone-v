// src/hooks/useProductConfigFlow.ts
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartActions } from '@/hooks/useCartActions';
import { generateCartItemId } from '@/lib/cart/utils';
import { requiresConfiguration } from '@/lib/products/requirements';
import { storeService } from '@/services/store-service';
import type { Product } from '@/services/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useProductConfigContext } from '@/components/providers/ProductConfigProvider';

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
            const detail = await queryClient.fetchQuery({
                queryKey: ['product', product.slug],
                queryFn: () => storeService.getProduct(product.slug),
                staleTime: 1000 * 60 * 5,
            });

            if (!detail.is_available) {
                toast.error(t('outOfStock') || 'Out of stock');
                return;
            }

            if (requiresConfiguration(detail)) {
                openWithProduct(detail);
            } else {
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
            queryKey: ['product', product.slug],
            queryFn: () => storeService.getProduct(product.slug),
            staleTime: 1000 * 60 * 5,
        });
    };

    return {
        loadingProductId,
        handleAddClick,
        prefetchProduct,
    };
}
