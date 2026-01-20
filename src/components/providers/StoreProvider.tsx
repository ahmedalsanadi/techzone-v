//src/components/providers/StoreProvider.tsx
'use client';

import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useEffect,
} from 'react';
import { StoreConfig, Category } from '@/services/types';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { isValidColor } from '@/lib/utils';

interface StoreContextType {
    config: StoreConfig;
    categories: Category[];
}

const StoreContext = createContext<StoreContextType | null>(null);

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

/**
 * Darkens a color by a percentage (0-1)
 */
function darkenColor(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));

    return `#${[r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')}`;
}

/**
 * Creates an rgba color string with opacity
 */
function colorWithOpacity(hex: string, opacity: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

export function StoreProvider({
    children,
    config,
    categories,
}: {
    children: React.ReactNode;
    config: StoreConfig;
    categories: Category[];
}) {
    // Hydrate cart store on mount (order store rehydrates automatically)
    useEffect(() => {
        useCartStore.persist.rehydrate();
    }, []);

    useLayoutEffect(() => {
        if (!config?.theme) return;

        const root = document.documentElement;
        const { primary_color: primary, secondary_color: secondary } =
            config.theme;

        const updateVar = (name: string, val?: string) => {
            if (val && isValidColor(val)) root.style.setProperty(name, val);
        };

        // Set base theme colors
        updateVar('--primary', primary);
        updateVar('--secondary', secondary);

        // Calculate and set primary color variations
        if (primary && isValidColor(primary)) {
            // Hover state (darken by ~12%)
            const primaryHover = darkenColor(primary, 0.12);
            updateVar('--primary-hover', primaryHover);

            // Light tints with opacity
            updateVar('--primary-light', colorWithOpacity(primary, 0.1));
            updateVar('--primary-lighter', colorWithOpacity(primary, 0.05));
            updateVar('--primary-border', colorWithOpacity(primary, 0.3));

            // Update theme-color meta tag
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', primary);
        }

        // Cleanup function
        return () => {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--secondary');
            root.style.removeProperty('--primary-hover');
            root.style.removeProperty('--primary-light');
            root.style.removeProperty('--primary-lighter');
            root.style.removeProperty('--primary-border');
        };
    }, [config]);

    return (
        <StoreContext.Provider value={{ config, categories }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context)
        throw new Error('useStore must be used within a StoreProvider');
    return context;
};
