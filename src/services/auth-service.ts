//src/services/auth-service.ts
import { fetchLibero, fetchLiberoFull } from './api';
import { AuthResponse, Customer, SendOtpResponse, ApiResponse } from './types';

/**
 * Service for customer authentication.
 */
export const authService = {
    /**
     * Send OTP to customer phone.
     */
    async sendOtp(phone: string): Promise<SendOtpResponse> {
        const response = await fetchLiberoFull<SendOtpResponse>(
            '/auth/store/send-otp',
            {
                method: 'POST',
                body: JSON.stringify({ phone }),
            },
        );

        // Ensure data exists and has is_new_user
        if (!response.data || typeof response.data.is_new_user !== 'boolean') {
            throw new Error(
                'Invalid response from server: missing is_new_user',
            );
        }

        return response.data;
    },

    /**
     * Login with phone and OTP.
     */
    async login(phone: string, otp: string): Promise<AuthResponse> {
        const response = await fetchLiberoFull<AuthResponse>(
            '/auth/store/login',
            {
                method: 'POST',
                body: JSON.stringify({ phone, otp }),
            },
        );

        // Ensure data exists and has required fields
        if (!response.data || !response.data.customer || !response.data.token) {
            throw new Error(
                'Invalid response from server: missing customer or token',
            );
        }

        return response.data;
    },

    /**
     * Get current customer data.
     */
    getMe: () =>
        fetchLibero<Customer>('/auth/store/me', {
            isProtected: true,
        }),

    /**
     * Logout customer.
     * Note: Logout endpoint returns {success: true, message: "...", data: null}
     * We handle null data gracefully since logout doesn't need to return data.
     */
    async logout(): Promise<void> {
        try {
            const response = await fetchLiberoFull<null>('/auth/store/logout', {
                method: 'POST',
                isProtected: true,
            });
            // Logout successful - response.data is null, which is expected
            // No need to return anything
        } catch (error: any) {
            // Even if logout fails on server, we still want to clear local state
            // This ensures user can logout even if API call fails
            // Only log in dev mode to avoid console noise
            if (process.env.NODE_ENV === 'development') {
                console.warn(
                    'Logout API call failed, but clearing local state:',
                    error?.message || error,
                );
            }
            // Don't rethrow - we want logout to succeed locally even if API fails
        }
    },
};
