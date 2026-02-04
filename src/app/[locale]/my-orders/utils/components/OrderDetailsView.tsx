// src/app/[locale]/my-orders/utils/components/OrderDetailsView.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, X, RotateCcw, Info, Loader2 } from 'lucide-react';
import SubHeaderManager from '@/components/layouts/SubHeaderManager';
import { Button } from '@/components/ui/Button';
import { Link, useRouter } from '@/i18n/navigation';
import { Order, OrderStatus, OrderStatusUpdate } from '@/types/orders';
import { OrderCourierCard } from './OrderCourierCard';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderSummaryCard } from './OrderSummaryCard';
import { OrderProductsCard } from './OrderProductsCard';
import { useCartActions } from '@/hooks/useCartActions';
import { orderService } from '@/services/order-service';
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

            // Add all items to cart
            for (const item of order.items) {
                await addToCart(
                    {
                        id: `reorder-${item.id}`,
                        name: item.product_title,
                        image: item.product_image || '',
                        price: item.sale_unit_price || item.unit_price,
                        categoryId: String(item.product_id), // Placeholder
                        metadata: {
                            productId: item.product_id,
                            product_variant_id: item.product_variant_id,
                            addons: item.addons?.reduce(
                                (acc: any, addon: any) => {
                                    // Reorder logic might need more complex addon mapping
                                    // but usually we just pass what the cart needs
                                    if (!acc[0]) acc[0] = {};
                                    acc[0][addon.id] = 1; // Default qty 1 for addons
                                    return acc;
                                },
                                {},
                            ),
                            notes: item.notes,
                        },
                    },
                    item.quantity,
                );
            }
            toast.success(t('actions.reorderSuccess'));
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
                status: 'CANCELLED' as OrderStatus,
                status_label: data.status_label || 'ملغى',
            });
        } catch (error: any) {
            toast.error(error.message || t('actions.cancelError'));
        } finally {
            setIsCancelling(false);
            setShowCancelModal(false);
        }
    };

    // Derived timeline if not provided by API
    const getTimeline = (): OrderStatusUpdate[] => {
        if (order.timeline && order.timeline.length > 0) return order.timeline;

        const statuses: OrderStatus[] = [
            'WAITING_APPROVAL',
            'PREPARING',
            'READY',
            'ON_THE_WAY',
            'DELIVERED',
        ];

        const currentIndex = statuses.indexOf(order.status);

        return statuses.map((status, index) => {
            const isCompleted =
                index < currentIndex ||
                order.status === 'COMPLETED' ||
                (order.status === 'DELIVERED' && index <= currentIndex);
            const isActive = order.status === status;

            // Map status to labels (simplified)
            const labels: Record<string, string> = {
                WAITING_APPROVAL: t('status.waiting'),
                PREPARING: t('status.preparing'),
                READY: t('status.timelineReady') || 'جاهز للاستلام',
                ON_THE_WAY: t('status.with_courier'),
                DELIVERED: t('status.delivered'),
            };

            return {
                status,
                label: labels[status] || status,
                completed: isCompleted,
                active: isActive,
                timestamp: isActive
                    ? new Date(order.updated_at).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                    : undefined,
            };
        });
    };

    const isCancelable =
        order.status === 'WAITING_APPROVAL' ||
        order.status === 'WAITING_PAYMENT';

    return (
        <section className="min-h-screen pb-16 pt-6 px-1 md:px-4 space-y-6">
            <SubHeaderManager show={false} />

            <div className="flex justify-start mb-6">
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
                    {order.status === 'ON_THE_WAY' && (
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
        </section>
    );
}
