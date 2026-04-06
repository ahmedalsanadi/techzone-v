import { fetchLiberoFull } from '@/lib/api';
import { Coupon, AppliedCoupon } from '@/types/coupons';

export const couponService = {
    getAvailableCoupons: () =>
        fetchLiberoFull<Coupon[]>('/store/coupons/available', {
            isProtected: true,
            next: { revalidate: 0 },
        }),

    applyCoupon: (code: string) =>
        fetchLiberoFull<{ coupon: AppliedCoupon; discount: number }>('/store/cart/coupons', {
            method: 'POST',
            body: JSON.stringify({ code }),
            isProtected: true,
            next: { revalidate: 0 },
        }),

    validateCoupon: (code: string) =>
        fetchLiberoFull<{ coupon: AppliedCoupon; estimated_discount: number; valid: boolean }>('/store/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code }),
            isProtected: true,
            next: { revalidate: 0 },
        }),

    removeCoupon: (code: string) =>
        fetchLiberoFull<null>(`/store/cart/coupons/${code}`, {
            method: 'DELETE',
            isProtected: true,
            next: { revalidate: 0 },
        }),

    removeAllCoupons: () =>
        fetchLiberoFull<null>('/store/cart/coupons', {
            method: 'DELETE',
            isProtected: true,
            next: { revalidate: 0 },
        }),
};
