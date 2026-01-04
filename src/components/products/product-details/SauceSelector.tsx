'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductSauce } from '@/lib/mock-data';
import { Plus, Minus, Trash2 } from 'lucide-react';

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
        <div className="flex items-center justify-between py-4 group">
            <span className="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">
                {sauce.name}
            </span>

            <div className="flex items-center gap-4">
                <span className="text-lg font-black text-gray-900 group-hover:text-libero-red">
                    + {sauce.price} {t('currency')}
                </span>

                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => onUpdateQuantity(sauce.id, -1)}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm disabled:opacity-20 transition-all hover:text-red-500">
                        {qty === 1 ? (
                            <Trash2 size={16} />
                        ) : (
                            <Minus size={16} strokeWidth={3} />
                        )}
                    </button>
                    <span className="w-5 text-center font-black text-lg">
                        {qty}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(sauce.id, 1)}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm transition-all hover:text-libero-red">
                        <Plus size={16} strokeWidth={3} />
                    </button>
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
        <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{t('sauce')}</h3>
                <span className="bg-gray-50 text-gray-500 px-4 py-1 rounded-full text-sm font-bold border border-gray-100">
                    {t('optional')}
                </span>
            </div>

            <div className="space-y-1 divide-y divide-gray-50">
                {sauces.map((sauce) => (
                    <SauceItem
                        key={sauce.id}
                        sauce={sauce}
                        qty={selectedSauces[sauce.id] || 0}
                        onUpdateQuantity={onUpdateQuantity}
                        t={t}
                    />
                ))}
            </div>
        </div>
    );
}
