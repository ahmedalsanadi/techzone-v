'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import CurrencySymbol from '@/components/ui/CurrencySymbol';

interface ProductActionBarProps {
    totalPrice: number;
    originalPrice?: number;
    quantity: number;
    setQuantity: (qty: number | ((prev: number) => number)) => void;
    onAddToCart: () => void;
    isAvailable?: boolean;
    isValid?: boolean;
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
            className="w-9 h-9  rounded-lg bg-white flex items-center justify-center text-gray-600 hover:text-theme-primary transition-all shadow-sm disabled:opacity-30 active:scale-95 cursor-pointer">
            <Icon className="w-3.5 h-3.5 " strokeWidth={3} />
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
    isAvailable = true,
    isValid = true,
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

    const buttonText = React.useMemo(() => {
        if (!isAvailable) return t('outOfStock');
        if (!isValid) return t('completeSelection');
        return t('addToCart');
    }, [isAvailable, isValid, t]);

    return (
        <div className="border-t border-gray-200 pt-8 mt-auto">
            <div className="flex items-center justify-end gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-[#F1F3F5] rounded-lg p-1.5 shadow-inner">
                    <QtyButton
                        icon={Minus}
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || !isAvailable}
                    />
                    <span className="w-12 text-center text-lg font-bold text-gray-800">
                        {quantity}
                    </span>

                    <QtyButton
                        icon={Plus}
                        onClick={handleIncrement}
                        disabled={!isAvailable}
                    />
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={onAddToCart}
                    disabled={!isAvailable}
                    className={cn(
                        'flex items-center justify-between gap-12 max-w-[260px] bg-theme-primary hover:brightness-[0.95] text-white',
                        'px-5 py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-theme-primary/10 group cursor-pointer',
                        'disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed',
                    )}>
                    <span className="text-sm sm:text-lg font-bold">
                        {buttonText}
                    </span>
                    {isAvailable && isValid && (
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            {originalPrice && (
                                <div className="flex items-center gap-1 opacity-60">
                                    <span className="text-[10px] sm:text-sm line-through font-bold">
                                        {originalPrice}
                                    </span>
                                    <CurrencySymbol className="brightness-0 invert w-2.5 h-2.5" />
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <span className="text-base sm:text-xl font-black">
                                    {totalPrice}
                                </span>
                                <CurrencySymbol className="brightness-0 invert w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
