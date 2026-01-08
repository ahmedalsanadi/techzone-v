import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { storeService } from '@/services/store-service';
import { NAV_ITEMS } from '@/config/navigation';

type ChangeFreq =
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';

interface RouteDef {
    path: string;
    priority: number;
    changeFrequency: ChangeFreq;
}

/**
 * Helper to generate localized versions of routes.
 */
function localizeRoutes(routes: RouteDef[]): MetadataRoute.Sitemap {
    return routing.locales.flatMap((locale) =>
        routes.map((route) => ({
            url: `${siteConfig.url}/${locale}${
                route.path === '/' ? '' : route.path
            }`,
            lastModified: new Date(),
            priority: route.priority,
            changeFrequency: route.changeFrequency,
        })),
    );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;

    // 1. Static Routes (Synced with Navigation)
    const staticRoutes = localizeRoutes(
        NAV_ITEMS.map((item) => ({
            path: item.href,
            priority: item.href === '/' ? 1.0 : 0.8,
            changeFrequency: item.href === '/' ? 'daily' : 'weekly',
        })),
    );

    // 2. Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: products } = await storeService.getProducts({
            per_page: 500, // Fetch more for sitemap indexing
        });
        productRoutes = localizeRoutes(
            products.map((p) => ({
                path: `/products/${p.slug || p.id}`,
                priority: 0.7,
                changeFrequency: 'weekly',
            })),
        );
    } catch (e) {
        console.error('[Sitemap] Failed to fetch products:', e);
    }

    // 3. Dynamic Category Routes
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const allCategories = await storeService.getCategories(true);

        // Helper to flatten category tree for sitemap
        const flattenCategories = (cats: any[]): any[] => {
            return cats.reduce((acc, cat) => {
                acc.push(cat);
                if (cat.children && cat.children.length > 0) {
                    acc.push(...flattenCategories(cat.children));
                }
                return acc;
            }, []);
        };

        if (allCategories) {
            const flattened = flattenCategories(allCategories);
            categoryRoutes = localizeRoutes(
                flattened.map((c) => ({
                    path: `/categories/${c.slug || c.id}`,
                    priority: 0.6,
                    changeFrequency: 'monthly',
                })),
            );
        }
    } catch (e) {
        console.error('[Sitemap] Failed to fetch categories:', e);
    }

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        ...staticRoutes,
        ...productRoutes,
        ...categoryRoutes,
    ];
}
