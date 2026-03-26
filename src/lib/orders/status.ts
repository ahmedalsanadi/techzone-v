import {
    ORDER_STATUS_NUMBER_MAP,
    type OrderStatus,
} from '@/types/orders/orders.types';

export type OrdersStatusI18nKey =
    | 'waiting'
    | 'waiting_payment'
    | 'paid'
    | 'in_process'
    | 'ready_for_pickup'
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'canceled'
    | 'refunded'
    | 'partially_refunded';

export type OrderStatusKey =
    | 'WAITING_APPROVAL'
    | 'WAITING_PAYMENT'
    | 'PAID'
    | 'IN_PROCESS'
    | 'READY_FOR_PICKUP'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED';

const STATUS_TO_I18N_KEY: Record<OrderStatusKey, OrdersStatusI18nKey> = {
    WAITING_APPROVAL: 'waiting',
    WAITING_PAYMENT: 'waiting_payment',
    PAID: 'paid',
    IN_PROCESS: 'in_process',
    READY_FOR_PICKUP: 'ready_for_pickup',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
};

const DEFAULT_STATUS_KEY: OrderStatusKey = 'WAITING_APPROVAL';

function isOrderStatusKey(value: unknown): value is OrderStatusKey {
    return (
        typeof value === 'string' &&
        (value as string) in STATUS_TO_I18N_KEY
    );
}

export function resolveOrderStatusKey(status: OrderStatus): OrderStatusKey {
    if (typeof status === 'number') {
        const mapped = ORDER_STATUS_NUMBER_MAP[status];
        return isOrderStatusKey(mapped) ? mapped : DEFAULT_STATUS_KEY;
    }
    return isOrderStatusKey(status) ? status : DEFAULT_STATUS_KEY;
}

export function getOrderStatusI18nKey(status: OrderStatus): OrdersStatusI18nKey {
    return STATUS_TO_I18N_KEY[resolveOrderStatusKey(status)];
}

type TranslatorFn = ((key: string) => string) & {
    has?: (key: string) => boolean;
};

export function getOrderStatusPresentation(
    tOrders: TranslatorFn,
    status: OrderStatus,
    statusLabel?: string | null,
): {
    statusKey: OrderStatusKey;
    i18nKey: OrdersStatusI18nKey;
    label: string;
} {
    const statusKey = resolveOrderStatusKey(status);
    const i18nKey = STATUS_TO_I18N_KEY[statusKey];
    const fullKey = `status.${i18nKey}`;

    // next-intl supports `t.has` in newer versions; use it when available for perfect detection.
    const has = typeof tOrders.has === 'function' ? tOrders.has.bind(tOrders) : null;
    const canTranslate = has ? has(fullKey) : true;

    const translated = canTranslate ? tOrders(fullKey) : '';
    const fallback =
        (typeof statusLabel === 'string' && statusLabel.trim()) || statusKey;

    return {
        statusKey,
        i18nKey,
        label: translated || fallback,
    };
}

/** Back-compat wrapper for older call-sites. */
export function getOrderStatusLabel(
    tOrders: TranslatorFn,
    status: OrderStatus,
    statusLabel?: string | null,
): string {
    return getOrderStatusPresentation(tOrders, status, statusLabel).label;
}

