// src/app/[locale]/my-orders/utils/components/OrderStatusTimeline.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatusUpdate } from '@/types/orders';

interface OrderStatusTimelineProps {
    timeline: OrderStatusUpdate[];
}

export function OrderStatusTimeline({ timeline }: OrderStatusTimelineProps) {
    const t = useTranslations('Orders.status');

    return (
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center md:text-start">
                {t('timelineTitle')} 
            </h3>

            <div className="flex flex-col ms-2 bg-white rounded-2xl p-6 border-2 border-gray-100">
                {timeline.map((item, index) => (
                    <div
                        key={item.status}
                        className="flex gap-4 relative pb-8 last:pb-0">
                        {/* Vertical Line */}
                        {index !== timeline.length - 1 && (
                            <div
                                className={cn(
                                    'absolute inset-s-[10px] top-[24px] bottom-[-8px] w-[2px]',
                                    item.completed
                                        ? 'bg-green-600'
                                        : 'bg-gray-200',
                                )}
                            />
                        )}

                        {/* Status Icon/Dot */}
                        <div
                            className={cn(
                                'relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500',
                                item.active
                                    ? 'bg-green-100 border-green-600 shadow-lg shadow-green-200/50'
                                    : item.completed
                                      ? 'bg-green-600 border-green-600'
                                      : 'bg-white border-gray-200',
                            )}>
                            {item.completed ? (
                                <Check
                                    className="w-3 h-3 text-white"
                                    strokeWidth={3}
                                />
                            ) : item.active ? (
                                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            )}
                        </div>

                        {/* Content Info */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1 -mt-0.5">
                            <span
                                className={cn(
                                    'font-semibold text-sm transition-colors duration-300',
                                    item.active
                                        ? 'text-green-700'
                                        : item.completed
                                          ? 'text-gray-900'
                                          : 'text-gray-500',
                                )}>
                                {item.label}
                            </span>
                            {item.timestamp && (
                                <span className="text-xs font-medium text-gray-400">
                                    {item.timestamp}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
