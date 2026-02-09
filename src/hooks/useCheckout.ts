/**
 * TanStack Query hooks for checkout: init (useQuery) and create order (useMutation).
 */

import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { orderService } from '@/services/order-service';
import {
    FulfillmentMethod,
    CheckoutInitResponse,
    CreateOrderRequest,
    PaymentMethodType,
    PaymentStatusResponse,
} from '@/types/orders';
import { ApiError } from '@/services/api';

/** Query key factory for checkout init (used for invalidation). */
export const checkoutInitKey = ['checkout', 'init'] as const;

function buildInitQueryKey(
    fulfillment_method: FulfillmentMethod,
    address_id: number | undefined,
): readonly [string, string, FulfillmentMethod, number | undefined] {
    return [...checkoutInitKey, fulfillment_method, address_id];
}

/** Extract user-friendly message from API error (e.g. Laravel 422 errors object). */
export function getCheckoutInitErrorMessage(
    err: unknown,
    fallback: string,
): string {
    if (!(err instanceof ApiError)) return fallback;
    const data = err.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const d = data as Record<string, unknown>;
        if (d.errors && typeof d.errors === 'object') {
            const errors = d.errors as Record<string, unknown>;
            const firstKey = Object.keys(errors)[0];
            const first = firstKey ? errors[firstKey] : null;
            if (Array.isArray(first) && first[0]) return String(first[0]);
            if (typeof first === 'string') return first;
        }
        if (typeof d.message === 'string') return d.message;
    }
    return err.message || fallback;
}

export interface UseCheckoutInitOptions {
    fulfillment_method: FulfillmentMethod;
    address_id: number | undefined;
    enabled: boolean;
}

/**
 * Fetches checkout init (payment methods, summary, cart validation).
 * Refetches automatically when fulfillment_method or address_id changes.
 */
export function useCheckoutInit({
    fulfillment_method,
    address_id,
    enabled,
}: UseCheckoutInitOptions) {
    const queryKey = buildInitQueryKey(fulfillment_method, address_id);

    const query = useQuery({
        queryKey,
        queryFn: async (): Promise<CheckoutInitResponse> => {
            const body: { fulfillment_method: FulfillmentMethod; address_id?: number } = {
                fulfillment_method,
            };
            if (address_id != null) body.address_id = address_id;
            return orderService.checkoutInit(body);
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes — avoid refetch on focus when user just switched tab
        retry: 1,
    });

    return {
        ...query,
        initData: query.data ?? null,
        initError: query.error
            ? getCheckoutInitErrorMessage(query.error, 'Checkout failed')
            : null,
    };
}

/**
 * Picks default payment method type and epayment id from init response.
 * Call once when init data first loads to seed local state.
 */
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

/**
 * Creates an order (checkout submit). On success you can redirect or invalidate queries.
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload: CreateOrderRequest) =>
            orderService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutInitKey });
        },
    });

    return mutation;
}

/** Query key for payment status (for invalidation if ever needed). */
export const paymentStatusKey = ['payment-status'] as const;

/**
 * Fetches payment status after return from gateway (epayment).
 * Status: 1=initiated, 2=pending, 3=failed, 4=paid, 5=cancelled, 6=expired.
 */
export function usePaymentStatus(attemptId: string | null) {
    return useQuery({
        queryKey: [...paymentStatusKey, attemptId],
        queryFn: (): Promise<PaymentStatusResponse> =>
            orderService.getPaymentStatus(attemptId!),
        enabled: attemptId != null && attemptId !== '',
        staleTime: 1000 * 60, // 1 min — result is final
        retry: 1,
    });
}
