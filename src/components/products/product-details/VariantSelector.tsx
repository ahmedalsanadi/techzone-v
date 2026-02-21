import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductVariant } from '@/types/store';
import { cn } from '@/lib/utils';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Radio, RadioGroup, Field, Label } from '@headlessui/react';

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedVariantId: number | null;
    onSelect: (variantId: number) => void;
    required?: boolean;
}

interface VariantItemProps {
    variant: ProductVariant;
    t: (key: string) => string;
}

const VariantItem = React.memo(({ variant, t }: VariantItemProps) => {
    const variantPrice = variant.sale_price || variant.price;
    const originalPrice = variant.sale_price ? variant.price : undefined;
    const isAvailable = variant.is_available !== false;

    return (
        <Radio
            value={variant.id}
            disabled={!isAvailable}
            className={cn(
                'flex items-center justify-between py-3 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors outline-none',
                'data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:contrast-75',
            )}>
            {({ checked }) => (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                checked
                                    ? 'border-theme-primary bg-white'
                                    : 'border-gray-200 group-hover:border-gray-300',
                                !isAvailable && 'border-gray-300 bg-gray-50',
                            )}>
                            {checked && isAvailable && (
                                <div className="w-2.5 h-2.5 rounded-full bg-theme-primary shadow-[0_0_8px_rgba(var(--theme-primary-rgb),0.3)]" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'text-sm font-bold transition-colors md:text-base',
                                        checked
                                            ? 'text-gray-900'
                                            : 'text-gray-700',
                                    )}>
                                    {variant.title}
                                </span>
                                {!isAvailable && (
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                        {t('outOfStock')}
                                    </span>
                                )}
                            </div>
                            {Object.keys(variant.option_values).length > 0 && (
                                <div className="flex items-center gap-2 mt-0.5">
                                    {Object.entries(variant.option_values).map(
                                        ([key, value]) => (
                                            <span
                                                key={key}
                                                className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                                                {key}: {value}
                                            </span>
                                        ),
                                    )}
                                </div>
                            )}
                            {variant.calories && (
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50 mt-0.5 w-fit">
                                    {variant.calories} {t('calories')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-gray-900 leading-none md:text-base">
                                    {variantPrice}
                                </span>
                                <CurrencySymbol className="w-3.5 h-3.5" />
                            </div>
                            {originalPrice && (
                                <div className="flex items-center gap-1 opacity-60">
                                    <span className="text-xs text-gray-500 line-through font-semibold leading-none md:text-sm">
                                        {originalPrice}
                                    </span>
                                    <CurrencySymbol className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Radio>
    );
});

VariantItem.displayName = 'VariantItem';

export default function VariantSelector({
    variants,
    selectedVariantId,
    onSelect,
    required = true,
}: VariantSelectorProps) {
    const t = useTranslations('Product');

    if (!variants || variants.length === 0) return null;

    return (
        <div className="border border-gray-100 rounded-2xl bg-white p-5 sm:p-6 flex flex-col h-full shadow-sm">
            <Field className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                            <Label className="text-sm font-bold text-gray-900 block md:text-lg">
                                {t('variants') || 'Variants'}
                            </Label>
                            {required && (
                                <span
                                    className={cn(
                                        'text-xs font-bold px-2.5 py-0.5 rounded-full',
                                        'bg-red-50 text-red-700',
                                    )}>
                                    {t('required')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pt-1 flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto">
                    <RadioGroup
                        value={selectedVariantId ?? undefined}
                        onChange={onSelect}
                        className="flex flex-col divide-y divide-gray-100">
                        {variants.map((variant) => (
                            <VariantItem
                                key={variant.id}
                                variant={variant}
                                t={t}
                            />
                        ))}
                    </RadioGroup>
                </div>
            </Field>
        </div>
    );
}
