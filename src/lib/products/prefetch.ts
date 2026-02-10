import type { QueryClient } from '@tanstack/react-query';
import type { PaginationMeta } from '@/types/api';
import { storeService } from '@/services/store-service';

interface PrefetchNextProductsPageParams {
    queryClient: QueryClient;
    filters: Record<string, string | undefined>;
    pagination?: PaginationMeta;
}

export async function prefetchNextProductsPage({
    queryClient,
    filters,
    pagination,
}: PrefetchNextProductsPageParams) {
    if (!pagination?.current_page || !pagination?.last_page) return;

    const nextPage = pagination.current_page + 1;
    if (nextPage > pagination.last_page) return;

    const nextFilters = { ...filters, page: String(nextPage) };
    await queryClient.prefetchQuery({
        queryKey: ['products', nextFilters],
        queryFn: () => storeService.getProducts(nextFilters),
    });
}
