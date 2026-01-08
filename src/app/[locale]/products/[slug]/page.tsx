// src/app/[locale]/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/pages/products/ProductDetails';
import { Metadata } from 'next';
import { generateProductStructuredData } from '@/lib/metadata';
import { storeService } from '@/services/store-service';
import { siteConfig } from '@/config/site';

interface Props {
    params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        const product = await storeService.getProductBySlug(slug);

        if (!product) {
            return { title: 'Product Not Found' };
        }

        const title = product.title;
        const description = product.description;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                images: [{ url: product.cover_image_url }],
            },
            alternates: {
                canonical: `/products/${slug}`,
                languages: {
                    en: `/en/products/${slug}`,
                    ar: `/ar/products/${slug}`,
                },
            },
        };
    } catch (error) {
        return { title: 'Product Not Found' };
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug, locale } = await params;

    try {
        const product = await storeService.getProductBySlug(slug);

        if (!product) {
            notFound();
        }

        const structuredData = generateProductStructuredData(
            product,
            siteConfig.url,
        );

        return (
            <div className="py-8">
                {structuredData && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(structuredData),
                        }}
                    />
                )}
                <ProductDetails product={product} />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
