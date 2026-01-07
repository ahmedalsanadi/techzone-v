// src/app/[locale]/category/[slug]/page.tsx
import React, { Suspense } from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { storeService } from '@/services/store-service';
import { generateCollectionStructuredData } from '@/lib/metadata';
import { siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    
    try {
        const categories = await storeService.getCategories(true);
        const category = categories.find(cat => cat.slug === slug);
        
        if (!category) {
            return {
                title: 'Category Not Found',
            };
        }

        const title = category.name;
        const description = category.description || `Browse ${category.name} products at ${siteConfig.name}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                images: category.image_url ? [{ url: category.image_url }] : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: category.image_url ? [category.image_url] : undefined,
            },
            alternates: {
                canonical: `/category/${slug}`,
                languages: {
                    en: `/en/category/${slug}`,
                    ar: `/ar/category/${slug}`,
                },
            },
        };
    } catch (error) {
        return {
            title: 'Category Not Found',
        };
    }
}

export default async function CategoryPage({ params }: Props) {
    const { slug, locale } = await params;
    
    try {
        const categories = await storeService.getCategories(true);
        const category = categories.find(cat => cat.slug === slug);
        
        if (!category) {
            notFound();
        }

        const t = await getTranslations({ locale, namespace: 'Product' });
        
        const breadcrumbItems = [
            { label: t('home'), href: '/' },
            { label: t('products'), href: '/products' },
            { label: category.name, href: `/category/${slug}`, active: true },
        ];

        return (
            <main className="min-h-screen bg-gray-50/30">
                <div className="container mx-auto px-4 pt-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                
                <Suspense fallback={<div>Loading...</div>}>
                    <CategoryContent categoryId={category.id} categorySlug={slug} />
                </Suspense>
            </main>
        );
    } catch (error) {
        notFound();
    }
}

async function CategoryContent({ categoryId, categorySlug }: { categoryId: string; categorySlug: string }) {
    const productsResult = await storeService.getProducts({ category_id: categoryId });
    
    const structuredData = generateCollectionStructuredData(
        productsResult.data,
        siteConfig.url
    );

    return (
        <>
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}
            <ProductsContent 
                initialCategorySlug={categorySlug} 
                initialCategoryId={categoryId} 
            />
        </>
    );
}