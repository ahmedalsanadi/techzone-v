// src/components/providers/ProductConfigProvider.tsx
'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import ProductConfigModal from '@/components/modals/ProductConfigModal';
import type { Product } from '@/services/types';

interface ProductConfigContextValue {
    activeProduct: Product | null;
    isOpen: boolean;
    openWithProduct: (product: Product) => void;
    close: () => void;
}

const ProductConfigContext = createContext<ProductConfigContextValue | null>(
    null,
);

export function ProductConfigProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const value = useMemo(
        () => ({
            activeProduct,
            isOpen,
            openWithProduct: (product: Product) => {
                setActiveProduct(product);
                setIsOpen(true);
            },
            close: () => {
                setIsOpen(false);
                setActiveProduct(null);
            },
        }),
        [activeProduct, isOpen],
    );

    return (
        <ProductConfigContext.Provider value={value}>
            {children}
            {isOpen && activeProduct && (
                <ProductConfigModal
                    isOpen={isOpen}
                    onClose={value.close}
                    product={activeProduct}
                />
            )}
        </ProductConfigContext.Provider>
    );
}

export function useProductConfigContext() {
    const context = useContext(ProductConfigContext);
    if (!context) {
        throw new Error(
            'useProductConfigContext must be used within ProductConfigProvider',
        );
    }
    return context;
}
