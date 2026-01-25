'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus, AlertCircle, Check, Trash2 } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { cn } from '@/lib/utils';

interface AddonItem {
    id: number;
    title: string;
    description: string | null;
    extra_price: number;
    max_quantity: number | null;
    default_value: number;
    multiply_price_by_quantity: boolean;
    is_required: boolean;
}

interface AddonGroup {
    id: number;
    name: string;
    description: string | null;
    input_type: 'boolean' | 'number';
    min_selected: number;
    max_selected: number | null;
    is_required: boolean;
    items: AddonItem[];
}

interface AddonSelectorProps {
    addonGroup: AddonGroup;
    selectedItems: Record<number, number>;
    onUpdateSelection: (itemId: number, quantity: number) => void;
}

export default function AddonSelector({
    addonGroup,
    selectedItems,
    onUpdateSelection,
}: AddonSelectorProps) {
    const t = useTranslations('Product');

    // Calculate total selected items count (for boolean) or total quantity (for number)
    const getSelectedCount = (): number => {
        if (addonGroup.input_type === 'boolean') {
            // Count items with quantity > 0
            return Object.values(selectedItems).filter((qty) => qty > 0).length;
        } else {
            // Sum all quantities for number input type
            return Object.values(selectedItems).reduce(
                (sum, qty) => sum + qty,
                0,
            );
        }
    };

    const selectedCount = getSelectedCount();
    const isSingleSelection = addonGroup.max_selected === 1;
    const hasReachedMax =
        addonGroup.max_selected !== null &&
        selectedCount >= addonGroup.max_selected;
    const isBelowMin = selectedCount < addonGroup.min_selected;
    const validationError = isBelowMin && addonGroup.is_required;

    // Check if we can select more items
    const canSelectMore = (): boolean => {
        if (addonGroup.max_selected === null) return true; // Unlimited
        return selectedCount < addonGroup.max_selected;
    };

    // Check if we can increment an item's quantity
    const canIncrement = (item: AddonItem, currentQty: number): boolean => {
        // Check max_quantity for number input type
        if (addonGroup.input_type === 'number' && item.max_quantity !== null) {
            if (currentQty >= item.max_quantity) return false;
        }

        // Check max_selected constraint
        if (!canSelectMore()) {
            // For boolean, if max_selected is reached, can't select more
            if (addonGroup.input_type === 'boolean' && currentQty === 0) {
                return false;
            }
            // For number, if max_selected is reached and this item is already selected, can't increment
            if (addonGroup.input_type === 'number' && currentQty > 0) {
                return false;
            }
        }

        return true;
    };

    const handleToggle = (itemId: number) => {
        const currentQty = selectedItems[itemId] || 0;

        if (isSingleSelection) {
            // Radio button behavior: deselect all others first
            if (currentQty > 0) {
                // Deselecting - always allowed (validation checked when adding to cart)
                onUpdateSelection(itemId, 0);
            } else {
                // Selecting: deselect all others if max_selected is 1
                Object.keys(selectedItems).forEach((id) => {
                    if (
                        parseInt(id) !== itemId &&
                        selectedItems[parseInt(id)] > 0
                    ) {
                        onUpdateSelection(parseInt(id), 0);
                    }
                });
                onUpdateSelection(itemId, 1);
            }
        } else {
            // Checkbox behavior
            if (currentQty > 0) {
                // Deselecting - always allowed (validation checked when adding to cart)
                onUpdateSelection(itemId, 0);
            } else {
                // Selecting - enforce max_selected constraint
                if (!canSelectMore()) return;
                onUpdateSelection(itemId, 1);
            }
        }
    };

    const handleQuantityChange = (itemId: number, delta: number) => {
        const item = addonGroup.items.find((i) => i.id === itemId);
        if (!item) return;

        const currentQty = selectedItems[itemId] || 0;

        if (delta > 0) {
            // Incrementing - enforce max_selected and max_quantity constraints
            if (!canIncrement(item, currentQty)) return;
            const newQty =
                item.max_quantity !== null
                    ? Math.min(currentQty + delta, item.max_quantity)
                    : currentQty + delta;
            onUpdateSelection(itemId, newQty);
        } else {
            // Decrementing - always allow (validation will check min_selected when adding to cart)
            const newQty = Math.max(0, currentQty + delta);
            onUpdateSelection(itemId, newQty);
        }
    };

    return (
        <div
            className={cn(
                'border border-gray-100 rounded-2xl bg-white p-5 sm:p-6 flex flex-col gap-4 h-full shadow-sm',
                validationError && 'border-red-200 bg-red-50/30',
            )}>
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-gray-900">
                            {addonGroup.name}
                        </h3>
                        {addonGroup.is_required && (
                            <span
                                className={cn(
                                    'text-xs font-bold px-2.5 py-0.5 rounded-full',
                                    'bg-red-50 text-red-700',
                                )}>
                                {t('required')}
                            </span>
                        )}
                        {!addonGroup.is_required && (
                            <span
                                className={cn(
                                    'text-xs font-bold px-2.5 py-0.5 rounded-full',
                                    'bg-gray-100 text-gray-700',
                                )}>
                                {t('optional')}
                            </span>
                        )}
                    </div>
                    {addonGroup.description && (
                        <p className="text-sm text-gray-500 font-medium">
                            {addonGroup.description}
                        </p>
                    )}
                    {/* Selection count indicator */}
                    {addonGroup.max_selected !== null && (
                        <p className="text-xs text-gray-400 mt-1">
                            {t('maxAddons', {
                                max: addonGroup.max_selected,
                                current: selectedCount,
                            }) ||
                                `${selectedCount} / ${addonGroup.max_selected} ${t('selected') || 'selected'}`}
                        </p>
                    )}
                    {addonGroup.min_selected > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {t('minRequired') || 'Minimum'}:{' '}
                            {addonGroup.min_selected}
                        </p>
                    )}
                </div>
            </div>
            <div className="pt-1">
                {/* Validation error message */}
                {validationError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-4">
                        <AlertCircle size={16} />
                        <span>
                            {t('minSelectionRequired', {
                                count: addonGroup.min_selected,
                            }) ||
                                `Please select at least ${addonGroup.min_selected} item(s)`}
                        </span>
                    </div>
                )}

                <div className="flex flex-col divide-y divide-gray-50">
                    {addonGroup.items.map((item) => {
                        const quantity = selectedItems[item.id] || 0;
                        const isSelected = quantity > 0;
                        const isDisabled =
                            hasReachedMax &&
                            !isSelected &&
                            addonGroup.input_type === 'boolean';
                        const canIncrementItem = canIncrement(item, quantity);
                        const canDecrementItem = quantity > 0; // Always allow decrementing (validation checked when adding to cart)

                        if (addonGroup.input_type === 'number') {
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between py-3 group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm sm:text-base font-bold text-gray-700 transition-colors group-hover:text-gray-900">
                                            {item.title}
                                        </span>
                                        {item.description && (
                                            <p className="text-xs text-gray-500">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-md font-bold text-gray-800 leading-none">
                                                + {item.extra_price}
                                            </span>
                                            <CurrencySymbol className="w-4 h-4" />
                                            {item.multiply_price_by_quantity && (
                                                <span className="text-[10px] font-medium text-gray-500">
                                                    (
                                                    {t('perQuantity') ||
                                                        'لكل كمية'}
                                                    )
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 bg-[#F1F3F5] p-1 rounded-lg shadow-inner">
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        -1,
                                                    )
                                                }
                                                disabled={!canDecrementItem}
                                                className={cn(
                                                    'w-7 h-7 rounded-md bg-white flex items-center justify-center transition-all shadow-sm active:scale-95',
                                                    !canDecrementItem
                                                        ? 'opacity-30 cursor-not-allowed'
                                                        : 'text-gray-600 hover:text-theme-primary',
                                                )}>
                                                {quantity === 1 ? (
                                                    <Trash2 size={13} />
                                                ) : (
                                                    <Minus
                                                        size={13}
                                                        strokeWidth={3}
                                                    />
                                                )}
                                            </button>
                                            <span className="w-5 text-center font-bold text-base text-gray-800">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        1,
                                                    )
                                                }
                                                disabled={!canIncrementItem}
                                                className={cn(
                                                    'w-7 h-7 rounded-md bg-white flex items-center justify-center transition-all shadow-sm active:scale-95',
                                                    !canIncrementItem
                                                        ? 'opacity-30 cursor-not-allowed'
                                                        : 'text-gray-600 hover:text-theme-primary',
                                                )}>
                                                <Plus
                                                    size={13}
                                                    strokeWidth={3}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <label
                                key={item.id}
                                className={cn(
                                    'flex items-center justify-between py-3 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors',
                                    isDisabled &&
                                        'opacity-50 cursor-not-allowed',
                                )}>
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                                            isSelected
                                                ? 'border-theme-primary bg-theme-primary text-white'
                                                : 'border-gray-200 group-hover:border-gray-300',
                                        )}>
                                        {isSelected && (
                                            <Check size={14} strokeWidth={3} />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span
                                            className={cn(
                                                'text-md font-bold transition-colors',
                                                isSelected
                                                    ? 'text-gray-900'
                                                    : 'text-gray-700',
                                            )}>
                                            {item.title}
                                        </span>
                                        {item.description && (
                                            <p className="text-xs text-gray-500">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1">
                                        <span className="text-md font-bold text-gray-900 leading-none">
                                            + {item.extra_price}
                                        </span>
                                        <CurrencySymbol className="w-4 h-4" />
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => handleToggle(item.id)}
                                    disabled={isDisabled}
                                />
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
