export interface Coupon {
    id: number;
    code: string;
    title: string;
    description?: string;
    type: number;
    type_label: string;
    type_icon: string;
    value: number;
    max_discount_amount?: number;
    is_stackable: boolean;
    is_valid: boolean;
    starts_at?: string;
    expires_at?: string;
    scope?: number;
    scope_label?: string;
    priority?: number;
}

export interface AppliedCoupon {
    id: number;
    code: string;
    title: string;
    type: number;
    type_label: string;
    type_icon: string;
    is_stackable: boolean;
    value?: number;
    max_discount_amount?: number;
    scope?: number;
    scope_label?: string;
    priority?: number;
    is_valid?: boolean;
}
