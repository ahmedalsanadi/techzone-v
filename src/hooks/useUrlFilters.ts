// src/hooks/useUrlFilters.ts
'use client';

import { useMemo, useTransition, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';

interface UseUrlFiltersOptions {
    defaultPerPage?: string;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}) {
    const { defaultPerPage = '12' } = options;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const filters = useMemo(() => {
        const queryParams: Record<string, string | undefined> = {};
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        if (!queryParams.per_page) queryParams.per_page = defaultPerPage;
        return queryParams;
    }, [searchParams, defaultPerPage]);

    const updateFilters = useCallback(
        (
            next: Record<string, string | undefined>,
            options: { scroll?: boolean; replace?: boolean } = {},
        ) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(next).forEach(([k, v]) => {
                if (v === undefined || v === null || v === '') {
                    params.delete(k);
                } else {
                    params.set(k, v);
                }
            });

            startTransition(() => {
                const queryString = params.toString();
                const url = `${pathname}${
                    queryString ? `?${queryString}` : ''
                }`;

                if (options.replace !== false) {
                    router.replace(url, { scroll: options.scroll ?? false });
                } else {
                    router.push(url, { scroll: options.scroll ?? false });
                }
            });
        },
        [pathname, router, searchParams],
    );

    const clearFilters = useCallback(
        (keepKeys: string[] = ['per_page']) => {
            const params = new URLSearchParams();
            keepKeys.forEach((key) => {
                const val = searchParams.get(key);
                if (val) params.set(key, val);
            });

            startTransition(() => {
                router.replace(pathname, { scroll: false });
            });
        },
        [pathname, router, searchParams],
    );

    return {
        filters,
        isPending,
        updateFilters,
        clearFilters,
        searchParams,
    };
}
