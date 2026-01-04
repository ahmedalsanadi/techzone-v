'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductVariety } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
    varieties: ProductVariety[];
    selectedVarietyId: string;
    onSelect: (id: string) => void;
}

interface VarietyItemProps {
    v: ProductVariety;
    isSelected: boolean;
    onSelect: (id: string) => void;
    t: (key: string) => string;
}

const VarietyItem = React.memo(
    ({ v, isSelected, onSelect, t }: VarietyItemProps) => (
        <label
            className={cn(
                'flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group',
                isSelected
                    ? 'border-libero-red bg-libero-red/3'
                    : 'border-gray-50 bg-white hover:border-gray-200',
            )}>
            <div className="flex items-center gap-4 relative z-10">
                <div
                    className={cn(
                        'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected
                            ? 'border-libero-red bg-libero-red/10'
                            : 'border-gray-300',
                    )}>
                    {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-libero-red" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold">{v.name}</span>
                    <span className="text-sm text-gray-400 font-medium">
                        {v.calories} {t('calories')} • {v.prepTime}{' '}
                        {t('prepTime')}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-gray-900">
                        {v.price} {t('currency')}
                    </span>
                    {v.originalPrice && (
                        <span className="text-sm text-gray-400 line-through font-bold">
                            {v.originalPrice}
                        </span>
                    )}
                </div>
            </div>

            <input
                type="radio"
                className="hidden"
                checked={isSelected}
                onChange={() => onSelect(v.id)}
            />
        </label>
    ),
);

VarietyItem.displayName = 'VarietyItem';

export default function SizeSelector({
    varieties,
    selectedVarietyId,
    onSelect,
}: SizeSelectorProps) {
    const t = useTranslations('Product');

    return (
        <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{t('size')}</h3>
                <span className="bg-red-50 text-red-500 px-4 py-1 rounded-full text-sm font-bold border border-red-100">
                    {t('required')}
                </span>
            </div>

            <div className="space-y-4">
                {varieties.map((v) => (
                    <VarietyItem
                        key={v.id}
                        v={v}
                        isSelected={selectedVarietyId === v.id}
                        onSelect={onSelect}
                        t={t}
                    />
                ))}
            </div>
        </div>
    );
}
