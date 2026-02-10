//src/components/providers/StoreProvider.tsx
'use client';

import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useEffect,
    useRef,
} from 'react';
import { StoreConfig, Category, CMSPage } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';
import { isValidColor, generateThemeVariables } from '@/lib/theme-utils';

interface StoreContextType {
    config: StoreConfig;
    categories: Category[];
    cmsPages: CMSPage[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({
    children,
    config,
    categories,
    cmsPages,
}: {
    children: React.ReactNode;
    config: StoreConfig;
    categories: Category[];
    cmsPages: CMSPage[];
}) {
    // Track previous theme colors to avoid unnecessary updates
    const prevThemeRef = useRef<string | null>(null);

    // Hydrate cart store on mount (order store rehydrates automatically)
    useEffect(() => {
        useCartStore.persist.rehydrate();
    }, []);

    useLayoutEffect(() => {
        if (!config?.theme) return;

        const root = document.documentElement;
        const { primary_color: primary, secondary_color: secondary } =
            config.theme;

        // Create a unique key from theme colors to detect changes
        const themeKey = `${primary || ''}|${secondary || ''}`;

        // Skip update if theme hasn't changed (optimization)
        // Server-side ThemeStyles already sets these, so this is mainly for dynamic updates
        if (prevThemeRef.current === themeKey) {
            return;
        }
        prevThemeRef.current = themeKey;

        // Generate all theme variables using shared utility
        const variables = generateThemeVariables(primary, secondary);

        // Apply all CSS variables
        Object.entries(variables).forEach(([key, value]) => {
            if (value && isValidColor(value)) {
                root.style.setProperty(`--${key}`, value);
            }
        });

        // Update theme-color meta tag
        if (primary && isValidColor(primary)) {
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', primary);
        }

        // No cleanup function - themes are global document state, not component lifecycle
        // Removing CSS variables on unmount could break server-injected vars if:
        // - Provider unmounts due to navigation
        // - Error boundary remounts
        // - Layout nesting changes
        // Themes persist across component lifecycle and should only change on explicit tenant switch
    }, [config]);

    return (
        <StoreContext.Provider value={{ config, categories, cmsPages }}>
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
