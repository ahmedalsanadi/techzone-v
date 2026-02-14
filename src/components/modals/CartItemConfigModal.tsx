import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { generateCartItemId } from '@/lib/cart/utils';
import { useCartActions } from '@/hooks/cart';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { validateRequiredSelections } from '@/lib/products/requirements';
import AddonSelector from '@/components/products/product-details/AddonSelector';
import VariantSelector from '@/components/products/product-details/VariantSelector';
import CustomFieldsForm from '@/components/products/product-details/CustomFieldsForm';
import type { Product } from '@/types/store';
import type { CartItem } from '@/store/useCartStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

interface CartItemConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: CartItem | null;
}

export default function CartItemConfigModal({
    isOpen,
    onClose,
    item,
}: CartItemConfigModalProps) {
    const t = useTranslations('Product');
    const { updateItemConfiguration } = useCartActions();
    const slug = item?.metadata?.productSlug;

    const {
        data: product,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => storeService.getProduct(slug!),
        enabled: isOpen && !!slug,
        staleTime: 1000 * 60 * 5,
    });

    const initialAddons = useMemo(() => {
        const fromItem =
            item?.metadata?.addons && typeof item.metadata.addons === 'object'
                ? (item.metadata.addons as Record<
                      number,
                      Record<number, number>
                  >)
                : {};
        return fromItem;
    }, [item]);

    const [selectedAddons, setSelectedAddons] =
        useState<Record<number, Record<number, number>>>(initialAddons);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        item?.metadata?.product_variant_id || null,
    );
    const [customFields, setCustomFields] = useState<Record<string, unknown>>(
        item?.metadata?.custom_fields || {},
    );
    const [notes, setNotes] = useState(item?.metadata?.notes || '');

    const activeProduct = product as Product | undefined;
    const validation = activeProduct
        ? validateRequiredSelections(activeProduct, {
              selectedVariantId,
              selectedAddons,
              customFields,
          })
        : { isValid: false, errors: [] };

    const selectedVariant = selectedVariantId
        ? activeProduct?.variants?.find((v) => v.id === selectedVariantId)
        : null;

    const currentPrice = selectedVariant
        ? selectedVariant.sale_price || selectedVariant.price
        : activeProduct?.sale_price || activeProduct?.price || 0;

    const calculateTotalPrice = () => {
        let totalAddonsPrice = 0;
        Object.entries(selectedAddons).forEach(([addonGroupId, items]) => {
            const addonGroup = activeProduct?.addons?.find(
                (a) => a.id === parseInt(addonGroupId, 10),
            );
            if (!addonGroup) return;

            Object.entries(items).forEach(([itemId, qty]) => {
                const addonItem = addonGroup.items.find(
                    (i) => i.id === parseInt(itemId, 10),
                );
                if (!addonItem || qty <= 0) return;
                totalAddonsPrice += addonItem.extra_price * qty;
            });
        });
        return Number(currentPrice) + totalAddonsPrice;
    };

    const unitPrice = calculateTotalPrice();
    const quantity = item?.quantity || 1;
    const totalPrice = unitPrice * quantity;

    const handleSave = async () => {
        if (!item || !activeProduct) return;
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
            const addonGroup = activeProduct.addons?.find(
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
                const addonItem = addonGroup.items.find(
                    (i) => i.id === parseInt(itemId, 10),
                );
                if (!addonItem) return;

                selectedItems.push({
                    name: addonItem.title,
                    quantity: qty,
                    price: addonItem.extra_price,
                });
            });

            if (selectedItems.length > 0) {
                addonDetails.push({
                    groupName: addonGroup.name,
                    items: selectedItems,
                });
            }
        });

        await updateItemConfiguration(
            item.id,
            {
                id: generateCartItemId(activeProduct.id, {
                    variantId: selectedVariantId,
                    addons: selectedAddons,
                    customFields,
                    notes,
                }),
                name: activeProduct.title,
                image: activeProduct.cover_image_url,
                price: calculateTotalPrice(),
                categoryId: String(activeProduct.categories?.[0]?.id || ''),
                metadata: {
                    productId: activeProduct.id,
                    productSlug: activeProduct.slug,
                    product_variant_id: selectedVariantId || null,
                    variant_options:
                        selectedVariant?.option_values &&
                        Object.keys(selectedVariant.option_values).length > 0
                            ? selectedVariant.option_values
                            : undefined,
                    variety: selectedVariant
                        ? { name: selectedVariant.title }
                        : undefined,
                    addons: selectedAddons,
                    addonDetails,
                    custom_fields:
                        Object.keys(customFields).length > 0
                            ? customFields
                            : undefined,
                    notes: notes || undefined,
                },
            },
            item.quantity,
        );

        onClose();
    };

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
                        className="bg-white shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col relative max-h-[88vh] rounded-2xl lg:rounded-4xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
                        <header className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-100 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xl"
                                onClick={onClose}
                                aria-label={t('close')}>
                                <X className="size-5" />
                            </Button>
                            <DialogTitle
                                as="h2"
                                className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                                {item?.name || t('product')}
                            </DialogTitle>
                            <div className="w-9 min-w-[44px]" />
                        </header>

                        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-6">
                            {isLoading && (
                                <div className="text-sm text-gray-500">
                                    {t('loading') || 'Loading...'}
                                </div>
                            )}
                            {isError && (
                                <div className="text-sm text-red-500">
                                    {t('loadProductError') ||
                                        'Unable to load product details'}
                                </div>
                            )}
                            {!isLoading && activeProduct && (
                                <>
                                    {activeProduct.variants &&
                                        activeProduct.variants.length > 0 && (
                                            <VariantSelector
                                                variants={
                                                    activeProduct.variants
                                                }
                                                selectedVariantId={
                                                    selectedVariantId
                                                }
                                                onSelect={(variantId) =>
                                                    setSelectedVariantId(
                                                        variantId,
                                                    )
                                                }
                                                required
                                            />
                                        )}

                                    {(activeProduct.addons || []).map(
                                        (addonGroup) => (
                                            <AddonSelector
                                                key={addonGroup.id}
                                                addonGroup={addonGroup}
                                                selectedItems={
                                                    selectedAddons[
                                                        addonGroup.id
                                                    ] || {}
                                                }
                                                onUpdateSelection={(
                                                    itemId,
                                                    qty,
                                                ) => {
                                                    setSelectedAddons(
                                                        (prev) => ({
                                                            ...prev,
                                                            [addonGroup.id]: {
                                                                ...prev[
                                                                    addonGroup
                                                                        .id
                                                                ],
                                                                [itemId]: qty,
                                                            },
                                                        }),
                                                    );
                                                }}
                                            />
                                        ),
                                    )}

                                    {activeProduct.custom_fields &&
                                        activeProduct.custom_fields.length >
                                            0 && (
                                            <CustomFieldsForm
                                                customFields={
                                                    activeProduct.custom_fields
                                                }
                                                values={customFields}
                                                onChange={(name, value) => {
                                                    setCustomFields((prev) => ({
                                                        ...prev,
                                                        [name]: value,
                                                    }));
                                                }}
                                            />
                                        )}

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">
                                            {t('notes')}
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </>
                            )}
                        </main>

                        <footer className="p-4 sm:p-5 md:p-6 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
                            <div className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-700">
                                    {t('price')}:
                                </span>{' '}
                                <span className="font-bold text-gray-900">
                                    {totalPrice}
                                </span>{' '}
                                <CurrencySymbol className="inline-block w-3.5 h-3.5" />
                                <span className="text-xs text-gray-400 ml-2">
                                    {t('perQuantity')} × {quantity}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="xl"
                                    onClick={onClose}
                                    className="px-6">
                                    {t('cancel') || 'Cancel'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="xl"
                                    onClick={handleSave}
                                    disabled={
                                        !validation.isValid ||
                                        isLoading ||
                                        isError
                                    }
                                    className={cn(
                                        'active:scale-[0.98]',
                                        (!validation.isValid ||
                                            isLoading ||
                                            isError) &&
                                        'bg-gray-100 text-gray-400 cursor-not-allowed border-none shadow-none hover:brightness-100',
                                    )}>
                                    {t('save') || 'Save'}
                                </Button>
                            </div>
                        </footer>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
