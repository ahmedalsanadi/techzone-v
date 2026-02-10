/**
 * Checkout flow: date/fulfillment helpers, payload building, summary, result parsing.
 */

import {
    FulfillmentMethod,
    type PaymentMethodType,
    type CheckoutInitResponse,
    type CheckoutInitSummary,
    type CreateOrderRequest,
    type PaymentMethod,
} from '@/types/orders/orders.types';

export type OrderType = 'delivery' | 'pickup' | 'dineIn' | 'carPickup' | null;

const FULFILLMENT_MAP: Record<NonNullable<OrderType>, FulfillmentMethod> = {
    delivery: FulfillmentMethod.DELIVERY,
    pickup: FulfillmentMethod.PICKUP,
    carPickup: FulfillmentMethod.CURBSIDE,
    dineIn: FulfillmentMethod.DINE_IN,
};

export function orderTypeToFulfillment(orderType: OrderType): FulfillmentMethod {
    return (orderType && FULFILLMENT_MAP[orderType]) ?? FulfillmentMethod.DELIVERY;
}

/** API expects "YYYY-MM-DD HH:mm:ss" for customer_pickup_datetime. */
export function formatDateTimeForApi(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

/** For "now" pickup/curbside/dine-in: use now + 30 min as earliest pickup time. */
export function earliestPickupDate(): Date {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d;
}

export function getDefaultPaymentSelection(
    data: CheckoutInitResponse | null,
): { type: PaymentMethodType | null; epaymentMethodId: number | null } {
    if (!data?.payment_methods?.length) {
        return { type: null, epaymentMethodId: null };
    }
    const firstNonWallet = data.payment_methods.find(
        (m) => m.type !== 'wallet' && m.available,
    );
    const type = (firstNonWallet?.type ?? null) as PaymentMethodType | null;
    let epaymentMethodId: number | null = null;
    if (type === 'epayment') {
        const first = data.payment_methods
            .find((m) => m.type === 'epayment')
            ?.epayment_methods?.[0];
        epaymentMethodId = first?.id ?? null;
    }
    return { type, epaymentMethodId };
}

export interface BuildPayloadInput {
    fulfillment_method: FulfillmentMethod;
    address_id: number | undefined;
    customer_pickup_datetime: string | undefined;
    payment_method: CreateOrderRequest['payment_method'];
    epayment_method_id?: number;
    use_wallet: boolean;
    locale: string;
}

export function buildCreateOrderPayload(input: BuildPayloadInput): CreateOrderRequest {
    const {
        fulfillment_method,
        address_id,
        customer_pickup_datetime,
        payment_method,
        epayment_method_id,
        use_wallet,
        locale,
    } = input;

    const payload: CreateOrderRequest = {
        fulfillment_method,
        address_id,
        customer_pickup_datetime: customer_pickup_datetime ?? undefined,
        notes: '',
        payment_method,
    };

    if (use_wallet) payload.use_wallet = true;
    if (payment_method === 'epayment' && epayment_method_id != null) {
        payload.epayment_method_id = epayment_method_id;
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        payload.success_url = `${base}/${locale}/checkout/result?status=success`;
        payload.error_url = `${base}/${locale}/checkout/result?status=error`;
    }

    return payload;
}

export interface SummaryItem {
    label: string;
    value: string;
    isNegative?: boolean;
}

export interface BuildSummaryItemsInput {
    summary: CheckoutInitSummary | null | undefined;
    discount: number;
    walletDeduction: number;
    useWallet: boolean;
    formatCurrency: (amount: number, locale: string) => string;
    t: (key: string) => string;
    locale: string;
}

export function buildSummaryItems(input: BuildSummaryItemsInput): SummaryItem[] {
    const {
        summary,
        discount,
        walletDeduction,
        useWallet,
        formatCurrency,
        t,
        locale,
    } = input;

    const items: SummaryItem[] = [];
    if (summary) {
        items.push(
            { label: t('orderSubtotal'), value: formatCurrency(summary.items_subtotal, locale) },
            { label: t('deliveryFee'), value: formatCurrency(summary.shipping_fee, locale) },
        );
        if (summary.cod_fee != null && summary.cod_fee > 0) {
            items.push({
                label: t('codFee') || 'COD Fee',
                value: formatCurrency(summary.cod_fee, locale),
            });
        }
        if (summary.tax_amount != null && summary.tax_amount > 0) {
            items.push({
                label: t('tax') || 'Tax',
                value: formatCurrency(summary.tax_amount, locale),
            });
        }
    }
    if (discount > 0) {
        items.push({ label: t('discount'), value: formatCurrency(discount, locale) });
    }
    if (useWallet && walletDeduction > 0) {
        items.push({
            label: t('walletDeduction'),
            value: `- ${formatCurrency(walletDeduction, locale)}`,
            isNegative: true,
        });
    }
    return items;
}

export function isEpaymentValid(
    methods: PaymentMethod[],
    selectedEpaymentMethodId: number | null,
): boolean {
    if (!selectedEpaymentMethodId) return false;
    return methods
        .find((m) => m.type === 'epayment')
        ?.epayment_methods?.some((e) => e.id === selectedEpaymentMethodId) ?? false;
}

const PAYMENT_STATUS_PAID = 4;

export interface PaymentResultState {
    orderId: number | null;
    isSuccess: boolean;
    isFailed: boolean;
    message: string;
    isLoading: boolean;
}

export interface ParsePaymentResultInput {
    attemptId: string | null;
    statusParam: string | null;
    orderIdParam: string | null;
    paymentData: { status: number; status_label: string; order_id?: number } | undefined;
    isLoading: boolean;
    isError: boolean;
    t: (key: string) => string;
}

export function parsePaymentResult(input: ParsePaymentResultInput): PaymentResultState {
    const {
        attemptId,
        statusParam,
        orderIdParam,
        paymentData,
        isLoading,
        isError,
        t,
    } = input;

    const orderIdFromUrlParsed =
        orderIdParam && statusParam === 'success' ? parseInt(orderIdParam, 10) : NaN;
    const orderIdFromUrl = Number.isInteger(orderIdFromUrlParsed)
        ? orderIdFromUrlParsed
        : null;
    const orderId =
        orderIdFromUrl ??
        (paymentData?.status === PAYMENT_STATUS_PAID && paymentData?.order_id
            ? paymentData.order_id
            : null);
    const isSuccess: boolean =
        orderIdFromUrl != null ||
        (paymentData?.status === PAYMENT_STATUS_PAID && !!paymentData?.order_id);

    const noAttemptAndNoSuccess =
        !attemptId && !(orderIdParam && statusParam === 'success');
    const isFailed: boolean =
        noAttemptAndNoSuccess ||
        (!!attemptId &&
            !isLoading &&
            (isError || !paymentData || paymentData.status !== PAYMENT_STATUS_PAID));

    let message = '';
    if (isFailed) {
        if (paymentData && paymentData.status !== PAYMENT_STATUS_PAID) {
            message = paymentData.status_label;
        } else if (statusParam === 'error') {
            message = String(t('paymentFailed') || 'Payment failed');
        } else {
            message = String(t('checkoutFailed'));
        }
    }

    return {
        orderId,
        isSuccess,
        isFailed,
        message,
        isLoading: Boolean(isLoading),
    };
}
