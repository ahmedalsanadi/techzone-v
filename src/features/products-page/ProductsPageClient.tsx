'use client';

import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    productsPageProductsQueryOptions,
    productsPageFiltersVarsQueryOptions,
} from './queries';
import {
    createInitialProductsPageState,
    getSafePaginationMeta,
    productsPageReducer,
    productsPageStateFromUrlParams,
    productsPageStateToUrlParams,
    urlSearchParamsToUrlParams,
} from './types';
import type { ProductsPageOrder, ProductsPageSort } from './types';
import { ProductsFiltersSidebar } from './components/ProductsFiltersSidebar';
import { ProductsPaginationBar } from './components/ProductsPaginationBar';
import {
    ProductsGridSkeleton,
    FilterSidebarSkeleton,
    ResultsHeaderSkeleton,
} from './components/ProductsSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { ProductsResultsSection } from './components/ProductsResultsSection';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useBranchStore } from '@/store/useBranchStore';
import { branchCookies } from '@/lib/branches';
import { useUrlFilters } from '@/hooks/products/useUrlFilters';
import { AppliedFiltersBar } from './components/AppliedFiltersBar';

export default function ProductsPageClient() {
    const t = useTranslations('Product');
    const locale = useLocale();
    const queryClient = useQueryClient();
    const [filtersResetNonce, setFiltersResetNonce] = useState(0);
    const [keepPreviousOnNextFetch, setKeepPreviousOnNextFetch] =
        useState(false);
    const resultsTopRef = useRef<HTMLDivElement | null>(null);
    const {
        filters: urlFilters,
        updateFilters,
        searchParams,
    } = useUrlFilters({
        defaultPerPage: String(8),
    });

    const stateRef = useRef<ReturnType<
        typeof createInitialProductsPageState
    > | null>(null);
    const updateFiltersRef = useRef(updateFilters);
    const searchParamsRef = useRef('');
    const [state, dispatch] = useReducer(productsPageReducer, undefined, () =>
        productsPageStateFromUrlParams(
            urlSearchParamsToUrlParams(
                new URLSearchParams(searchParams.toString()),
            ),
        ),
    );

    // Keep refs updated (stable callbacks without deps)
    useEffect(() => {
        updateFiltersRef.current = updateFilters;
    }, [updateFilters]);

    useEffect(() => {
        searchParamsRef.current = searchParams.toString();
    }, [searchParams]);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Sync state when user navigates back/forward (URL changes)
    useEffect(() => {
        const next = productsPageStateFromUrlParams(urlFilters);
        // Compare via normalized URL params to avoid deep-equality noise
        if (!stateRef.current) return;
        const current = stateRef.current;
        const curParams = productsPageStateToUrlParams(current);
        const nextParams = productsPageStateToUrlParams(next);
        if (JSON.stringify(curParams) !== JSON.stringify(nextParams)) {
            dispatch({ type: 'setAll', state: next });
        }
    }, [urlFilters]);

    const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
    const branchIdFromCookie = useMemo(() => {
        const raw = branchCookies.getBranchId();
        const n = raw ? Number(raw) : NaN;
        return Number.isFinite(n) ? n : null;
    }, []);
    const branchId = selectedBranchId ?? branchIdFromCookie;

    const tenantHost = useMemo(() => {
        if (typeof window === 'undefined') return 'server';
        return window.location.host || 'unknown-tenant';
    }, []);

    const queryCtx = useMemo(
        () => ({ tenantHost, locale, branchId }),
        [tenantHost, locale, branchId],
    );

    const filtersVarsArgs = useMemo(() => {
        // Keep this conservative to avoid making filters endpoint too “chatty”.
        return {
            search: state.filters.search?.trim()
                ? state.filters.search.trim()
                : undefined,
            category_id:
                state.filters.categoryIds.length === 1
                    ? state.filters.categoryIds[0]
                    : undefined,
        };
    }, [state.filters.search, state.filters.categoryIds]);

    const filtersVarsQuery = useQuery(
        productsPageFiltersVarsQueryOptions(filtersVarsArgs, queryCtx),
    );

    const productsQuery = useQuery(
        productsPageProductsQueryOptions(state, queryCtx, {
            keepPrevious: keepPreviousOnNextFetch,
        }),
    );

    const products = productsQuery.data?.data ?? [];
    const meta = getSafePaginationMeta(productsQuery.data?.meta, state);
    const uiPage = productsQuery.isPlaceholderData
        ? meta.current_page
        : state.pagination.page;

    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    const scrollResultsIntoView = useCallback(() => {
        requestAnimationFrame(() => {
            resultsTopRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }, []);

    // Prefetch next page (Amazon-ish)
    useEffect(() => {
        if (!productsQuery.data?.meta) return;
        if (meta.current_page >= meta.last_page) return;

        const nextState = {
            filters: state.filters,
            pagination: {
                page: meta.current_page + 1,
                per_page: state.pagination.per_page,
            },
        };
        void queryClient.prefetchQuery(
            productsPageProductsQueryOptions(nextState, queryCtx, {
                keepPrevious: true,
            }),
        );
    }, [
        meta.current_page,
        meta.last_page,
        productsQuery.data?.meta,
        queryClient,
        state.filters,
        state.pagination.per_page,
        queryCtx,
    ]);

    // If filters reduce pages (or API is inconsistent), clamp the current page.
    useEffect(() => {
        if (state.pagination.page > meta.last_page) {
            dispatch({ type: 'setPage', page: meta.last_page });
        }
    }, [meta.last_page, state.pagination.page]);

    // IMPORTANT: callbacks must be stable; otherwise debounced effects in children will rerun and reset pagination.
    const syncUrlToState = useCallback(
        (
            nextState: ReturnType<typeof createInitialProductsPageState>,
            options: { replace?: boolean; scroll?: boolean } = {},
        ) => {
            const nextParams = productsPageStateToUrlParams(nextState);

            // CRITICAL: `productsPageStateToUrlParams` omits empty filters (e.g. no category_id),
            // so we must explicitly delete stale keys currently in the URL, otherwise the URL->state
            // sync will "re-apply" old filters and re-check UI controls.
            const current = new URLSearchParams(searchParamsRef.current);
            const patch: Record<string, string | undefined> = { ...nextParams };

            const knownKeys = new Set([
                'page',
                'per_page',
                'sort',
                'order',
                'search',
                'category_id',
                'brand_id',
                'collection_id',
                'availability',
                'min_price',
                'max_price',
                'has_discount',
                'has_variants',
                'is_featured',
                'is_latest',
            ]);

            current.forEach((_, key) => {
                const isAttributeKey = /^attributes\[[^\]]+\]$/.test(key);
                if (!knownKeys.has(key) && !isAttributeKey) return;
                if (Object.prototype.hasOwnProperty.call(nextParams, key))
                    return;
                patch[key] = undefined;
            });

            updateFiltersRef.current(patch, options);
        },
        [],
    );

    const handleReset = useCallback(() => {
        setKeepPreviousOnNextFetch(false);
        const next = createInitialProductsPageState();
        dispatch({ type: 'setAll', state: next });
        setFiltersResetNonce((v) => v + 1);
        syncUrlToState(next, { replace: false, scroll: false });
    }, [syncUrlToState]);

    const handleSearchChange = useCallback(
        (value: string) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            if (value === current.filters.search) return;
            const action = { type: 'setSearch', value } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: true, scroll: false }); // avoid history spam while typing
        },
        [syncUrlToState],
    );

    const handleToggleCategory = useCallback(
        (id: string) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'toggleCategory', id } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleToggleBrand = useCallback(
        (id: string) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'toggleBrand', id } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleToggleCollection = useCallback(
        (id: string) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'toggleCollection', id } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleToggleFlag = useCallback(
        (
            key: 'has_discount' | 'has_variants' | 'is_featured' | 'is_latest',
        ) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'toggleFlag', key } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleSetAvailability = useCallback(
        (value?: 'in_stock' | 'out_of_stock' | 'low_stock') => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'setAvailability', value } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleSetPriceRange = useCallback(
        (min?: number, max?: number) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'setPriceRange', min, max } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleSortChange = useCallback(
        (
            sort: ProductsPageSort | undefined,
            order: ProductsPageOrder | undefined,
        ) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = {
                type: 'setSort',
                sort: (sort ?? 'display_order') as ProductsPageSort,
                order: (order ?? 'asc') as ProductsPageOrder,
            } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handlePageChange = useCallback(
        (page: number) => {
            setKeepPreviousOnNextFetch(true);
            const current = stateRef.current!;
            const action = {
                type: 'setPage',
                page: Math.max(1, page),
            } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
            scrollResultsIntoView();
        },
        [scrollResultsIntoView, syncUrlToState],
    );

    const handleToggleAttributeOption = useCallback(
        (slug: string, value: string | number) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = {
                type: 'toggleAttributeOption',
                slug,
                value,
            } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const handleClearAttribute = useCallback(
        (slug: string) => {
            setKeepPreviousOnNextFetch(false);
            const current = stateRef.current!;
            const action = { type: 'clearAttribute', slug } as const;
            const next = productsPageReducer(current, action);
            dispatch(action);
            syncUrlToState(next, { replace: false, scroll: false });
        },
        [syncUrlToState],
    );

    const dimmed = productsQuery.isFetching && !productsQuery.isLoading;

    return (
        <div className="container mx-auto px-4 pt-10 pb-20 relative min-h-[calc(100vh-220px)] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
                <div className="lg:sticky lg:top-24 lg:self-start lg:z-10">
                    {/* Prevent sticky “bounce”: cap height and scroll internally */}
                    <div className="max-h-[calc(100vh-7rem)] overflow-auto overscroll-contain">
                        <ProductsFiltersSidebar
                            // IMPORTANT: do NOT include `page` in the key; otherwise pagination
                            // remounts the sidebar and the debounced search will reset page to 1.
                            key={[
                                filtersResetNonce,
                                state.filters.search,
                                state.filters.min_price ?? '',
                                state.filters.max_price ?? '',
                            ].join(':')}
                            vars={filtersVarsQuery.data}
                            isLoading={filtersVarsQuery.isLoading}
                            state={state}
                            onReset={handleReset}
                            onSearchChange={handleSearchChange}
                            onToggleCategory={handleToggleCategory}
                            onToggleBrand={handleToggleBrand}
                            onToggleCollection={handleToggleCollection}
                            onToggleFlag={handleToggleFlag}
                            onSetAvailability={handleSetAvailability}
                            onSetPriceRange={handleSetPriceRange}
                            onToggleAttributeOption={
                                handleToggleAttributeOption
                            }
                            onClearAttribute={handleClearAttribute}
                        />
                    </div>
                </div>

                <div className="lg:col-span-3 relative z-0 p-1 pb-6 flex flex-col min-h-0">
                    <div ref={resultsTopRef} />
                    {productsQuery.isError ? (
                        <ErrorState
                            title={
                                t('unableToLoadProducts') ||
                                'Unable to load products'
                            }
                            description={
                                productsQuery.error instanceof Error
                                    ? productsQuery.error.message
                                    : t('tryAgain') || 'Please try again.'
                            }
                            onRetry={() => productsQuery.refetch()}
                            onReset={() => dispatch({ type: 'resetAll' })}
                        />
                    ) : productsQuery.isLoading ? (
                        <div className="space-y-6">
                            <ResultsHeaderSkeleton />
                            <ProductsGridSkeleton count={8} />
                        </div>
                    ) : products.length === 0 ? (
                        <EmptyState
                            title={t('noProductsFound') || 'No products found'}
                            description={
                                t('noProductsFoundDesc') ||
                                'Try clearing filters or changing your search.'
                            }
                            onClearFilters={handleReset}
                        />
                    ) : (
                        <ProductsResultsSection
                            products={products}
                            sort={state.filters.sort}
                            order={state.filters.order}
                            dimmed={dimmed}
                            onSortChange={handleSortChange}
                            onAddToCart={handleAddClick}
                            getAddToCartLabel={(product) =>
                                requiresConfiguration(product)
                                    ? t('customize') || 'Customize'
                                    : t('addToCart') || 'Add to cart'
                            }
                            isAddingProductId={loadingProductId}
                            onPrefetchProduct={prefetchProduct}>
                            <AppliedFiltersBar
                                state={state}
                                vars={filtersVarsQuery.data}
                                onResetAll={handleReset}
                                onClearSearch={() => handleSearchChange('')}
                                onToggleCategory={handleToggleCategory}
                                onToggleBrand={handleToggleBrand}
                                onToggleCollection={handleToggleCollection}
                                onSetAvailability={handleSetAvailability}
                                onSetPriceRange={handleSetPriceRange}
                                onToggleFlag={handleToggleFlag}
                                onClearAttribute={handleClearAttribute}
                                onToggleAttributeOption={
                                    handleToggleAttributeOption
                                }
                            />
                            {dimmed ? (
                                <div className="mb-4 text-sm text-gray-500">
                                    {t('updatingResults') ||
                                        'Updating results...'}
                                </div>
                            ) : null}
                        </ProductsResultsSection>
                    )}
                </div>
            </div>

            {/* Pagination always AFTER the grid (end of page) */}
            <div className="mt-auto">
                <ProductsPaginationBar
                    meta={meta}
                    page={uiPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
