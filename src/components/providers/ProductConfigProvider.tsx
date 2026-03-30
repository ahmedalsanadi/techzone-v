// src/components/providers/ProductConfigProvider.tsx
'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import ProductConfigModal from '@/components/modals/ProductConfigModal';
import type { Product } from '@/types/store';

/** Stable actions — subscribe without re-rendering when the modal opens/closes. */
interface ProductConfigActionsValue {
    openWithProduct: (product: Product) => void;
    close: () => void;
}

interface ProductConfigStateValue {
    activeProduct: Product | null;
    isOpen: boolean;
}

interface ProductConfigContextValue extends ProductConfigActionsValue,
    ProductConfigStateValue {}

const ProductConfigActionsContext =
    createContext<ProductConfigActionsValue | null>(null);
const ProductConfigStateContext = createContext<ProductConfigStateValue | null>(
    null,
);

export function ProductConfigProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openWithProduct = useCallback((product: Product) => {
        setActiveProduct(product);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setActiveProduct(null);
    }, []);

    const actionsValue = useMemo(
        () => ({ openWithProduct, close }),
        [openWithProduct, close],
    );

    const stateValue = useMemo(
        () => ({ activeProduct, isOpen }),
        [activeProduct, isOpen],
    );

    return (
        <ProductConfigActionsContext.Provider value={actionsValue}>
            <ProductConfigStateContext.Provider value={stateValue}>
                {children}
                {isOpen && activeProduct && (
                    <ProductConfigModal
                        isOpen={isOpen}
                        onClose={close}
                        product={activeProduct}
                    />
                )}
            </ProductConfigStateContext.Provider>
        </ProductConfigActionsContext.Provider>
    );
}

export function useProductConfigActions(): ProductConfigActionsValue {
    const ctx = useContext(ProductConfigActionsContext);
    if (!ctx) {
        throw new Error(
            'useProductConfigActions must be used within ProductConfigProvider',
        );
    }
    return ctx;
}

/** Re-renders when modal opens/closes — use only in UI that must reflect modal state. */
export function useProductConfigState(): ProductConfigStateValue {
    const ctx = useContext(ProductConfigStateContext);
    if (!ctx) {
        throw new Error(
            'useProductConfigState must be used within ProductConfigProvider',
        );
    }
    return ctx;
}

/** Full context — re-renders on modal state changes (avoid in list/add flows). */
export function useProductConfigContext(): ProductConfigContextValue {
    const actions = useProductConfigActions();
    const state = useProductConfigState();
    return { ...actions, ...state };
}
