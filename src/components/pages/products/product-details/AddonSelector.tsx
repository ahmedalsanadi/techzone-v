'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';

interface AddonItem {
    id: number;
    title: string;
    extra_price: number;
    max_quantity?: number;
    multiply_price_by_quantity: boolean;
}

interface AddonGroup {
    id: number;
    name: string;
    description: string;
    input_type: 'boolean' | 'number';
    min_selected: number;
    max_selected: number;
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

    const handleToggle = (itemId: number) => {
        const currentQty = selectedItems[itemId] || 0;
        const newQty = currentQty > 0 ? 0 : 1;
        onUpdateSelection(itemId, newQty);
    };

    const handleQuantityChange = (itemId: number, delta: number) => {
        const currentQty = selectedItems[itemId] || 0;
        const newQty = Math.max(0, currentQty + delta);
        onUpdateSelection(itemId, newQty);
    };

    return (
        <div className="space-y-4 p-4 border rounded-xl bg-white shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900">
                        {addonGroup.name}
                    </h3>
                    {addonGroup.description && (
                        <p className="text-sm text-gray-500">
                            {addonGroup.description}
                        </p>
                    )}
                </div>
                {addonGroup.is_required && (
                    <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {t('required')}
                    </span>
                )}
            </div>

            <div className="divide-y divide-gray-50">
                {addonGroup.items.map((item) => {
                    const quantity = selectedItems[item.id] || 0;
                    const isSelected = quantity > 0;

                    return (
                        <div
                            key={item.id}
                            className="py-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800">
                                    {item.title}
                                </span>
                                <div className="flex items-center gap-1 text-sm font-bold text-[#B44734]">
                                    <span>+ {item.extra_price}</span>
                                    <CurrencySymbol className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {addonGroup.input_type === 'number' ? (
                                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border">
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(item.id, -1)
                                        }
                                        className="p-1 hover:text-red-500 transition-colors disabled:opacity-30"
                                        disabled={quantity === 0}>
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-6 text-center font-bold text-sm">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(item.id, 1)
                                        }
                                        className="p-1 hover:text-red-500 transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleToggle(item.id)}
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                            ? 'bg-[#B44734] border-[#B44734] text-white'
                                            : 'border-gray-200'
                                    }`}>
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
