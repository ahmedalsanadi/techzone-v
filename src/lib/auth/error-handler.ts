/**
 * Error handling utilities for authentication flow
 */

import { ApiError } from '@/lib/api';

export interface ErrorHandlerOptions {
    defaultMessage: string;
    translations?: {
        tooManyRequests?: string;
        networkError?: string;
        unauthorizedError?: string;
    };
}

/**
 * Extract user-friendly error message from API errors
 */
export function getAuthErrorMessage(
    error: unknown,
    options: ErrorHandlerOptions,
): string {
    const { defaultMessage, translations = {} } = options;

    if (error instanceof ApiError) {
        // Use error message from API if available
        if (error.message) {
            return error.message;
        }

        // Handle specific status codes
        if (error.status === 429) {
            return (
                translations.tooManyRequests ||
                'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.'
            );
        }

        if (error.status === 504 || error.name === 'AbortError') {
            return (
                translations.networkError ||
                'خطأ في الاتصال. يرجى المحاولة مرة أخرى'
            );
        }

        if (error.status === 401 || error.status === 403) {
            return (
                translations.unauthorizedError ||
                'غير مصرح. يرجى المحاولة مرة أخرى'
            );
        }
    }

    // Fallback to default message
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return defaultMessage;
}
