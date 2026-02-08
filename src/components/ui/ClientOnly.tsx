'use client';

import React, { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A wrapper to ensure components only render on the client side.
 * Useful for preventing hydration mismatches with dynamic data (cart counts, user state).
 */
export const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
