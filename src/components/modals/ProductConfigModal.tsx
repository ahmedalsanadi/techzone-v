import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '@/types/store';
import { useCartActions } from '@/hooks/cart';
import {
    getRequiredAddonGroups,
    getRequiredCustomFields,
    hasVariants,
    validateRequiredSelections,
} from '@/lib/products/requirements';
import AddonSelector from '@/components/products/product-details/AddonSelector';
import VariantSelector from '@/components/products/product-details/VariantSelector';
import CustomFieldsForm from '@/components/products/product-details/CustomFieldsForm';
import { generateCartItemId } from '@/lib/cart/utils';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

interface ProductConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function ProductConfigModal({
    isOpen,
    onClose,
    product,
}: ProductConfigModalProps) {
    const t = useTranslations('Product');
    const { addToCart } = useCartActions();

    const requiredAddonGroups = useMemo(
        () => (product ? getRequiredAddonGroups(product) : []),
        [product],
    );
    const requiredCustomFields = useMemo(
        () => (product ? getRequiredCustomFields(product) : []),
        [product],
    );

    const initializeAddons = useMemo(() => {
        const initial: Record<number, Record<number, number>> = {};
        requiredAddonGroups.forEach((group) => {
            initial[group.id] = {};
            group.items.forEach((item) => {
                if (item.default_value > 0) {
                    initial[group.id][item.id] = item.default_value;
                }
            });
        });
        return initial;
    }, [requiredAddonGroups]);

    const [selectedAddons, setSelectedAddons] =
        useState<Record<number, Record<number, number>>>(initializeAddons);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        product?.variants?.[0]?.id ?? null,
    );
    const [customFields, setCustomFields] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!isOpen) return;
        setSelectedAddons(initializeAddons);
        setSelectedVariantId(product?.variants?.[0]?.id ?? null);
        setCustomFields({});
    }, [isOpen, initializeAddons, product?.variants, product?.id]);

    if (!product) return null;

    const selectedVariant = selectedVariantId
        ? product.variants?.find((v) => v.id === selectedVariantId)
        : null;

    const variantOptions = selectedVariant?.option_values || {};
    const basePrice = selectedVariant
        ? selectedVariant.sale_price || selectedVariant.price
        : product.sale_price || product.price;

    const calculateTotalPrice = () => {
        let totalAddonsPrice = 0;

        Object.entries(selectedAddons).forEach(([addonGroupId, items]) => {
            const addonGroup = requiredAddonGroups.find(
                (a) => a.id === parseInt(addonGroupId, 10),
            );
            if (!addonGroup) return;

            Object.entries(items).forEach(([itemId, qty]) => {
                const item = addonGroup.items.find(
                    (i) => i.id === parseInt(itemId, 10),
                );
                if (!item || qty <= 0) return;
                totalAddonsPrice += item.extra_price * qty;
            });
        });

        return Number(basePrice) + totalAddonsPrice;
    };

    const validation = validateRequiredSelections(product, {
        selectedVariantId,
        selectedAddons,
        customFields,
    });

    const handleAddToCart = () => {
        if (!validation.isValid) {
            toast.error(
                t('validationError') || 'Please complete required selections',
            );
            return;
        }

        const addonDetails: Array<{
            groupName: string;
            items: Array<{ name: string; quantity: number; price: number }>;
        }> = [];

        Object.entries(selectedAddons).forEach(([addonGroupId, items]) => {
            const addonGroup = requiredAddonGroups.find(
                (a) => a.id === parseInt(addonGroupId, 10),
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
                    (i) => i.id === parseInt(itemId, 10),
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

        addToCart({
            id: generateCartItemId(product.id, {
                variantId: selectedVariantId,
                addons: selectedAddons,
                customFields,
            }),
            name: product.title,
            image: product.cover_image_url,
            price: calculateTotalPrice(),
            categoryId: String(product.categories?.[0]?.id || ''),
            metadata: {
                productId: product.id,
                productSlug: product.slug,
                product_variant_id: selectedVariantId || null,
                variant_options:
                    Object.keys(variantOptions).length > 0
                        ? variantOptions
                        : null,
                variety: selectedVariant
                    ? { name: selectedVariant.title }
                    : null,
                addons: selectedAddons,
                addonDetails,
                custom_fields:
                    Object.keys(customFields).length > 0 ? customFields : null,
            },
        });

        onClose();
    };

    const isOutOfStock =
        !product.is_available ||
        (hasVariants(product) && selectedVariant
            ? selectedVariant.is_available === false
            : false);

    return (
        <Dialog
            open={isOpen}
            as="div"
            className="relative z-50 focus:outline-none"
            onClose={onClose}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
            />

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-5">
                    <DialogPanel
                        transition
                        className="bg-white shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative max-h-[88vh] rounded-2xl lg:rounded-4xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
                        <header className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-100 shrink-0">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label={t('close')}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                            <div className="text-center flex-1">
                                <DialogTitle
                                    as="h2"
                                    className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                                    {product.title}
                                </DialogTitle>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {t('requiredSelections') ||
                                        'Required selections'}
                                </p>
                            </div>
                            <div className="w-9 min-w-[44px]" />
                        </header>

                        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-6">
                            {hasVariants(product) &&
                            product.variants?.length ? (
                                <VariantSelector
                                    variants={product.variants}
                                    selectedVariantId={selectedVariantId}
                                    onSelect={(variantId) =>
                                        setSelectedVariantId(variantId)
                                    }
                                    required
                                />
                            ) : null}

                            {requiredAddonGroups.map((addonGroup) => (
                                <AddonSelector
                                    key={addonGroup.id}
                                    addonGroup={addonGroup}
                                    selectedItems={
                                        selectedAddons[addonGroup.id] || {}
                                    }
                                    onUpdateSelection={(itemId, qty) => {
                                        setSelectedAddons((prev) => ({
                                            ...prev,
                                            [addonGroup.id]: {
                                                ...prev[addonGroup.id],
                                                [itemId]: qty,
                                            },
                                        }));
                                    }}
                                />
                            ))}

                            {requiredCustomFields.length > 0 && (
                                <CustomFieldsForm
                                    customFields={requiredCustomFields}
                                    values={customFields}
                                    onChange={(name, value) => {
                                        setCustomFields((prev) => ({
                                            ...prev,
                                            [name]: value,
                                        }));
                                    }}
                                />
                            )}

                            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                                <span className="text-gray-600">
                                    {t('moreOptionsHint') ||
                                        'More options available on the product page'}
                                </span>
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="inline-flex items-center gap-1.5 text-theme-primary font-bold">
                                    {t('viewDetails') || 'View details'}
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </main>

                        <footer className="p-4 sm:p-5 md:p-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="min-h-[48px] px-6 py-3 text-gray-500 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors touch-manipulation">
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={!validation.isValid || isOutOfStock}
                                className={cn(
                                    'min-h-[48px] px-8 sm:px-10 py-3 font-black rounded-lg sm:rounded-xl transition-all shadow-lg touch-manipulation',
                                    !validation.isValid || isOutOfStock
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-none'
                                        : 'bg-theme-primary text-white hover:brightness-95 shadow-theme-primary/20 active:scale-[0.98]',
                                )}>
                                {t('addToCart') || 'Add to cart'}
                            </button>
                        </footer>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
