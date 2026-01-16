//src/services/auth-service.ts
import { fetchLibero, fetchLiberoFull } from './api';
import type {
    AuthResponse,
    Customer,
    SendOtpResponse,
} from '@/types/auth';

/**
 * Service for customer authentication.
 */
export const authService = {
    /**
     * Send OTP to customer phone.
     * {
     * "success": true,
    "message": "تم إرسال رمز التحقق بنجاح",
    "data": {
        "is_new_user": true
    }
}   
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
     * {
     * "success": true,
    "message": "تم تسجيل الدخول بنجاح",
    "data": {
        "customer": {
            "id": 12,
            "name": "احمد  علي",
            "phone": "0501234561",
            "email": "ahmed2@example.com"
        },
        "token": "1234567890",
        "store": {
            "id": 1,
            "name": "المتجر",
            "slug": "store",
            "logo_url": "https://example.com/logo.png"
        }
    }
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
     * {
    "success": true,
    "message": "تم جلب بيانات العميل بنجاح",
    "data": {
        "id": 12,
        "name": "احمد  علي",
        "phone": "0501234561",
        "email": "ahmed2@example.com"
    }
}
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
            await fetchLiberoFull<null>('/auth/store/logout', {
                method: 'POST',
                isProtected: true,
            });
            // Logout successful - response.data is null, which is expected
            // No need to return anything
        } catch (error: unknown) {
            // Even if logout fails on server, we still want to clear local state
            // This ensures user can logout even if API call fails
            // Only log in dev mode to avoid console noise
            if (process.env.NODE_ENV === 'development') {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(
                    'Logout API call failed, but clearing local state:',
                    errorMessage,
                );
            }
            // Don't rethrow - we want logout to succeed locally even if API fails
        }
    },
};
