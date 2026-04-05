'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Button } from '@/components/ui/Button';
import { formatMoneyAmount } from '@/lib/utils';

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
        <Button
            type="button"
            variant="stepper"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className="active:scale-95">
            <Icon className="w-3.5 h-3.5" strokeWidth={3} />
        </Button>
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
    const locale = useLocale();

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
                <Button
                    type="button"
                    variant="primary"
                    size='2xl'
                    onClick={onAddToCart}
                    disabled={!isAvailable}
                    className={cn(
                        'flex items-center justify-between gap-12 max-w-[260px] px-5 py-2.5 rounded-lg transition-all active:scale-[0.98] group',
                        !isAvailable && 'bg-gray-400 shadow-none',
                    )}>
                    <span className="text-sm sm:text-lg font-bold">
                        {buttonText}
                    </span>
                    {isAvailable && isValid && (
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            {originalPrice != null && originalPrice > 0 && (
                                <div className="flex items-center gap-1 opacity-60">
                                    <span className="text-[10px] sm:text-sm line-through font-bold">
                                        {formatMoneyAmount(
                                            originalPrice,
                                            locale,
                                        )}
                                    </span>
                                    <CurrencySymbol className="brightness-0 invert w-2.5 h-2.5" />
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <span className="text-base sm:text-xl font-black tabular-nums">
                                    {formatMoneyAmount(totalPrice, locale)}
                                </span>
                                <CurrencySymbol className="brightness-0 invert w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
