'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order-service';
import type { Order } from '@/types/orders';
import type { PaginationMeta } from '@/types/api';

export const ordersListKey = (perPage: number) =>
    ['orders', 'list', { per_page: perPage }] as const;

const PER_PAGE = 10;

export interface UseOrdersListOptions {
    initialOrders?: Order[];
    initialMeta?: PaginationMeta;
}

export function useOrdersList(options: UseOrdersListOptions = {}) {
    const { initialOrders, initialMeta } = options;

    const query = useInfiniteQuery({
        queryKey: ordersListKey(PER_PAGE),
        queryFn: async ({ pageParam }) => {
            const response = await orderService.getOrders({
                page: pageParam,
                per_page: PER_PAGE,
            });
            return response;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const meta = lastPage.meta;
            if (!meta || meta.current_page >= meta.last_page) return undefined;
            return meta.current_page + 1;
        },
        initialData:
            initialOrders != null && initialOrders.length > 0 && initialMeta
                ? {
                      pages: [
                          {
                              data: initialOrders,
                              success: true,
                              message: '',
                              meta: initialMeta,
                          },
                      ],
                      pageParams: [1],
                  }
                : undefined,
        staleTime: 60 * 1000,
    });

    const orders = query.data?.pages.flatMap((p) => p.data ?? []) ?? [];
    const meta = query.data?.pages[query.data.pages.length - 1]?.meta;
    const hasNextPage = !!query.hasNextPage;
    const isFetchingNextPage = query.isFetchingNextPage;

    return {
        orders,
        meta,
        hasNextPage,
        fetchNextPage: query.fetchNextPage,
        isFetchingNextPage,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
