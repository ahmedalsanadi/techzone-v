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

export default async function ProductPage({ params }: Props) {
    const { id, locale } = await params;
    const product = await storeService.getProduct(id);

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
}
