// src/app/[locale]/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/products/product-details/ProductDetails';
import { Metadata } from 'next';
import { generateProductStructuredData } from '@/lib/metadata';
import { storeService } from '@/services/store-service';
import { resolveSiteIdentity } from '@/lib/tenant/resolve-site';

interface Props {
    params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const product = await storeService.getProduct(slug);
        const site = await resolveSiteIdentity();

        if (!product) {
            return { title: 'Product Not Found' };
        }

        const title = product.title;
        const description = product.description;

        // Use high-res cover for social sharing if available
        const ogImage =
            product.media?.cover?.sizes?.[2] || product.cover_image_url;

        return {
            title,
            description,
            metadataBase: new URL(site.url),
            openGraph: {
                title,
                description,
                type: 'website',
                images: [{ url: ogImage }],
            },
            alternates: {
                canonical: `${site.url}/products/${slug}`,
                languages: {
                    en: `${site.url}/en/products/${slug}`,
                    ar: `${site.url}/ar/products/${slug}`,
                },
            },
        };
    } catch {
        return { title: 'Product Not Found' };
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    let product;
    try {
        product = await storeService.getProduct(slug);
    } catch {
        notFound();
    }

    if (!product) {
        notFound();
    }

    const site = await resolveSiteIdentity();
    const structuredData = generateProductStructuredData(
        product,
        site.url,
        site.name,
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
            <ProductDetails product={product} />
        </>
    );
}
