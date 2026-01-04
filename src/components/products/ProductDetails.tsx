'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/lib/mock-data';
import ProductGallery from './product-details/ProductGallery';
import ProductShareActions from './product-details/ProductShareActions';
import ProductInfo from './product-details/ProductInfo';
import ProductAllergies from './product-details/ProductAllergies';
import ProductActionBar from './product-details/ProductActionBar';
import SizeSelector from './product-details/SizeSelector';
import AddonSelector from './product-details/AddonSelector';
import SauceSelector from './product-details/SauceSelector';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');

    const [selectedVarietyId, setSelectedVarietyId] = useState<string>(
        product.varieties.find((v) => v.isDefault)?.id ||
            product.varieties[0].id,
    );
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [selectedSauces, setSelectedSauces] = useState<
        Record<string, number>
    >({});
    const [quantity, setQuantity] = useState(1);

    const selectedVariety = useMemo(
        () => product.varieties.find((v) => v.id === selectedVarietyId)!,
        [selectedVarietyId, product.varieties],
    );

    const calculateTotalPrice = () => {
        let price = selectedVariety.price;

        // Addons
        selectedAddons.forEach((id) => {
            const addon = product.addons.find((a) => a.id === id);
            if (addon) price += addon.price;
        });

        // Sauces
        Object.entries(selectedSauces).forEach(([id, qty]) => {
            const sauce = product.sauces.find((s) => s.id === id);
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

    const handleAddToCart = () => {
        console.log('Added to cart:', {
            product,
            selectedVariety,
            selectedAddons,
            selectedSauces,
            quantity,
            totalPrice: calculateTotalPrice(),
        });
    };

    return (
        <div className="flex flex-col gap-16 pb-24 relative pt-4">
            {/* Top Section: Info & Image */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                {/* Info Column */}
                <div className="lg:col-span-7 flex flex-col gap-8 order-2 ">
                    <ProductShareActions />

                    <ProductInfo
                        name={product.name}
                        description={product.description}
                        calories={selectedVariety.calories || product.calories}
                        prepTime={selectedVariety.prepTime || product.prepTime}
                    />

                    <ProductAllergies allergies={product.allergies} />

                    <ProductActionBar
                        totalPrice={calculateTotalPrice()}
                        originalPrice={selectedVariety.originalPrice}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        onAddToCart={handleAddToCart}
                    />
                </div>

                {/* Gallery Column */}
                <div className="lg:col-span-5 order-1 ">
                    <div className="sticky top-24">
                        <ProductGallery images={product.images} />
                    </div>
                </div>
            </div>

            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SizeSelector
                    varieties={product.varieties}
                    selectedVarietyId={selectedVarietyId}
                    onSelect={setSelectedVarietyId}
                />

                <AddonSelector
                    addons={product.addons}
                    selectedAddons={selectedAddons}
                    onToggle={toggleAddon}
                />

                <SauceSelector
                    sauces={product.sauces}
                    selectedSauces={selectedSauces}
                    onUpdateQuantity={updateSauceQuantity}
                />
            </div>
        </div>
    );
}
