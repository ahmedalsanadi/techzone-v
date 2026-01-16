/**
 * Authentication-related types
 */

import { Customer } from './customer.types';

/**
 * Authentication step in the auth flow
 */
export type AuthStep = 'phone' | 'otp' | 'signup';

/**
 * Store information returned in auth response
 */
export interface AuthStoreInfo {
    id: number;
    name: string;
    slug: string;
    store_key: string;
    logo_url: string;
}

/**
 * Response from login endpoint (/auth/store/login)
 */
export interface AuthResponse {
    customer: Customer;
    token: string;
    store: AuthStoreInfo;
}

/**
 * Response from send OTP endpoint (/auth/store/send-otp)
 */
export interface SendOtpResponse {
    is_new_user: boolean;
}

/**
 * Profile update request payload
 */
export interface ProfileUpdateRequest {
    first_name: string;
    middle_name?: string | null;
    last_name?: string;
    email?: string;
}
