'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/services/types';
import ProductGallery from './product-details/ProductGallery';
import ProductShareActions from './product-details/ProductShareActions';
import ProductInfo from './product-details/ProductInfo';
import ProductAllergies from './product-details/ProductAllergies';
import ProductActionBar from './product-details/ProductActionBar';
import SizeSelector from './product-details/SizeSelector';
import AddonSelector from './product-details/AddonSelector';
import SauceSelector from './product-details/SauceSelector';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useCartActions } from '@/hooks/useCartActions';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');

    const varieties = product.varieties || [];
    const addons = product.addons || [];
    const sauces = product.sauces || [];
    const images = product.images || [product.cover_image_url];
    const name = product.name || product.title;

    const [selectedVarietyId, setSelectedVarietyId] = useState<string>(
        String(
            varieties.find((v) => v.isDefault)?.id || varieties[0]?.id || '',
        ),
    );
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [selectedSauces, setSelectedSauces] = useState<
        Record<string, number>
    >({});
    const [quantity, setQuantity] = useState(1);

    const selectedVariety = useMemo(
        () => varieties.find((v) => String(v.id) === selectedVarietyId)!,
        [selectedVarietyId, varieties],
    );

    const calculateTotalPrice = () => {
        // Fallback for when no variety is selected or exists
        if (!selectedVariety) return Number(product.price) * quantity;

        let price = selectedVariety.price;

        // Addons
        selectedAddons.forEach((id) => {
            const addon = addons.find((a) => String(a.id) === id);
            if (addon) price += addon.price;
        });

        // Sauces
        Object.entries(selectedSauces).forEach(([id, qty]) => {
            const sauce = sauces.find((s) => String(s.id) === id);
            if (sauce) price += sauce.price * qty;
        });

        return price * quantity;
    };

    const toggleAddon = (id: string) => {
        setSelectedAddons((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const updateSauceQuantity = (id: string, delta: number) => {
        setSelectedSauces((prev) => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const { addToCart } = useCartActions();

    const handleAddToCart = () => {
        // Create a unique key for this specific configuration
        const addonsKey = selectedAddons.sort().join(',');
        const saucesKey = JSON.stringify(selectedSauces);
        const uniqueId = `${product.id}-${selectedVarietyId}-${addonsKey}-${saucesKey}`;

        addToCart(
            {
                id: uniqueId,
                name: name,
                image: images[0],
                price: calculateTotalPrice() / quantity,
                categoryId: 'detailed',
                metadata: {
                    productId: product.id,
                    variety: selectedVariety,
                    addons: selectedAddons,
                    sauces: selectedSauces,
                },
            },
            quantity,
        );
    };

    return (
        <div className="flex flex-col gap-16 pb-24 relative pt-4 px-2 md:px-4">
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('products'), href: '/products' },
                        { label: name },
                    ]}
                />

                {/* Top Section: Info & Image */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                    {/* Info Column */}
                    <div className="lg:col-span-7 flex flex-col gap-8 order-2 ">
                        <ProductShareActions />

                        <ProductInfo
                            name={name}
                            description={product.description}
                            calories={
                                selectedVariety?.calories ||
                                product.calories ||
                                0
                            }
                            prepTime={
                                selectedVariety?.prepTime ||
                                product.prepTime ||
                                0
                            }
                        />

                        <ProductAllergies allergies={product.allergies || []} />

                        <ProductActionBar
                            totalPrice={calculateTotalPrice()}
                            originalPrice={selectedVariety?.originalPrice || 0}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onAddToCart={handleAddToCart}
                        />
                    </div>

                    {/* Gallery Column */}
                    <div className="lg:col-span-5 order-1 ">
                        <div className="sticky top-24">
                            <ProductGallery images={images} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SizeSelector
                    varieties={varieties}
                    selectedVarietyId={selectedVarietyId}
                    onSelect={setSelectedVarietyId}
                />

                <AddonSelector
                    addons={addons}
                    selectedAddons={selectedAddons}
                    onToggle={toggleAddon}
                />

                <SauceSelector
                    sauces={sauces}
                    selectedSauces={selectedSauces}
                    onUpdateQuantity={updateSauceQuantity}
                />
            </div>
        </div>
    );
}
