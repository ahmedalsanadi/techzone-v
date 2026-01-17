'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus, AlertCircle } from 'lucide-react';
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
            return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
        }
    };

    const selectedCount = getSelectedCount();
    const isSingleSelection = addonGroup.max_selected === 1;
    const hasReachedMax = addonGroup.max_selected !== null && selectedCount >= addonGroup.max_selected;
    const isBelowMin = selectedCount < addonGroup.min_selected;
    const validationError = isBelowMin && addonGroup.is_required;

    // Check if we can select more items
    const canSelectMore = (): boolean => {
        if (addonGroup.max_selected === null) return true; // Unlimited
        return selectedCount < addonGroup.max_selected;
    };

    // Check if we can deselect an item
    const canDeselect = (itemId: number): boolean => {
        const currentQty = selectedItems[itemId] || 0;
        if (currentQty === 0) return false;
        
        // Check if deselecting would violate min_selected
        const newCount = selectedCount - (addonGroup.input_type === 'boolean' ? 1 : currentQty);
        return newCount >= addonGroup.min_selected;
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
                // Deselecting
                if (!canDeselect(itemId)) return;
                onUpdateSelection(itemId, 0);
            } else {
                // Selecting: deselect all others if max_selected is 1
                Object.keys(selectedItems).forEach((id) => {
                    if (parseInt(id) !== itemId && selectedItems[parseInt(id)] > 0) {
                        onUpdateSelection(parseInt(id), 0);
                    }
                });
                onUpdateSelection(itemId, 1);
            }
        } else {
            // Checkbox behavior
            if (currentQty > 0) {
                // Deselecting
                if (!canDeselect(itemId)) return;
                onUpdateSelection(itemId, 0);
            } else {
                // Selecting
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
            // Incrementing
            if (!canIncrement(item, currentQty)) return;
            const newQty = item.max_quantity !== null 
                ? Math.min(currentQty + delta, item.max_quantity)
                : currentQty + delta;
            onUpdateSelection(itemId, newQty);
        } else {
            // Decrementing
            const newQty = Math.max(0, currentQty + delta);
            if (newQty === 0 && !canDeselect(itemId)) return;
            onUpdateSelection(itemId, newQty);
        }
    };

    return (
        <div className={cn(
            "space-y-4 p-4 border rounded-xl bg-white shadow-sm",
            validationError && "border-red-200 bg-red-50/30"
        )}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                            {addonGroup.name}
                        </h3>
                        {addonGroup.is_required && (
                            <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {t('required')}
                            </span>
                        )}
                    </div>
                    {addonGroup.description && (
                        <p className="text-sm text-gray-500 mt-1">
                            {addonGroup.description}
                        </p>
                    )}
                    {/* Selection count indicator */}
                    {addonGroup.max_selected !== null && (
                        <p className="text-xs text-gray-400 mt-1">
                            {selectedCount} / {addonGroup.max_selected} {t('selected') || 'selected'}
                        </p>
                    )}
                    {addonGroup.min_selected > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {t('minRequired') || 'Minimum'}: {addonGroup.min_selected}
                        </p>
                    )}
                </div>
            </div>

            {/* Validation error message */}
            {validationError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertCircle size={16} />
                    <span>
                        {t('minSelectionRequired', { count: addonGroup.min_selected }) || `Please select at least ${addonGroup.min_selected} item(s)`}
                    </span>
                </div>
            )}

            <div className="divide-y divide-gray-50">
                {addonGroup.items.map((item) => {
                    const quantity = selectedItems[item.id] || 0;
                    const isSelected = quantity > 0;
                    const isDisabled = hasReachedMax && !isSelected && addonGroup.input_type === 'boolean';
                    const canIncrementItem = canIncrement(item, quantity);
                    const canDecrementItem = quantity > 0 && canDeselect(item.id);

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "py-3 flex items-center justify-between transition-opacity",
                                isDisabled && "opacity-50"
                            )}>
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">
                                        {item.title}
                                    </span>
                                    {item.is_required && (
                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-semibold">
                                            {t('required')}
                                        </span>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {item.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-1 text-sm font-bold text-[#B44734] mt-1">
                                    <span>+ {item.extra_price}</span>
                                    <CurrencySymbol className="w-3.5 h-3.5" />
                                    {item.multiply_price_by_quantity && addonGroup.input_type === 'number' && (
                                        <span className="text-xs text-gray-400 ml-1">
                                            ({t('perQuantity') || 'per quantity'})
                                        </span>
                                    )}
                                </div>
                                {addonGroup.input_type === 'number' && item.max_quantity !== null && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {t('maxQuantity') || 'Max'}: {item.max_quantity}
                                    </p>
                                )}
                            </div>

                            {addonGroup.input_type === 'number' ? (
                                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border">
                                    <button
                                        onClick={() => handleQuantityChange(item.id, -1)}
                                        disabled={!canDecrementItem}
                                        className={cn(
                                            "p-1 hover:text-red-500 transition-colors",
                                            !canDecrementItem && "opacity-30 cursor-not-allowed"
                                        )}>
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(item.id, 1)}
                                        disabled={!canIncrementItem}
                                        className={cn(
                                            "p-1 hover:text-green-600 transition-colors",
                                            !canIncrementItem && "opacity-30 cursor-not-allowed"
                                        )}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleToggle(item.id)}
                                    disabled={isDisabled}
                                    className={cn(
                                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                                        isSelected
                                            ? 'bg-[#B44734] border-[#B44734] text-white'
                                            : 'border-gray-200 hover:border-gray-300',
                                        isDisabled && "opacity-50 cursor-not-allowed"
                                    )}>
                                    {isSelected && (
                                        <Plus size={16} strokeWidth={4} />
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
