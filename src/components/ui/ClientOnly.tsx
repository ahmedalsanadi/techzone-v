'use client';

import React, { useSyncExternalStore } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A wrapper to ensure components only render on the client side.
 * Useful for preventing hydration mismatches with dynamic data (cart counts, user state).
 */
export const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
    // Avoid setState-in-effect (lint rule): determine client-ness via SyncExternalStore.
    const isMounted = useSyncExternalStore(
        () => () => {
            /* no-op */
        },
        () => true,
        () => false,
    );

    if (!isMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
