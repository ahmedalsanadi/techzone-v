/**
 * TanStack Query hooks for checkout: init (useQuery), create order (useMutation), payment status (useQuery).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order-service';
import type {
    FulfillmentMethod,
    CheckoutInitResponse,
    CreateOrderRequest,
    PaymentStatusResponse,
} from '@/types/orders';
import { getApiErrorMessage } from '@/lib/api';

export const checkoutInitKey = ['checkout', 'init'] as const;
export const paymentStatusKey = ['payment-status'] as const;

function buildInitQueryKey(
    fulfillment_method: FulfillmentMethod,
    address_id: number | undefined,
): readonly [string, string, FulfillmentMethod, number | undefined] {
    return [...checkoutInitKey, fulfillment_method, address_id];
}

export interface UseCheckoutInitOptions {
    fulfillment_method: FulfillmentMethod;
    address_id: number | undefined;
    enabled: boolean;
}

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
        staleTime: 0, // Always refetch when returning to checkout so summary reflects current cart
        refetchOnMount: 'always', // Refetch every time checkout page is opened
        retry: 1,
    });

    return {
        ...query,
        initData: query.data ?? null,
        initError: query.error
            ? getApiErrorMessage(query.error, 'Checkout failed')
            : null,
    };
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateOrderRequest) =>
            orderService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutInitKey });
        },
    });
}

export function usePaymentStatus(attemptId: string | null) {
    return useQuery({
        queryKey: [...paymentStatusKey, attemptId],
        queryFn: (): Promise<PaymentStatusResponse> =>
            orderService.getPaymentStatus(attemptId!),
        enabled: attemptId != null && attemptId !== '',
        staleTime: 1000 * 60,
        retry: 1,
    });
}
