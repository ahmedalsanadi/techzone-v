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
        <div className="flex items-center justify-between py-3 sm:py-4 group">
            <span className="text-base sm:text-lg font-bold text-gray-700 transition-colors group-hover:text-black">
                {sauce.name}
            </span>

            <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-base sm:text-lg font-black text-gray-900 group-hover:text-libero-red">
                    + {sauce.price} {t('currency')}
                </span>

                <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-100">
                    <button
                        onClick={() => onUpdateQuantity(sauce.id, -1)}
                        disabled={qty === 0}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm disabled:opacity-20 transition-all hover:text-red-500">
                        {qty === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                            <Minus
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                strokeWidth={3}
                            />
                        )}
                    </button>
                    <span className="w-4 sm:w-5 text-center font-black text-base sm:text-lg">
                        {qty}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(sauce.id, 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm transition-all hover:text-libero-red">
                        <Plus
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            strokeWidth={3}
                        />
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
        <div className="flex flex-col gap-4 sm:gap-6 bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold">{t('sauce')}</h3>
                <span className="bg-gray-50 text-gray-500 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-bold border border-gray-100">
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
