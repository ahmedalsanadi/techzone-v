//src/services/auth-service.ts
import { fetchLibero, fetchLiberoFull } from '@/lib/api';
import type {
    AuthResponse,
    Customer,
    SendOtpResponse,
    ResendOtpResponse,
} from '@/types/auth';

/**
 * Service for customer authentication.
 */
export const authService = {
    /**
     * Send OTP to customer phone.
     * Response: {
     *   "success": true,
     *   "message": "تم إرسال رمز التحقق بنجاح",
     *   "data": {
     *     "is_new_user": false,
     *     "temp_token": "hBByX8Ixp4FIzLGY3mgSbAQMkwMV19Fmr9kVABLi9KFykY5MV7kF6H1JkTufefPX",
     *     "masked_phone": "05******67",
     *     "expires_in": 300
     *   }
     * }
     */
    async sendOtp(phone: string): Promise<SendOtpResponse> {
        const response = await fetchLiberoFull<SendOtpResponse>(
            '/auth/store/send-otp',
            {
                method: 'POST',
                body: JSON.stringify({ phone }),
            },
        );

        // Ensure data exists and has required fields
        if (!response.data || typeof response.data.is_new_user !== 'boolean') {
            throw new Error(
                'Invalid response from server: missing is_new_user',
            );
        }

        if (!response.data.temp_token || !response.data.masked_phone) {
            throw new Error(
                'Invalid response from server: missing temp_token or masked_phone',
            );
        }

        return response.data;
    },

    /**
     * Resend OTP using temp_token.
     * Response: {
     *   "success": true,
     *   "message": "تم إرسال رمز التحقق بنجاح",
     *   "data": {
     *     "masked_phone": "05******67"
     *   }
     * }
     */
    async resendOtp(tempToken: string): Promise<ResendOtpResponse> {
        const response = await fetchLiberoFull<ResendOtpResponse>(
            '/auth/store/resend-otp',
            {
                method: 'POST',
                body: JSON.stringify({ temp_token: tempToken }),
            },
        );

        // Ensure data exists and has masked_phone
        if (!response.data || !response.data.masked_phone) {
            throw new Error(
                'Invalid response from server: missing masked_phone',
            );
        }

        return response.data;
    },

    /**
     * Login with temp_token and OTP.
     * Request body: {
     *   "phone": "0501234567",
     *   "otp": "0000",
     *   "temp_token": "{{temp_token}}"
     * }
     * Response: {
     *   "success": true,
     *   "message": "تم تسجيل الدخول بنجاح",
     *   "data": {
     *     "customer": { ... },
     *     "token": "...",
     *     "store": { ... }
     *   }
     * }
     */
    async login(phone: string, otp: string, tempToken: string): Promise<AuthResponse> {
        const response = await fetchLiberoFull<AuthResponse>(
            '/auth/store/login',
            {
                method: 'POST',
                body: JSON.stringify({ phone, otp, temp_token: tempToken }),
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
