'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Star, Store, Calendar, MapPin, Banknote, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { cn, formatMoneyAmount, formatOrderDateAndTime } from '@/lib/utils';
import CurrencySymbol from '../ui/CurrencySymbol';

import { Order, OrderStatus, ORDER_STATUS_NUMBER_MAP } from '@/types/orders';
import { Link } from '@/i18n/navigation';

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    const t = useTranslations('Orders');
    const locale = useLocale();

    const statusKey =
        typeof order.status === 'number'
            ? (ORDER_STATUS_NUMBER_MAP[order.status] ?? 'WAITING_APPROVAL')
            : (order.status as OrderStatus);

    // Semantic colors: red = canceled/refunded, amber = waiting, gray = paid/in progress, green = fulfillment done
    const statusConfig: Record<
        string,
        { variant: BadgeVariant; label: string }
    > = {
        WAITING_APPROVAL: {
            variant: 'warning',
            label: order.status_label || t('status.waiting'),
        },
        WAITING_PAYMENT: {
            variant: 'warning',
            label: order.status_label || t('status.waiting_payment'),
        },
        PAID: {
            variant: 'secondary',
            label: order.status_label || t('status.paid'),
        },
        IN_PROCESS: {
            variant: 'secondary',
            label: order.status_label || t('status.in_process'),
        },
        READY_FOR_PICKUP: {
            variant: 'info',
            label: order.status_label || t('status.ready_for_pickup'),
        },
        SHIPPED: {
            variant: 'success',
            label: order.status_label || t('status.shipped'),
        },
        DELIVERED: {
            variant: 'success',
            label: order.status_label || t('status.delivered'),
        },
        COMPLETED: {
            variant: 'success',
            label: order.status_label || t('status.completed'),
        },
        CANCELED: {
            variant: 'destructive',
            label: order.status_label || t('status.canceled'),
        },
        REFUNDED: {
            variant: 'destructive',
            label: order.status_label || t('status.refunded'),
        },
        PARTIALLY_REFUNDED: {
            variant: 'destructive',
            label: order.status_label || t('status.partially_refunded'),
        },
    };

    const currentStatus = statusConfig[statusKey] || {
        variant: 'secondary',
        label: order.status_label || String(order.status),
    };

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { date: formattedDate, time: formattedTime } = React.useMemo(() => {
        if (!mounted) return { date: '', time: '' };
        return formatOrderDateAndTime(order.created_at);
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
                        variant={currentStatus.variant}
                        className="px-4 py-1.5 rounded-lg border-none font-bold text-sm whitespace-nowrap">
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

                    <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black tracking-tight">
                            {formatMoneyAmount(order.total, locale)}
                        </span>
                        <CurrencySymbol className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-auto">
                {statusKey === 'DELIVERED' ? (
                    <>
                        <Button
                            asChild
                            variant="secondaryMuted"
                            size="card"
                            className="flex-1">
                            <Link href={`/my-orders/${order.id}`}>
                                {t('details')}
                            </Link>
                        </Button>
                        <Button
                            variant="primary"
                            size="card"
                            className="flex-1">
                            {t('reorder')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="secondaryMuted"
                            size="card"
                            className="flex-1">
                            {t('reportProblem')}
                        </Button>
                        <Button
                            asChild
                            variant="secondaryTint"
                            size="card"
                            className="flex-1">
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
