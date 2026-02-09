/**
 * Unified API error message extraction.
 * Uses ApiError from @/services/api; supports backend shapes:
 * - { success: false, message: string, errors: { [field]: string[] } } (create order, etc.)
 * - { success: false, message: string, errors: null } (init, etc.)
 */

import { ApiError } from '@/services/api';

/**
 * Extract a user-friendly message from an API error.
 * Prefers first field error from errors[field][0], then body message, then ApiError.message.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
    if (!(err instanceof ApiError)) {
        if (err && typeof err === 'object' && 'message' in err) {
            return String((err as { message: unknown }).message);
        }
        return fallback;
    }
    const data = err.data as Record<string, unknown> | undefined;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const errors = data.errors;
        if (errors != null && typeof errors === 'object' && !Array.isArray(errors)) {
            const errMap = errors as Record<string, unknown>;
            const firstKey = Object.keys(errMap)[0];
            const first = firstKey ? errMap[firstKey] : null;
            if (Array.isArray(first) && first[0]) return String(first[0]);
            if (typeof first === 'string') return first;
        }
        if (typeof data.message === 'string') return data.message;
    }
    return err.message || fallback;
}
