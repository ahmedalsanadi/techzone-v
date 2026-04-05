'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Plus, Minus } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Button } from '@/components/ui/Button';
import { formatMoneyAmount } from '@/lib/utils';
import { getCartItemLineTotal } from '@/lib/cart/utils';
import { addonContributionWithDefault } from '@/lib/products/addonPrice';
import DynamicImage from '@/components/ui/DynamicImage';
import type { CartItem } from '@/store/useCartStore';

interface CartLineItemProps {
    item: CartItem;
    disableCheckout: boolean;
    onQuantityChange: (itemId: string, quantity: number) => void;
}

export function CartLineItem({
    item,
    disableCheckout,
    onQuantityChange,
}: CartLineItemProps) {
    const t = useTranslations('Cart');
    const locale = useLocale();
    const productSlug = item.metadata?.productSlug;
    const productUrl = productSlug ? `/products/${productSlug}` : null;

    return (
        <div className="bg-white border border-gray-100 p-3 md:p-5 rounded-2xl flex flex-row md:items-center gap-4 md:gap-6 shadow-sm hover:shadow-md transition-shadow">
            {productUrl ? (
                <Link
                    href={productUrl}
                    className="relative size-24 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 hover:opacity-90 transition-opacity">
                    <DynamicImage
                        src={item.image}
                        alt={item.name}
                        className="object-cover"
                    />
                </Link>
            ) : (
                <div className="relative size-24 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <DynamicImage
                        src={item.image}
                        alt={item.name}
                        className="object-cover"
                    />
                </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                <div className="flex-1 min-w-0">
                    {productUrl ? (
                        <Link href={productUrl} className="group/title block">
                            <h3 className="font-bold text-gray-900 text-base md:text-xl group-hover/title:text-theme-primary transition-colors truncate">
                                {item.name}
                            </h3>
                        </Link>
                    ) : (
                        <h3 className="font-bold text-gray-900 text-base md:text-xl truncate">
                            {item.name}
                        </h3>
                    )}

                    {item.metadata?.variety ? (
                        <p className="text-xs md:text-sm text-gray-400 font-medium -mt-0.5 md:-mt-1">
                            {item.metadata.variety.name}
                        </p>
                    ) : null}

                    {item.metadata?.addonDetails &&
                    item.metadata.addonDetails.length > 0 ? (
                        <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1">
                            {item.metadata.addonDetails.map((addonGroup, groupIdx) => (
                                <div
                                    key={groupIdx}
                                    className="flex flex-wrap gap-x-2 md:block md:space-y-0.5">
                                    {addonGroup.items.map((addonItem, itemIdx) => {
                                        const displayQty = addonItem.quantity;
                                        return (
                                            <div
                                                key={`${groupIdx}-${itemIdx}`}
                                                className="text-[10px] md:text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
                                                <span className="text-gray-700">
                                                    {addonItem.name} ({displayQty})
                                                </span>
                                                <span className="font-medium text-gray-800 inline-flex items-center gap-0.5">
                                                    {formatMoneyAmount(
                                                        addonContributionWithDefault(
                                                            addonItem.price,
                                                            addonItem.quantity,
                                                            addonItem.multiplyByQuantity,
                                                        ),
                                                        locale,
                                                    )}
                                                    <CurrencySymbol className="size-2.5 md:w-3 md:h-3" />
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {item.metadata?.variant_options &&
                        Object.keys(item.metadata.variant_options).length > 0 && (
                            <div className="mt-1.5 md:mt-2 flex flex-wrap gap-1 md:gap-1.5">
                                {Object.entries(item.metadata.variant_options).map(
                                    ([key, value]) => (
                                        <span
                                            key={key}
                                            className="text-[10px] md:text-[11px] font-bold text-gray-500 bg-gray-50 px-1.5 md:px-2 py-0.5 rounded-md border border-gray-100">
                                            {key}: {String(value)}
                                        </span>
                                    ),
                                )}
                            </div>
                        )}

                    {item.metadata?.notes && (
                        <div className="mt-1 md:mt-2 text-[10px] md:text-xs text-gray-500 italic">
                            {t('notes')}: {item.metadata.notes}
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-1 mt-1 text-theme-primary font-black">
                        <span>
                            {formatMoneyAmount(
                                getCartItemLineTotal(item),
                                locale,
                            )}
                        </span>
                        <CurrencySymbol className="w-3.5 h-3.5" />
                    </div>

                    {item.metadata?.custom_fields &&
                        Object.keys(item.metadata.custom_fields).length > 0 && (
                            <div className="mt-2 space-y-0.5 border-t border-gray-100 pt-2 hidden md:block">
                                {Object.entries(item.metadata.custom_fields).map(
                                    ([key, value]) => (
                                        <div
                                            key={key}
                                            className="text-[11px] text-gray-500 flex items-center justify-between">
                                            <span className="font-semibold text-gray-600 capitalize">
                                                {key.replace(/_/g, ' ')}:
                                            </span>
                                            <span className="truncate ml-2 text-gray-700">
                                                {typeof value === 'boolean'
                                                    ? value
                                                        ? 'Yes'
                                                        : 'No'
                                                    : String(value)}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                </div>

                <div
                    className="flex flex-row md:flex-wrap items-center justify-between md:justify-start gap-4 md:gap-3 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-gray-50 md:border-0"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="md:hidden flex items-center gap-1 text-theme-primary font-black text-lg">
                        <span>
                            {formatMoneyAmount(
                                getCartItemLineTotal(item),
                                locale,
                            )}
                        </span>
                        <CurrencySymbol className="size-4" />
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0">
                        <Button
                            type="button"
                            variant="stepper"
                            size="icon-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuantityChange(item.id, item.quantity - 1);
                            }}
                            disabled={disableCheckout}
                            className="hover:bg-gray-200/50 active:scale-95">
                            <Minus />
                        </Button>
                        <span className="w-8 md:w-10 text-center font-bold text-gray-900 text-sm md:text-base">
                            {item.quantity}
                        </span>
                        <Button
                            type="button"
                            variant="stepper"
                            size="icon-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuantityChange(item.id, item.quantity + 1);
                            }}
                            disabled={disableCheckout}
                            className="hover:bg-gray-200/50 active:scale-95">
                            <Plus />
                        </Button>
                    </div>

                    {/* Edit / remove — re-enable when wiring parent handlers + lucide `Edit` / `Trash2`
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                        }}
                        disabled={disableCheckout}
                        className="hover:text-theme-primary"
                        aria-label={t('editItem') || 'Edit item'}>
                        <Edit />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id);
                        }}
                        disabled={disableCheckout}
                        className="hover:text-red-500 hover:bg-red-50"
                        aria-label={t('removeItem') || 'Remove item'}>
                        <Trash2 />
                    </Button>
                    */}
                </div>
            </div>
        </div>
    );
}
