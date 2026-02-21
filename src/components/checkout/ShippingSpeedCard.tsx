'use client';

import React from 'react';
import CheckoutCard from './CheckoutCard';
import { formatMoneyAmount } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { cn } from '@/lib/utils';
import { Truck, Check } from 'lucide-react';

interface ShippingSpeedOption {
    value: number;
    label: string;
    description: string;
    fee: number;
}

interface ShippingSpeedCardProps {
    title?: string;
    options: ShippingSpeedOption[];
    selectedId: number | null;
    onChange: (id: number) => void;
    isLoading?: boolean;
}

export default function ShippingSpeedCard({
    title,
    options,
    selectedId,
    onChange,
    isLoading = false,
}: ShippingSpeedCardProps) {
    const t = useTranslations('Checkout');
    const locale = useLocale();

    return (
        <CheckoutCard title={title || t('shippingSpeed')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                          <div
                              key={i}
                              className="h-20 w-full rounded-2xl bg-gray-50 animate-pulse border border-gray-100"
                          />
                      ))
                    : options.map((option) => {
                          const isSelected = selectedId === option.value;
                          return (
                              <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => onChange(option.value)}
                                  className={cn(
                                      'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right',
                                      isSelected
                                          ? 'border-theme-primary bg-theme-primary/5'
                                          : 'border-gray-100 hover:border-gray-200 bg-white',
                                  )}>
                                  <div
                                      className={cn(
                                          'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                          isSelected
                                              ? 'bg-theme-primary text-white'
                                              : 'bg-gray-100 text-gray-400',
                                      )}>
                                      <Truck className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="font-bold text-gray-900 leading-tight">
                                          {option.label}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                          {option.description}
                                      </div>
                                      <div className="flex items-center gap-1 mt-1 font-bold text-theme-primary text-sm">
                                          {option.fee === 0 ? (
                                              t('free')
                                          ) : (
                                              <>
                                                  <span>
                                                      {formatMoneyAmount(
                                                          option.fee,
                                                          locale,
                                                      )}
                                                  </span>
                                                  <CurrencySymbol className="w-3.5 h-3.5" />
                                              </>
                                          )}
                                      </div>
                                  </div>
                                  {isSelected && (
                                      <div className="absolute top-2 left-2 size-5 rounded-full bg-theme-primary flex items-center justify-center shrink-0">
                                          <Check className="size-3 text-white" />
                                      </div>
                                  )}
                              </button>
                          );
                      })}
            </div>
        </CheckoutCard>
    );
}
