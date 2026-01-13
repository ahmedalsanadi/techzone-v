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
        const response = await fetchLiberoFull<SendOtpResponse>('/auth/store/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        });
        
        // Ensure data exists and has is_new_user
        if (!response.data || typeof response.data.is_new_user !== 'boolean') {
            throw new Error('Invalid response from server: missing is_new_user');
        }
        
        return response.data;
    },

    /**
     * Login with phone and OTP.
     */
    async login(phone: string, otp: string): Promise<AuthResponse> {
        const response = await fetchLiberoFull<AuthResponse>('/auth/store/login', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
        });
        
        // Ensure data exists and has required fields
        if (!response.data || !response.data.customer || !response.data.token) {
            throw new Error('Invalid response from server: missing customer or token');
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
     */
    async logout(): Promise<void> {
        try {
            await fetchLiberoFull<null>('/auth/store/logout', {
                method: 'POST',
                isProtected: true,
            });
        } catch (error) {
            // Even if logout fails on server, clear local state
            console.warn('Logout API call failed, but clearing local state:', error);
        }
    },
};
