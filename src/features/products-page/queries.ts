import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import type { ProductsPageState } from './types';
import { buildProductsListParams } from './types';
import { productsPageKeys } from './queryKeys';
import type { ProductsPageQueryContext } from './queryKeys';
import type { ProductsFiltersVars, Product } from '@/types/store';
import type { PaginationMeta } from '@/types/api';

type ProductsListResponse = { data: Product[]; meta: PaginationMeta };

export function productsPageProductsQueryOptions(
    state: ProductsPageState,
    ctx: ProductsPageQueryContext,
    opts?: { keepPrevious?: boolean; initialData?: ProductsListResponse },
) {
    return queryOptions({
        queryKey: productsPageKeys.products(state, ctx),
        queryFn: ({ signal }) =>
            storeService.getProducts(buildProductsListParams(state), { signal }),
        ...(opts?.initialData ? { initialData: opts.initialData } : {}),
        placeholderData: opts?.keepPrevious ? keepPreviousData : undefined,
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });
}

export function productsPageFiltersVarsQueryOptions(
    args: {
        search?: string;
        category_id?: string;
    },
    ctx: ProductsPageQueryContext,
    opts?: { initialData?: ProductsFiltersVars },
) {
    return queryOptions({
        queryKey: productsPageKeys.filtersVars(args, ctx),
        queryFn: ({ signal }) => storeService.getProductsFilters(args, { signal }),
        ...(opts?.initialData ? { initialData: opts.initialData } : {}),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
}

