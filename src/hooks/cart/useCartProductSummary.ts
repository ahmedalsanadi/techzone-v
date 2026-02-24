import { useCallback } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useCartStore } from '@/store/useCartStore';
import {
    summarizeCartProduct,
    type CartProductSummary,
} from '@/lib/cart/utils';

type Summary = CartProductSummary | null;

const isSummaryEqual = (a: Summary, b: Summary) => {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    return (
        a.totalQty === b.totalQty &&
        a.activeItemId === b.activeItemId &&
        a.activeItemQty === b.activeItemQty
    );
};

export function useCartProductSummary(productId?: number): Summary {
    const selector = useCallback(
        (s: ReturnType<typeof useCartStore.getState>) => {
            if (!productId || typeof productId !== 'number') return null;
            return summarizeCartProduct(s.items, productId);
        },
        [productId],
    );

    return useStoreWithEqualityFn(useCartStore, selector, isSummaryEqual);
}

