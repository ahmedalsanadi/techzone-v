'use client';

import { Product } from '@/services/types';
import HeroSlider from './HeroSlider';
import CategorySection from './CategorySection';
import ProductSection from './ProductSection';
import { useStore } from '@/components/providers/StoreProvider';
import { useTranslations } from 'next-intl';

interface LandingPageProps {
    featuredProducts?: Product[];
    offersProducts?: Product[];
    newArrivalsProducts?: Product[];
}

// Strongly typed section keys to prevent typos and enable autocomplete
type SectionKey =
    | 'banners'
    | 'categories'
    | 'featured_products'
    | 'new_arrivals'
    | 'offers';

// Valid section keys set for defensive validation
const VALID_SECTION_KEYS: Set<SectionKey> = new Set([
    'banners',
    'categories',
    'featured_products',
    'new_arrivals',
    'offers',
]);

export default function LandingPage({
    featuredProducts = [],
    offersProducts = [],
    newArrivalsProducts = [],
}: LandingPageProps) {
    const { config } = useStore();
    const homeSections = config?.home_sections;

    const tFeatured = useTranslations('FeaturedProducts');
    const tOffers = useTranslations('Promotions');
    const tNewArrivals = useTranslations('NewArrivals');

    // If no config, render basic layout
    if (!homeSections) {
        return (
            <div className="pb-12 bg-white">
                <HeroSlider />
                <div className="container mx-auto px-4 mt-8">
                    <CategorySection />
                </div>
            </div>
        );
    }

    // Build section map with strong typing
    // Server already decided what to fetch, so we only check if products exist
    const sectionsMap: Partial<Record<SectionKey, React.ReactNode>> = {};

    // Banners section (placeholder for now)
    if (homeSections.banners && homeSections.banners.length > 0) {
        // TODO: Implement BannersSection when banner API is available
        sectionsMap['banners'] = null;
    }

    // Categories section
    if (homeSections.show_categories) {
        sectionsMap['categories'] = <CategorySection key="categories" />;
    }

    // Featured Products section
    // Server already checked show_featured_products before fetching
    if (featuredProducts.length > 0) {
        sectionsMap['featured_products'] = (
            <ProductSection
                key="featured"
                title={tFeatured('title')}
                moreHref="/products?is_featured=true"
                products={featuredProducts}
                translationNamespace="FeaturedProducts"
            />
        );
    }

    // New Arrivals section
    // Server already checked show_new_arrivals before fetching
    if (newArrivalsProducts.length > 0) {
        sectionsMap['new_arrivals'] = (
            <ProductSection
                key="new-arrivals"
                title={tNewArrivals('title')}
                moreHref="/products?is_latest=true&sort=created_at&order=desc"
                products={newArrivalsProducts}
                translationNamespace="NewArrivals"
            />
        );
    }

    // Offers section
    // Server already checked show_offers before fetching
    // ⚠️ TEMPORARY: Client-side discount filtering until backend supports is_on_sale filter
    if (offersProducts.length > 0) {
        sectionsMap['offers'] = (
            <ProductSection
                key="offers"
                title={tOffers('title')}
                moreHref="/products"
                products={offersProducts}
                translationNamespace="Promotions"
            />
        );
    }

    // Render sections in the order specified by config
    const orderedSections: React.ReactNode[] = [];
    const defaultOrder: SectionKey[] = [
        'banners',
        'categories',
        'featured_products',
        'new_arrivals',
        'offers',
    ];

    // Defensive validation: filter out invalid section keys from backend
    // Prevents errors if backend returns unexpected section names
    const sectionsOrder: SectionKey[] =
        Array.isArray(homeSections.sections_order) &&
        homeSections.sections_order.length > 0
            ? homeSections.sections_order.filter((key): key is SectionKey =>
                  VALID_SECTION_KEYS.has(key as SectionKey),
              )
            : defaultOrder;

    for (const sectionKey of sectionsOrder) {
        const section = sectionsMap[sectionKey];
        if (section) {
            orderedSections.push(section);
        }
    }

    return (
        <div className="pb-12 bg-white">
            <HeroSlider />

            <div className="container mx-auto px-4 mt-8">{orderedSections}</div>
        </div>
    );
}
