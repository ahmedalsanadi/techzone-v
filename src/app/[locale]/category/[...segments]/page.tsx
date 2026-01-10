import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { storeService } from '@/services/store-service';
import { getTranslations } from 'next-intl/server';
import ProductCard from '@/components/ui/ProductCard';
import CategoryCard from '@/components/ui/CategoryCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface Props {
    params: Promise<{ locale: string; segments?: string[] }>;
}

/**
 * Traverses the tree based on the URL segments to find the target category.
 */
const findCategoryByPath = (nodes: any[], segments: string[]): any | null => {
    let currentLevel = nodes;
    let found = null;
    for (const slug of segments) {
        found = currentLevel.find((c) => c.slug === slug);
        if (!found) return null;
        currentLevel = found.children || [];
    }
    return found;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, segments = [] } = await params;
    const tree = await storeService.getCategories(true);
    
    if (segments.length === 0) {
        const t = await getTranslations({ locale, namespace: 'Category' });
        return { title: t('categories') };
    }

    const category = findCategoryByPath(tree, segments);
    if (!category) return { title: 'Category Not Found' };

        return {
        title: category.name,
        description: category.description || `Browse products in ${category.name}`,
        alternates: {
            canonical: `/${locale}/category/${segments.join('/')}`,
        },
        };
}

export default async function CategoryPage({ params }: Props) {
    const { locale, segments = [] } = await params;
    const t = await getTranslations({ locale, namespace: 'Category' });

    // 1. Fetch data using your existing storeService
    const tree = await storeService.getCategories(true);
    const currentCategory = findCategoryByPath(tree, segments);

    // Fallback if segments exist but category isn't found
    if (segments.length > 0 && !currentCategory) notFound();

    const categoryId = currentCategory?.id;
    const { data: products } = await storeService.getProducts({
        category_id: categoryId?.toString(),
    });

    const subCategories = currentCategory ? currentCategory.children || [] : tree;

    return (
        <main className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
            {/* Hierarchical Breadcrumbs */}
            <Breadcrumbs 
                items={[
                    { label: t('home'), href: '/' },
                    { label: t('categories'), href: '/category' },
                    ...segments.map((s, i) => ({
                        label: s.replace(/-/g, ' '),
                        href: `/category/${segments.slice(0, i + 1).join('/')}`
                    }))
                ]} 
            />

            {/* Sub-Category Navigation (Uniform Grid) */}
            <section className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                    {currentCategory?.name || t('all_products')}
                </h1>

                {subCategories.length > 0 && (
                    <div className="flex flex-wrap items-stretch gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {subCategories.map((c) => (
                            <CategoryCard
                                key={c.id}
                                label={c.name}
                                image={c.image_url}
                                href={`/category/${[...segments, c.slug].join('/')}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Products Section */}
            <section className="space-y-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{t('products')}</h2>
                    <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        {products.length} {t('items_count')}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <ProductCard
                            key={p.id}
                            name={p.title}
                            image={p.cover_image_url}
                            price={p.price}
                            oldPrice={p.sale_price}
                            href={`/products/${p.id}`}
                            addToCartLabel={t('addToCart')}
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">{t('no_products')}</p>
                    </div>
                )}
            </section>
        </main>
    );
}
