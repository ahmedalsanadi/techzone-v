// src/components/pages/products/product-details/SauceSelector.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductSauce } from '@/types/store';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomizationCard from '@/components/products/product-details/CustomizationCard';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Button } from '@/components/ui/Button';

interface SauceSelectorProps {
    sauces: ProductSauce[];
    selectedSauces: Record<string, number>;
    onUpdateQuantity: (id: string, delta: number) => void;
}

interface SauceItemProps {
    sauce: ProductSauce;
    qty: number;
    onUpdateQuantity: (id: string, delta: number) => void;
    t: (key: string) => string;
}

const SauceItem = React.memo(
    ({ sauce, qty, onUpdateQuantity, t }: SauceItemProps) => (
        <div className="flex items-center justify-between py-3 group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
            <span className="text-sm sm:text-base font-bold text-gray-700 transition-colors group-hover:text-gray-900">
                {sauce.name}
            </span>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <span className="text-md font-bold text-gray-800 leading-none">
                        + {sauce.price}
                    </span>
                    <CurrencySymbol className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2 bg-[#F1F3F5] p-1 rounded-lg shadow-inner">
                    <Button
                        type="button"
                        variant="stepper"
                        size="icon-xs"
                        onClick={() => onUpdateQuantity(String(sauce.id), -1)}
                        disabled={qty === 0}
                        className={cn(
                            'active:scale-95',
                            qty === 0 && 'opacity-30',
                            qty > 0 && 'hover:text-red-500',
                        )}>
                        {qty === 1 ? (
                            <Trash2 size={13} />
                        ) : (
                            <Minus size={13} strokeWidth={3} />
                        )}
                    </Button>
                    <span className="w-5 text-center font-bold text-base text-gray-800">
                        {qty}
                    </span>
                    <Button
                        type="button"
                        variant="stepper"
                        size="icon-xs"
                        onClick={() => onUpdateQuantity(String(sauce.id), 1)}
                        className="hover:text-libero-red active:scale-95">
                        <Plus size={13} strokeWidth={3} />
                    </Button>
                </div>
            </div>
        </div>
    ),
);

SauceItem.displayName = 'SauceItem';

export default function SauceSelector({
    sauces,
    selectedSauces,
    onUpdateQuantity,
}: SauceSelectorProps) {
    const t = useTranslations('Product');

    return (
        <CustomizationCard
            title={t('sauce')}
            badge={{ text: t('optional'), variant: 'optional' }}>
            <div className="flex flex-col divide-y divide-gray-50">
                {sauces.map((sauce) => (
                    <SauceItem
                        key={sauce.id}
                        sauce={sauce}
                        qty={selectedSauces[String(sauce.id)] || 0}
                        onUpdateQuantity={onUpdateQuantity}
                        t={t}
                    />
                ))}
            </div>
        </CustomizationCard>
    );
}
