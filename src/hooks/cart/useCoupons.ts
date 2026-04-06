import { useQuery, useMutation } from '@tanstack/react-query';
import { couponService } from '@/services/coupon-service';

export const couponsKeys = {
    all: ['coupons'] as const,
    available: () => [...couponsKeys.all, 'available'] as const,
};

export function useAvailableCoupons(enabled = true) {
    return useQuery({
        queryKey: couponsKeys.available(),
        queryFn: () => couponService.getAvailableCoupons(),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}

export function useApplyCoupon() {
    return useMutation({
        mutationFn: (code: string) => couponService.applyCoupon(code),
    });
}

export function useValidateCoupon() {
    return useMutation({
        mutationFn: (code: string) => couponService.validateCoupon(code),
    });
}

export function useRemoveCoupon() {
    return useMutation({
        mutationFn: (code: string) => couponService.removeCoupon(code),
    });
}

export function useRemoveAllCoupons() {
    return useMutation({
        mutationFn: () => couponService.removeAllCoupons(),
    });
}
