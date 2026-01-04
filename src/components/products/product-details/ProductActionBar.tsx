'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';

interface ProductActionBarProps {
    totalPrice: number;
    originalPrice?: number;
    quantity: number;
    setQuantity: (qty: number | ((prev: number) => number)) => void;
    onAddToCart: () => void;
}

interface QtyButtonProps {
    icon: React.ElementType;
    onClick: () => void;
    disabled?: boolean;
}

const QtyButton = React.memo(
    ({ icon: Icon, onClick, disabled }: QtyButtonProps) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-600 hover:text-[#B44B3A] transition-all shadow-sm disabled:opacity-30 active:scale-95">
            <Icon size={18} strokeWidth={3} />
        </button>
    ),
);

QtyButton.displayName = 'QtyButton';

export default function ProductActionBar({
    totalPrice,
    originalPrice,
    quantity,
    setQuantity,
    onAddToCart,
}: ProductActionBarProps) {
    const t = useTranslations('Product');

    const handleIncrement = React.useCallback(
        () => setQuantity((prev) => prev + 1),
        [setQuantity],
    );
    const handleDecrement = React.useCallback(
        () => setQuantity((prev) => Math.max(1, prev - 1)),
        [setQuantity],
    );

    return (
        <div className="border-t border-gray-100 pt-8 mt-auto">
            <div className="flex items-center justify-between gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-[#F1F3F5] rounded-xl p-1.5 shadow-inner">
                    <QtyButton icon={Plus} onClick={handleIncrement} />
                    <span className="w-12 text-center text-lg font-bold text-gray-800">
                        {quantity}
                    </span>
                    <QtyButton
                        icon={Minus}
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                    />
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={onAddToCart}
                    className="flex-1 max-w-[280px] bg-[#B44B3A] hover:bg-[#A04234] text-white rounded-xl px-6 py-4 flex items-center justify-between transition-all active:scale-[0.98] shadow-lg shadow-[#B44B3A]/10 group">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl font-black">
                            {totalPrice} {t('currency')}
                        </span>
                        {originalPrice && (
                            <span className="text-sm opacity-60 line-through font-bold">
                                {originalPrice * quantity} {t('currency')}
                            </span>
                        )}
                    </div>
                    <span className="text-lg font-bold">{t('addToCart')}</span>
                </button>
            </div>
        </div>
    );
}
