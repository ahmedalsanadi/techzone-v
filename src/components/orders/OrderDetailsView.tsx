// src/app/[locale]/my-orders/utils/components/OrderDetailsView.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, X, RotateCcw, Info, Loader2 } from 'lucide-react';
import SubHeaderManager from '@/components/layouts/SubHeaderManager';
import { Button } from '@/components/ui/Button';
import { Link, useRouter } from '@/i18n/navigation';
import {
    Order,
    OrderStatus,
    OrderStatusUpdate,
    ORDER_STATUS_NUMBER_MAP,
} from '@/types/orders/orders.types';
import { OrderCourierCard } from './OrderCourierCard';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderSummaryCard } from './OrderSummaryCard';
import { OrderProductsCard } from './OrderProductsCard';
import { useCartActions } from '@/hooks/cart';
import { useCartStore } from '@/store/useCartStore';
import { orderService } from '@/services/order-service';
import { cartService } from '@/services/cart-service';
import { toast } from 'sonner';
import ConfirmModal from '@/components/modals/ConfirmModal';
import dynamic from 'next/dynamic';

const LiveTrackingMap = dynamic(() => import('./LiveTrackingMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-80 bg-gray-100 animate-pulse rounded-3xl" />
    ),
});

interface OrderDetailsViewProps {
    order: Order;
}

export default function OrderDetailsView({
    order: initialOrder,
}: OrderDetailsViewProps) {
    const t = useTranslations('Orders');
    const [order, setOrder] = useState<Order>(initialOrder);
    const { addToCart } = useCartActions();
    const router = useRouter();

    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const handleReorder = async () => {
        setIsReordering(true);
        try {
            if (!order.items || order.items.length === 0) return;

            const syncWithAPI = useCartStore.getState().syncWithAPI;
            const isGuestMode = useCartStore.getState().isGuestMode;
            const addItemToStore = useCartStore.getState().addItem;

            // Add all items to cart
            for (const item of order.items) {
                const apiRequest = {
                    product_id: item.product_id,
                    product_variant_id: item.product_variant_id || undefined,
                    quantity: item.quantity,
                    notes: item.notes || '',
                    addons:
                        item.addons?.map((a) => ({
                            addon_item_id: a.addon_item_id,
                            quantity: a.quantity || 1,
                        })) || [],
                };

                if (!isGuestMode) {
                    await cartService.addItem(apiRequest);
                } else {
                    // Guest mode: reconstruct CartItem for local store
                    addItemToStore(
                        {
                            id: `reorder-${item.id}`,
                            name: item.product_title,
                            image: item.product_image || '',
                            price: item.sale_unit_price || item.unit_price,
                            categoryId: String(item.product_id),
                            metadata: {
                                productId: item.product_id,
                                product_variant_id: item.product_variant_id,
                                addons: item.addons?.reduce(
                                    (
                                        acc: [Record<number, number>],
                                        addon: {
                                            addon_item_id: number;
                                            quantity?: number;
                                        },
                                    ) => {
                                        if (!acc[0]) acc[0] = {};
                                        acc[0][addon.addon_item_id] =
                                            addon.quantity || 1;
                                        return acc;
                                    },
                                    [{}] as [Record<number, number>],
                                ),
                                notes: item.notes ?? undefined,
                            },
                        },
                        item.quantity,
                    );
                }
            }

            if (!isGuestMode) {
                await syncWithAPI();
            }

            toast.success(t('actions.reorderSuccess'), {
                description: t('navigation.viewCart'),
                action: {
                    label: t('navigation.viewCart') || 'View Cart',
                    onClick: () => router.push('/cart'),
                },
            });
            router.push('/cart');
        } catch (error) {
            console.error('Reorder failed:', error);
            toast.error(t('actions.reorderError'));
        } finally {
            setIsReordering(false);
        }
    };

    const handleCancelOrder = async () => {
        setIsCancelling(true);
        try {
            const data = await orderService.cancelOrder(order.id);
            toast.success(t('actions.cancelSuccess'));
            // Update local state status
            setOrder({
                ...order,
                status: 8,
                status_label: data.status_label || t('status.canceled'),
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : t('actions.cancelError');
            toast.error(message);
        } finally {
            setIsCancelling(false);
            setShowCancelModal(false);
        }
    };

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const currentStatusKey = (
        typeof order.status === 'number'
            ? ORDER_STATUS_NUMBER_MAP[order.status] || 'WAITING_APPROVAL'
            : order.status
    ) as OrderStatus;

    // Timeline steps matching backend flow (1–7). Terminal states 8–10 use first N steps or single state.
    const timelineProgressSteps: OrderStatus[] = [
        'WAITING_APPROVAL',
        'WAITING_PAYMENT',
        'PAID',
        'IN_PROCESS',
        'READY_FOR_PICKUP',
        'SHIPPED',
        'DELIVERED',
    ];
    const timelineLabels: Record<string, string> = {
        WAITING_APPROVAL: t('status.waiting'),
        WAITING_PAYMENT: t('status.waiting_payment'),
        PAID: t('status.paid'),
        IN_PROCESS: t('status.in_process'),
        READY_FOR_PICKUP: t('status.ready_for_pickup'),
        SHIPPED: t('status.shipped'),
        DELIVERED: t('status.delivered'),
    };

    const getTimeline = (): OrderStatusUpdate[] => {
        if (order.timeline && order.timeline.length > 0) return order.timeline;

        const isTerminal =
            currentStatusKey === 'CANCELED' ||
            currentStatusKey === 'REFUNDED' ||
            currentStatusKey === 'PARTIALLY_REFUNDED';
        const currentIndex = timelineProgressSteps.indexOf(currentStatusKey);

        if (isTerminal) {
            const terminalLabel =
                order.status_label ||
                (currentStatusKey === 'CANCELED'
                    ? t('status.canceled')
                    : currentStatusKey === 'REFUNDED'
                      ? t('status.refunded')
                      : t('status.partially_refunded'));
            return [
                {
                    status: currentStatusKey as string,
                    label: terminalLabel,
                    completed: true,
                    active: true,
                    timestamp: mounted
                        ? new Date(order.updated_at).toLocaleTimeString(
                              'ar-SA',
                              { hour: '2-digit', minute: '2-digit' },
                          )
                        : undefined,
                },
            ];
        }

        return timelineProgressSteps.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isActive = currentStatusKey === status;
            const timestamp =
                isActive && mounted
                    ? new Date(order.updated_at).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                    : undefined;
            return {
                status: status as string,
                label: String(timelineLabels[status] ?? status),
                completed: isCompleted,
                active: isActive,
                timestamp,
            };
        });
    };

    const isCancelable =
        currentStatusKey === 'WAITING_APPROVAL' ||
        currentStatusKey === 'WAITING_PAYMENT';

    return (
        <div className="space-y-6 py-2">
            <SubHeaderManager show={false} />

            <div className="flex justify-start">
                <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                    <Link
                        href="/"
                        className="hover:text-primary transition-colors">
                        {t('navigation.home')}
                    </Link>
                    <span className="text-[10px] opacity-50">•</span>
                    <Link
                        href="/my-orders"
                        className="hover:text-primary transition-colors">
                        {t('navigation.myOrders')}
                    </Link>
                    <span className="text-[10px] opacity-50">•</span>
                    <span className="text-gray-900 font-bold">
                        {t('orderNumber', { number: order.id })}
                    </span>
                </nav>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div className="flex items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        {t('orderNumberTitle', { number: order.id })}
                    </h1>
                </div>

                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <Link href={`/my-orders/${order.id}/report-problem`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto">
                            <Info className="w-4 h-4" />
                            <span className="truncate">
                                {t('actions.reportProblem')}
                            </span>
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto">
                        <Star className="w-4 h-4" />
                        <span className="truncate">
                            {t('actions.rateOrder')}
                        </span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto"
                        onClick={handleReorder}
                        disabled={isReordering}>
                        {isReordering ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        <span className="truncate">{t('actions.reorder')}</span>
                    </Button>
                    {isCancelable && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={() => setShowCancelModal(true)}
                            disabled={isCancelling}>
                            {isCancelling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                            <span className="truncate">
                                {t('actions.cancelOrder')}
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="flex flex-col gap-6 col-span-1 md:col-span-7">
                    <OrderSummaryCard order={order} />
                    <OrderProductsCard items={order.items || []} />
                </div>
                <div className="flex flex-col gap-6 col-span-1 md:col-span-5">
                    {currentStatusKey === 'SHIPPED' && (
                        <>
                            <OrderCourierCard />
                            <LiveTrackingMap
                                courierCoords={[24.7136, 46.6753]} // Mock Riyadh coords
                                destinationCoords={[24.7236, 46.6853]}
                            />
                        </>
                    )}
                    <OrderStatusTimeline timeline={getTimeline()} />
                </div>
            </div>

            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelOrder}
                title={t('actions.cancelConfirmTitle')}
                message={t('actions.cancelConfirmMessage')}
                confirmLabel={t('actions.confirm')}
                cancelLabel={t('actions.back')}
                variant="danger"
                isLoading={isCancelling}
            />
        </div>
    );
}
