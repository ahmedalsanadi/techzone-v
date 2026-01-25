// src/components/pages/products/ProductDetails.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import ProductGallery from './product-details/ProductGallery';
import ProductInfo from './product-details/ProductInfo';
import ProductActionBar from './product-details/ProductActionBar';
import AddonSelector from './product-details/AddonSelector';
import VariantSelector from './product-details/VariantSelector';
import CustomFieldsForm from './product-details/CustomFieldsForm';
import ProductShareActions from './product-details/ProductShareActions';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
    generateCartItemId,
    transformLocalAddonsToApi,
} from '@/lib/cart/utils';
import { useCartActions } from '@/hooks/useCartActions';
import { Product } from '@/services/types';
import { toast } from 'sonner';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');
    const { addToCart } = useCartActions();

    // Initialize addons with default values
    const initializeAddons = useMemo((): Record<
        number,
        Record<number, number>
    > => {
        const initial: Record<number, Record<number, number>> = {};

        (product.addons || []).forEach((addonGroup) => {
            initial[addonGroup.id] = {};
            addonGroup.items.forEach((item) => {
                if (item.default_value > 0) {
                    initial[addonGroup.id][item.id] = item.default_value;
                }
            });
        });

        return initial;
    }, [product.addons]);

    const [selectedAddons, setSelectedAddons] =
        useState<Record<number, Record<number, number>>>(initializeAddons);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        product.variants && product.variants.length > 0
            ? product.variants[0].id
            : null,
    );
    const [customFields, setCustomFields] = useState<Record<string, any>>({});

    // Extract variant_options from selected variant
    const variantOptions = useMemo(() => {
        if (!selectedVariantId) return {};
        const variant = (product.variants || []).find(
            (v) => v.id === selectedVariantId,
        );
        return variant?.option_values || {};
    }, [selectedVariantId, product.variants]);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    // Re-initialize when product changes
    useEffect(() => {
        setSelectedAddons(initializeAddons);
        // Reset variant selection to first variant if variants exist
        if (product.variants && product.variants.length > 0) {
            setSelectedVariantId(product.variants[0].id);
        } else {
            setSelectedVariantId(null);
        }
        // Reset custom fields
        setCustomFields({});
        // Reset quantity
        setQuantity(1);
        // Reset notes
        setNotes('');
    }, [initializeAddons, product.variants, product.id]);

    const images = [product.cover_image_url, ...(product.image_urls || [])];

    // Get current price - use variant price if variant is selected, otherwise product price
    const selectedVariant = selectedVariantId
        ? (product.variants || []).find((v) => v.id === selectedVariantId)
        : null;
    const currentPrice = selectedVariant
        ? selectedVariant.sale_price || selectedVariant.price
        : product.sale_price || product.price;

    // Validate addon constraints
    const validateAddons = useCallback((): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];

        (product.addons || []).forEach((addonGroup) => {
            // Calculate selected count for this addon group
            const items = selectedAddons[addonGroup.id] || {};
            let selectedCount: number;

            if (addonGroup.input_type === 'boolean') {
                // Count items with quantity > 0
                selectedCount = Object.values(items).filter(
                    (qty) => qty > 0,
                ).length;
            } else {
                // Sum all quantities for number input type
                selectedCount = Object.values(items).reduce(
                    (sum, qty) => sum + qty,
                    0,
                );
            }

            // Check min_selected constraint (only if required or min_selected > 0)
            if (
                addonGroup.min_selected > 0 &&
                selectedCount < addonGroup.min_selected
            ) {
                if (addonGroup.is_required) {
                    errors.push(
                        `${addonGroup.name}: ${t('minSelectionRequired', { count: addonGroup.min_selected }) || `Please select at least ${addonGroup.min_selected} item(s)`}`,
                    );
                } else {
                    errors.push(
                        `${addonGroup.name}: ${t('minSelectionRequired', { count: addonGroup.min_selected }) || `Minimum ${addonGroup.min_selected} selection(s) required`}`,
                    );
                }
            }

            // Check max_selected constraint
            if (
                addonGroup.max_selected !== null &&
                selectedCount > addonGroup.max_selected
            ) {
                errors.push(
                    `${addonGroup.name}: ${t('maxSelectionExceeded') || `Maximum ${addonGroup.max_selected} selection(s) allowed`}`,
                );
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
        };
    }, [selectedAddons, product.addons, t]);

    const validation = useMemo(() => validateAddons(), [validateAddons]);

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

                // Addon price = (extra_price * addon selection quantity)
                const addonSelectionTotalPrice = item.extra_price * qty;

                if (item.multiply_price_by_quantity) {
                    // This addon is per-unit, so multiply by product quantity
                    totalAddonsPrice += addonSelectionTotalPrice * quantity;
                } else {
                    // This addon is once per cart item, regardless of quantity
                    totalAddonsPrice += addonSelectionTotalPrice;
                }
            });
        });

        // Base price: variant price if selected, otherwise product price
        const basePrice = Number(currentPrice);

        // Total = (base price * product quantity) + total addons price
        return basePrice * quantity + totalAddonsPrice;
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
        // Validate before adding to cart
        const validationResult = validateAddons();
        if (!validationResult.isValid) {
            toast.error(
                validationResult.errors[0] ||
                    t('validationError') ||
                    'Please fix the selection errors',
                {
                    description:
                        validationResult.errors.length > 1
                            ? `${validationResult.errors.length - 1} more error(s)`
                            : undefined,
                },
            );
            return;
        }

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

        // Validate custom fields
        const customFieldsErrors: string[] = [];
        (product.custom_fields || []).forEach((field) => {
            if (field.is_required && !customFields[field.name]) {
                customFieldsErrors.push(
                    `${field.label}: ${t('required') || 'Required'}`,
                );
            }
        });

        if (customFieldsErrors.length > 0) {
            toast.error(
                customFieldsErrors[0] ||
                    t('validationError') ||
                    'Please fill all required fields',
                {
                    description:
                        customFieldsErrors.length > 1
                            ? `${customFieldsErrors.length - 1} more error(s)`
                            : undefined,
                },
            );
            return;
        }

        // Validate variant selection if variants exist
        if ((product.variants || []).length > 0 && !selectedVariantId) {
            toast.error(t('variantRequired') || 'Please select a variant');
            return;
        }

        addToCart(
            {
                id: generateCartItemId(product.id, {
                    variantId: selectedVariantId,
                    addons: selectedAddons,
                    customFields,
                    notes,
                }), // Stable ID for this configuration
                name: product.title,
                image: product.cover_image_url,
                price: calculateTotalPrice() / quantity,
                categoryId: product.categories?.[0]?.id?.toString() || '',
                metadata: {
                    productId: product.id,
                    productSlug: product.slug, // Store slug for navigation
                    product_variant_id: selectedVariantId || null,
                    variant_options:
                        Object.keys(variantOptions).length > 0
                            ? variantOptions
                            : null,
                    variety: selectedVariant
                        ? { name: selectedVariant.title }
                        : null,
                    addons: selectedAddons, // Keep IDs for reference
                    addonDetails, // Add names for display
                    custom_fields:
                        Object.keys(customFields).length > 0
                            ? customFields
                            : null,
                    notes,
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
                        { label: product.title },
                    ]}
                />

                {/* Top Section: Info & Image */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                    {/* Info Column */}
                    <div className="lg:col-span-7 flex flex-col gap-8 order-2">
                        <ProductShareActions />
                        <ProductInfo
                            name={product.title}
                            subtitle={product.subtitle}
                            description={product.description}
                            price={Number(currentPrice)}
                            originalPrice={
                                selectedVariant
                                    ? selectedVariant.sale_price
                                        ? Number(selectedVariant.price)
                                        : undefined
                                    : product.has_discount
                                      ? Number(product.price)
                                      : undefined
                            }
                            calories={
                                selectedVariant?.calories || product.calories
                            }
                            prepTime={product.prepTime}
                            categories={product.categories}
                        />

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
                        {(() => {
                            const isOutOfStock =
                                !product.is_available ||
                                (product.is_variation &&
                                    selectedVariant &&
                                    selectedVariant.is_available === false);

                            return (
                                <ProductActionBar
                                    totalPrice={calculateTotalPrice()}
                                    originalPrice={
                                        product.has_discount
                                            ? Number(product.price) * quantity
                                            : undefined
                                    }
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                    onAddToCart={handleAddToCart}
                                    isAvailable={!isOutOfStock}
                                    isValid={validation.isValid}
                                />
                            );
                        })()}
                    </div>

                    {/* Gallery Column */}
                    <div className="lg:col-span-5 order-1">
                        <div className="sticky top-24">
                            <ProductGallery images={images} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Grid */}
            {((product.variants && product.variants.length > 0) ||
                (product.addons && product.addons.length > 0) ||
                (product.custom_fields &&
                    product.custom_fields.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <VariantSelector
                            variants={product.variants}
                            selectedVariantId={selectedVariantId}
                            onSelect={(variantId) => {
                                setSelectedVariantId(variantId);
                            }}
                            required={true}
                        />
                    )}

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

                    {/* Custom Fields */}
                    {product.custom_fields &&
                        product.custom_fields.length > 0 && (
                            <CustomFieldsForm
                                customFields={product.custom_fields}
                                values={customFields}
                                onChange={(name, value) => {
                                    setCustomFields((prev) => ({
                                        ...prev,
                                        [name]: value,
                                    }));
                                }}
                            />
                        )}
                </div>
            )}
        </div>
    );
}
