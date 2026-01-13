//src/services/auth-service.ts
import { fetchLibero, fetchLiberoFull } from './api';
import { AuthResponse, Customer, SendOtpResponse } from './types';

/**
 * Service for customer authentication.
 */
export const authService = {
    /**
     * Send OTP to customer phone.
     */
    sendOtp: (phone: string) =>
        fetchLibero<SendOtpResponse>('/auth/store/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        }),

    /**
     * Login with phone and OTP.
     */
    login: (phone: string, otp: string) =>
        fetchLibero<AuthResponse>('/auth/store/login', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
        }),

    /**
     * Get current customer data.
     */
    getMe: () =>
        fetchLibero<Customer>('/auth/store/me', {
            isProtected: true,
        }),

    /**
     * Logout customer.
     */
    logout: () =>
        fetchLiberoFull<null>('/auth/store/logout', {
            method: 'POST',
            isProtected: true,
        }),
};
