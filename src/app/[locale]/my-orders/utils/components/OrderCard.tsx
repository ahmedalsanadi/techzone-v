'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, Store, Calendar, MapPin, Banknote, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { cn } from '@/lib/utils';

import { Order, OrderStatus } from '@/types/orders';
import { Link } from '@/i18n/navigation';

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    const t = useTranslations('Orders');

    const statusConfig: Record<
        string,
        { bg: string; text: string; label: string }
    > = {
        WAITING_APPROVAL: {
            bg: 'bg-[#FFF8E1]',
            text: 'text-[#FBC02D]',
            label: order.status_label || t('status.waiting'),
        },
        WAITING_PAYMENT: {
            bg: 'bg-[#FFF8E1]',
            text: 'text-[#FBC02D]',
            label: order.status_label || t('status.waiting_payment'),
        },
        PREPARING: {
            bg: 'bg-[#E3F2FD]',
            text: 'text-[#1976D2]',
            label: order.status_label || t('status.preparing'),
        },
        READY: {
            bg: 'bg-[#E3F2FD]',
            text: 'text-[#1976D2]',
            label: order.status_label || t('status.ready'),
        },
        ON_THE_WAY: {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#2E7D32]',
            label: order.status_label || t('status.with_courier'),
        },
        DELIVERED: {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#2E7D32]',
            label: order.status_label || t('status.delivered'),
        },
        COMPLETED: {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#2E7D32]',
            label: order.status_label || t('status.completed'),
        },
        CANCELLED: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            label: order.status_label || t('status.cancelled'),
        },
        REJECTED: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            label: order.status_label || t('status.rejected'),
        },
    };

    const currentStatus = statusConfig[order.status] || {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        label: order.status_label || order.status,
    };

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { formattedDate, formattedTime } = React.useMemo(() => {
        if (!mounted) return { formattedDate: '', formattedTime: '' };
        try {
            const dateObj = new Date(order.created_at);
            return {
                formattedDate: dateObj.toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                formattedTime: dateObj.toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
            };
        } catch (e) {
            return { formattedDate: '', formattedTime: '' };
        }
    }, [order.created_at, mounted]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all duration-300 ">
            {/* Header: Status, Rating and Order Number */}
            <div className="flex items-center justify-between gap-4 pt-2 pb-4 border-b border-gray-200">
                <h3 className="text-lg md:text-2xl font-black text-gray-900 truncate">
                    {t('orderNumber', { number: order.id })}
                </h3>

                <div className="flex items-center gap-2">
                    {order.review && (
                        <div className="flex items-center gap-1 bg-[#F1F3F5] px-2.5 py-1.5 rounded-lg shrink-0">
                            <span className="text-sm font-bold text-gray-700 leading-none">
                                {order.review.rate.toFixed(1)}
                            </span>
                            <Star className="w-3.5 h-3.5 fill-[#FBC02D] text-[#FBC02D]" />
                        </div>
                    )}

                    <Badge
                        className={cn(
                            'px-4 py-1.5 rounded-lg border-none font-bold text-sm whitespace-nowrap',
                            currentStatus.bg,
                            currentStatus.text,
                        )}>
                        {currentStatus.label}
                    </Badge>
                </div>
            </div>

            {/* Order Details List */}
            <div className="flex flex-col gap-3">
                {/* Branch */}
                <div className="flex items-center gap-3 text-gray-500">
                    <Store className="w-5 h-5 opacity-60" />
                    <span className="text-sm font-medium">
                        {t('branch', { name: order.branch_name })}
                    </span>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-3 text-gray-500">
                    <Calendar className="w-5 h-5 opacity-60" />

                    <span className="text-sm font-medium" dir="rtl">
                        {t('createdAt', {
                            date: formattedDate,
                            time: formattedTime,
                        })}
                    </span>
                </div>

                {/* Delivery Location */}
                <div className="flex items-center gap-3 text-gray-500">
                    <MapPin className="w-5 h-5 opacity-60" />

                    <div className="flex flex-col">
                        <span className="text-[11px] opacity-70 leading-tight">
                            {order.metadata?.notes || order.notes || ''}
                        </span>
                        <span className="text-sm font-medium">
                            {t('deliveryTo', {
                                location: order.fulfillment_label,
                            })}
                        </span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex items-center gap-3 text-gray-900">
                    <Banknote className="w-5 h-5 opacity-60" />

                    <div className="flex items-center gap-1">
                        <span className="text-lg font-black tracking-tight">
                            {order.total.toFixed(2)}
                        </span>
                        <CurrencySymbol className="w-4 h-4 me-1" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-auto">
                {order.status === 'DELIVERED' ||
                order.status === 'COMPLETED' ? (
                    <>
                        <Button
                            asChild
                            variant="secondary"
                            className="flex-1 bg-[#F1F3F5] text-gray-600 hover:bg-gray-200 border-none font-bold h-11 rounded-xl">
                            <Link href={`/my-orders/${order.id}`}>
                                {t('details')}
                            </Link>
                        </Button>
                        <Button className="flex-1 bg-theme-primary hover:brightness-[0.95] text-white border-none font-bold h-11 rounded-xl shadow-lg shadow-theme-primary/20">
                            {t('reorder')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="secondary"
                            className="flex-1 bg-[#F1F3F5] text-gray-600 hover:bg-gray-200 border-none font-bold h-11 rounded-xl">
                            {t('reportProblem')}
                        </Button>
                        <Button
                            asChild
                            className="flex-1 bg-theme-primary/10 text-theme-primary hover:bg-theme-primary/5 border-none font-bold h-11 rounded-xl">
                            <Link href={`/my-orders/${order.id}`}>
                                {t('details')}
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
