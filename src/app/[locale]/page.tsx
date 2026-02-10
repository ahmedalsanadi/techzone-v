import LandingPage from '@/components/landing/LandingPage';
import { getServerStoreConfig } from '@/services/store-config';
import { storeService } from '@/services/store-service';
import { Product, HomeSections } from '@/types/store';

/**
 * Server component that fetches products based on enabled sections.
 * Receives home_sections from layout via shared server context.
 */
export default async function HomePage() {
    // Get config from shared server context (deduplicated with layout fetch)
    const config = await getServerStoreConfig();
    const homeSections = config?.home_sections;

    // If no config, return empty (layout handles ServiceUnavailableFallback)
    if (!homeSections) {
        return (
            <LandingPage
                featuredProducts={[]}
                offersProducts={[]}
                newArrivalsProducts={[]}
            />
        );
    }

    // Section fetchers map - only fetch what's enabled
    const sectionFetchers: Array<{
        key: keyof Pick<
            HomeSections,
            'show_featured_products' | 'show_new_arrivals' | 'show_offers'
        >;
        fetcher: () => Promise<{ data: Product[] }>;
    }> = [];

    // Featured Products
    if (homeSections.show_featured_products) {
        sectionFetchers.push({
            key: 'show_featured_products',
            fetcher: () =>
                storeService.getProducts({
                    is_featured: true,
                    per_page: 8,
                }),
        });
    }

    // New Arrivals
    if (homeSections.show_new_arrivals) {
        sectionFetchers.push({
            key: 'show_new_arrivals',
            fetcher: () =>
                storeService.getProducts({
                    is_latest: true,
                    per_page: 8,
                    sort: 'created_at',
                    order: 'desc',
                }),
        });
    }

    // Offers - filter products with discounts
    // ⚠️ TEMPORARY: Client-side filtering until backend supports is_on_sale filter
    // TODO: Replace with backend filter (is_on_sale=true) when available
    // This affects: pagination accuracy, cache efficiency, and total counts
    if (homeSections.show_offers) {
        sectionFetchers.push({
            key: 'show_offers',
            fetcher: () =>
                storeService
                    .getProducts({
                        per_page: 8,
                    })
                    .then((result) => {
                        // Filter products that have discounts (sale_price)
                        return {
                            data: result.data.filter(
                                (product) =>
                                    product.sale_price &&
                                    product.sale_price < product.price,
                            ),
                        };
                    }),
        });
    }

    // Fetch only enabled sections in parallel
    let featuredProducts: Product[] = [];
    let newArrivalsProducts: Product[] = [];
    let offersProducts: Product[] = [];

    if (sectionFetchers.length > 0) {
        try {
            const results = await Promise.allSettled(
                sectionFetchers.map((f) => f.fetcher()),
            );

            results.forEach((result, index) => {
                const section = sectionFetchers[index];
                if (result.status === 'fulfilled') {
                    const products = (result.value.data || []) as Product[];
                    if (section.key === 'show_featured_products') {
                        featuredProducts = products;
                    } else if (section.key === 'show_new_arrivals') {
                        newArrivalsProducts = products;
                    } else if (section.key === 'show_offers') {
                        offersProducts = products;
                    }
                } else {
                    console.error(
                        `[HomePage] Failed to fetch ${section.key}:`,
                        result.reason,
                    );
                }
            });
        } catch (error) {
            console.error('[HomePage] Error fetching products:', error);
        }
    }

    return (
        <LandingPage
            featuredProducts={featuredProducts}
            offersProducts={offersProducts}
            newArrivalsProducts={newArrivalsProducts}
        />
    );
}
