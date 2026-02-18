'use client';

import React from 'react';
import CheckoutCard from './CheckoutCard';
import { formatMoneyAmount } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

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

    return (
        <CheckoutCard title={title || t('shippingSpeed')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                          <div
                              key={i}
                              className="h-24 w-full rounded-2xl bg-gray-50 animate-pulse border border-gray-100"
                          />
                      ))
                    : options.map((option) => (
                          <button
                              key={option.value}
                              type="button"
                              onClick={() => onChange(option.value)}
                              className={cn(
                                  'group relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 text-right overflow-hidden',
                                  selectedId === option.value
                                      ? 'bg-linear-to-br from-theme-primary/10 to-theme-primary/5 border-theme-primary shadow-md scale-[1.02]'
                                      : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]',
                              )}>
                              {/* Background highlight */}
                              {selectedId === option.value && (
                                  <div className="absolute inset-0 bg-theme-primary/5 pointer-events-none" />
                              )}

                              <div className="flex items-center justify-between mb-3 relative z-10">
                                  <div
                                      className={cn(
                                          'p-2.5 rounded-xl transition-colors duration-300',
                                          selectedId === option.value
                                              ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/20'
                                              : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200',
                                      )}>
                                      <Truck className="w-5 h-5" />
                                  </div>
                                  <div className="flex flex-col items-end">
                                      <span
                                          className={cn(
                                              'font-black text-lg leading-none',
                                              selectedId === option.value
                                                  ? 'text-theme-primary'
                                                  : 'text-gray-900',
                                          )}>
                                          {option.fee === 0 ? (
                                              t('free')
                                          ) : (
                                              <div className="flex items-center gap-1">
                                                  <span>
                                                      {formatMoneyAmount(
                                                          option.fee,
                                                          useLocale(),
                                                      )}
                                                  </span>
                                                  <CurrencySymbol className="w-3.5 h-3.5" />
                                              </div>
                                          )}
                                      </span>
                                  </div>
                              </div>

                              <div className="relative z-10">
                                  <div
                                      className={cn(
                                          'font-bold text-base mb-1 transition-colors',
                                          selectedId === option.value
                                              ? 'text-theme-primary'
                                              : 'text-gray-900',
                                      )}>
                                      {option.label}
                                  </div>
                                  <div className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                                      {option.description}
                                  </div>
                              </div>

                              {/* Selection Indicator */}
                              <div
                                  className={cn(
                                      'absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                                      selectedId === option.value
                                          ? 'border-theme-primary bg-theme-primary scale-110'
                                          : 'border-gray-200 bg-white group-hover:border-gray-300',
                                  )}>
                                  {selectedId === option.value && (
                                      <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-300" />
                                  )}
                              </div>
                          </button>
                      ))}
            </div>
        </CheckoutCard>
    );
}
