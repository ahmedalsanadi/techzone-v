//src/app/[locale]/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/pages/products/ProductDetails';
import { Metadata } from 'next';
import {
    generateProductMetadata,
    generateProductStructuredData,
} from '@/lib/metadata';
import { storeService } from '@/services/store-service';
import { siteConfig } from '@/config/site';

interface Props {
    params: Promise<{ id: string; locale: string }>;
}

// GENERATE METADATA FOR PRODUCT PAGE
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id, locale } = await params;
    
    try {
        const product = await storeService.getProduct(id);
        
        if (!product) {
            return {
                title: 'Product Not Found',
            };
        }

        // Use product name as title (not website name)
        const title = product.name || product.title;
        const description = product.description || `${title} - Available now at ${siteConfig.name}`;
        const imageUrl = product.cover_image_url || '/og-image.png';

        return {
            title, // Just product name, template will add site name
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                images: [{ url: imageUrl }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
            alternates: {
                canonical: `/products/${id}`,
                languages: {
                    en: `/en/products/${id}`,
                    ar: `/ar/products/${id}`,
                },
            },
        };
    } catch (error) {
        return {
            title: 'Product Not Found',
        };
    }
}

export default async function ProductPage({ params }: Props) {
    const { id, locale } = await params;
    
    try {
        const product = await storeService.getProduct(id);

        if (!product) {
            notFound();
        }

        //
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
