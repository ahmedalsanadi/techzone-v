import LandingPage from '@/components/pages/landing-page/LandingPage';
import { storeService } from '@/services/store-service';
import { Product } from '@/services/types';

export default async function HomePage() {
    // Fetch all product sections in parallel
    // LandingPage (client) will read config from context and only render enabled sections
    const fetchPromises = [
        // Featured Products
        storeService.getProducts({
            is_featured: true,
            per_page: 8,
        }),
        // New Arrivals
        storeService.getProducts({
            is_latest: true,
            per_page: 8,
            sort: 'created_at',
            order: 'desc',
        }),
        // Offers - filter products with discounts
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
    ];

    // Fetch all sections in parallel
    let featuredProducts: Product[] = [];
    let newArrivalsProducts: Product[] = [];
    let offersProducts: Product[] = [];

    try {
        const results = await Promise.allSettled(fetchPromises);

        // Featured Products
        if (results[0].status === 'fulfilled') {
            featuredProducts = (results[0].value.data || []) as Product[];
        } else {
            console.error(
                '[HomePage] Failed to fetch featured products:',
                results[0].reason,
            );
        }

        // New Arrivals
        if (results[1].status === 'fulfilled') {
            newArrivalsProducts = (results[1].value.data || []) as Product[];
        } else {
            console.error(
                '[HomePage] Failed to fetch new arrivals:',
                results[1].reason,
            );
        }

        // Offers
        if (results[2].status === 'fulfilled') {
            offersProducts = (results[2].value.data || []) as Product[];
        } else {
            console.error(
                '[HomePage] Failed to fetch offers:',
                results[2].reason,
            );
        }
    } catch (error) {
        // Log error but continue rendering
        console.error('[HomePage] Error fetching products:', error);
    }

    return (
        <LandingPage
            featuredProducts={featuredProducts}
            offersProducts={offersProducts}
            newArrivalsProducts={newArrivalsProducts}
        />
    );
}
