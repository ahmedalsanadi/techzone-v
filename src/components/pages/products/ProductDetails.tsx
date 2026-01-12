// src/components/pages/products/ProductDetails.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductGallery from './product-details/ProductGallery';
import ProductInfo from './product-details/ProductInfo';
import ProductActionBar from './product-details/ProductActionBar';
import AddonSelector from './product-details/AddonSelector';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useCartActions } from '@/hooks/useCartActions';
import { Product } from '@/services/types';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');
    const { addToCart } = useCartActions();

    const [selectedAddons, setSelectedAddons] = useState<
        Record<number, Record<number, number>>
    >({});
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    const images = [product.cover_image_url, ...(product.image_urls || [])];
    const currentPrice = product.sale_price || product.price;

    const calculateTotalPrice = () => {
        let totalAddonsPrice = 0;

        Object.entries(selectedAddons).forEach(([addonGroupId, items]) => {
            const addonGroup = (product.addons || []).find(
                (a) => a.id === parseInt(addonGroupId),
            );
            if (!addonGroup) return;

            Object.entries(items).forEach(([itemId, qty]) => {
                const item = addonGroup.items.find(
                    (i) => i.id === parseInt(itemId),
                );
                if (!item || qty <= 0) return;

                if (item.multiply_price_by_quantity) {
                    totalAddonsPrice += item.extra_price * qty;
                } else {
                    totalAddonsPrice += item.extra_price;
                }
            });
        });

        return (Number(currentPrice) + totalAddonsPrice) * quantity;
    };

    const updateAddonSelection = (
        addonGroupId: number,
        itemId: number,
        quantity: number,
    ) => {
        setSelectedAddons((prev) => ({
            ...prev,
            [addonGroupId]: {
                ...prev[addonGroupId],
                [itemId]: quantity,
            },
        }));
    };

    const handleAddToCart = () => {
        // Prepare addon details with names for display in cart
        const addonDetails: Array<{
            groupName: string;
            items: Array<{ name: string; quantity: number; price: number }>;
        }> = [];

        Object.entries(selectedAddons).forEach(([addonGroupId, items]) => {
            const addonGroup = (product.addons || []).find(
                (a) => a.id === parseInt(addonGroupId),
            );
            if (!addonGroup) return;

            const selectedItems: Array<{
                name: string;
                quantity: number;
                price: number;
            }> = [];

            Object.entries(items).forEach(([itemId, qty]) => {
                if (qty <= 0) return;
                const item = addonGroup.items.find(
                    (i) => i.id === parseInt(itemId),
                );
                if (!item) return;

                selectedItems.push({
                    name: item.title,
                    quantity: qty,
                    price: item.extra_price,
                });
            });

            if (selectedItems.length > 0) {
                addonDetails.push({
                    groupName: addonGroup.name,
                    items: selectedItems,
                });
            }
        });

        addToCart(
            {
                id: `${product.id}-${Date.now()}`, // Unique ID for this configuration
                name: product.title,
                image: product.cover_image_url,
                price: calculateTotalPrice() / quantity,
                categoryId: product.categories?.[0]?.id?.toString() || '',
                metadata: {
                    productId: product.id,
                    productSlug: product.slug, // Store slug for navigation
                    addons: selectedAddons, // Keep IDs for reference
                    addonDetails, // Add names for display
                    notes,
                },
            },
            quantity,
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: t('home'), href: '/' },
                    { label: t('products'), href: '/products' },
                    { label: product.title },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
                {/* Gallery */}
                <ProductGallery images={images} />

                {/* Product Info */}
                <div className="space-y-6">
                    <ProductInfo
                        name={product.title}
                        subtitle={product.subtitle}
                        description={product.description}
                        price={Number(currentPrice)}
                        originalPrice={
                            product.has_discount
                                ? Number(product.price)
                                : undefined
                        }
                        calories={product.calories}
                        categories={product.categories}
                    />

                    {/* Addons */}
                    {(product.addons || []).map((addonGroup) => (
                        <AddonSelector
                            key={addonGroup.id}
                            addonGroup={addonGroup}
                            selectedItems={selectedAddons[addonGroup.id] || {}}
                            onUpdateSelection={(itemId, qty) =>
                                updateAddonSelection(addonGroup.id, itemId, qty)
                            }
                        />
                    ))}

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">
                            {t('notes')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('addNotes')}
                            rows={3}
                            className="w-full p-3 border rounded-lg resize-none"
                        />
                    </div>

                    {/* Action Bar */}
                    <ProductActionBar
                        totalPrice={calculateTotalPrice()}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        onAddToCart={handleAddToCart}
                        isAvailable={product.is_available}
                    />
                </div>
            </div>
        </div>
    );
}
