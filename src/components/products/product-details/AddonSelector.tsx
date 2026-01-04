'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductAddon } from '@/lib/mock-data';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddonSelectorProps {
    addons: ProductAddon[];
    selectedAddons: string[];
    onToggle: (id: string) => void;
}

interface AddonItemProps {
    addon: ProductAddon;
    isSelected: boolean;
    onToggle: (id: string) => void;
    t: (key: string) => string;
}

const AddonItem = React.memo(
    ({ addon, isSelected, onToggle, t }: AddonItemProps) => (
        <label className="flex items-center justify-between py-4 group cursor-pointer">
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        'w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all',
                        isSelected
                            ? 'border-libero-red bg-libero-red text-white'
                            : 'border-gray-200 group-hover:border-gray-300',
                    )}>
                    {isSelected && <Check size={18} strokeWidth={3} />}
                </div>
                <span className="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">
                    {addon.name}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-900">
                    + {addon.price} {t('currency')}
                </span>
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={() => onToggle(addon.id)}
            />
        </label>
    ),
);

AddonItem.displayName = 'AddonItem';

export default function AddonSelector({
    addons,
    selectedAddons,
    onToggle,
}: AddonSelectorProps) {
    const t = useTranslations('Product');

    return (
        <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{t('addons')}</h3>
                    <span className="bg-gray-50 text-gray-500 px-4 py-1 rounded-full text-sm font-bold border border-gray-100">
                        {t('optional')}
                    </span>
                </div>
                <p className="text-sm font-medium text-gray-400">
                    {t('maxAddons', {
                        max: 8,
                        current: selectedAddons.length,
                    })}
                </p>
            </div>

            <div className="space-y-1 divide-y divide-gray-50">
                {addons.map((addon) => (
                    <AddonItem
                        key={addon.id}
                        addon={addon}
                        isSelected={selectedAddons.includes(addon.id)}
                        onToggle={onToggle}
                        t={t}
                    />
                ))}
            </div>
        </div>
    );
}
