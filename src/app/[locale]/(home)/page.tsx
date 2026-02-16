import { Suspense } from 'react';
import HeroSlider from '@/components/landing/HeroSlider';
import CategorySection from '@/components/landing/CategorySection';
import HomeProductSection from '@/components/landing/HomeProductSection';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import CategoryCardSkeleton from '@/components/ui/CategoryCardSkeleton';
import { getServerStoreConfig } from '@/services/store-config';
import { storeService } from '@/services/store-service';
import { Product } from '@/types/store';

type SectionKey =
    | 'banners'
    | 'categories'
    | 'featured_products'
    | 'new_arrivals'
    | 'offers';

const VALID_SECTION_KEYS: Set<SectionKey> = new Set([
    'banners',
    'categories',
    'featured_products',
    'new_arrivals',
    'offers',
]);

function SectionSkeleton({ variant }: { variant: 'categories' | 'products' }) {
    if (variant === 'categories') {
        return (
            <section className="mt-8 mb-12">
                <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} index={i} />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mt-12 mb-16">
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
                <div className="h-9 w-24 rounded-xl bg-gray-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} index={i} />
                ))}
            </div>
        </section>
    );
}

async function FeaturedProductsSection({
    priority = false,
}: {
    priority?: boolean;
}) {
    const result = await storeService.getProducts({
        is_featured: true,
        per_page: 8,
    });
    const products = (result.data || []) as Product[];
    if (products.length === 0) return null;

    return (
        <HomeProductSection
            namespace="FeaturedProducts"
            moreHref="/products?is_featured=true"
            products={products}
            priority={priority}
        />
    );
}

async function NewArrivalsSection() {
    const result = await storeService.getProducts({
        is_latest: true,
        per_page: 8,
        sort: 'created_at',
        order: 'desc',
    });
    const products = (result.data || []) as Product[];
    if (products.length === 0) return null;

    return (
        <HomeProductSection
            namespace="NewArrivals"
            moreHref="/products?is_latest=true&sort=created_at&order=desc"
            products={products}
        />
    );
}

async function OffersSection() {
    // TEMP: backend doesn't provide is_on_sale, so we filter.
    const result = await storeService.getProducts({ per_page: 8 });
    const products = (result.data || []) as Product[];
    const offers = products.filter(
        (p) => p.sale_price && p.sale_price < p.price,
    );
    if (offers.length === 0) return null;

    return (
        <HomeProductSection
            namespace="Promotions"
            moreHref="/products"
            products={offers}
        />
    );
}

export default async function HomePage() {
    const config = await getServerStoreConfig();
    const homeSections = config?.home_sections;

    // If no config, render basic layout (layout shows ServiceUnavailableFallback already)
    if (!homeSections) {
        return (
            <div className="pb-12 bg-white">
                <HeroSlider />
                <div className="container mx-auto px-4 mt-8">
                    <SectionSkeleton variant="categories" />
                </div>
            </div>
        );
    }

    const defaultOrder: SectionKey[] = [
        'banners',
        'categories',
        'featured_products',
        'new_arrivals',
        'offers',
    ];

    const orderFromBackend: SectionKey[] =
        Array.isArray(homeSections.sections_order) &&
        homeSections.sections_order.length > 0
            ? homeSections.sections_order.filter((key): key is SectionKey =>
                  VALID_SECTION_KEYS.has(key as SectionKey),
              )
            : defaultOrder;

    const sections: Partial<Record<SectionKey, React.ReactNode>> = {};

    if (homeSections.show_categories) {
        sections.categories = (
            <Suspense
                key="categories"
                fallback={<SectionSkeleton variant="categories" />}>
                <CategorySection />
            </Suspense>
        );
    }

    if (homeSections.show_featured_products) {
        sections.featured_products = (
            <Suspense
                key="featured_products"
                fallback={<SectionSkeleton variant="products" />}>
                <FeaturedProductsSection priority={true} />
            </Suspense>
        );
    }

    if (homeSections.show_new_arrivals) {
        sections.new_arrivals = (
            <Suspense
                key="new_arrivals"
                fallback={<SectionSkeleton variant="products" />}>
                <NewArrivalsSection />
            </Suspense>
        );
    }

    if (homeSections.show_offers) {
        sections.offers = (
            <Suspense
                key="offers"
                fallback={<SectionSkeleton variant="products" />}>
                <OffersSection />
            </Suspense>
        );
    }

    const ordered: React.ReactNode[] = [];
    for (const [idx, key] of orderFromBackend.entries()) {
        const node = sections[key];
        if (node) {
            ordered.push(
                <div
                    key={key}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-1000 fill-mode-both"
                    style={{ animationDelay: `${idx * 150}ms` }}>
                    {node}
                </div>,
            );
        }
    }

    return (
        <div className="pb-12 bg-white">
            <div className="animate-in fade-in duration-1000">
                <HeroSlider />
            </div>
            <div className="container mx-auto px-4 mt-8">{ordered}</div>
        </div>
    );
}
