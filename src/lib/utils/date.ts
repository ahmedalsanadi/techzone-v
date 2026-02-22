/**
 * Shared order date/time formatting (en-US, consistent across order views).
 */

const EN_US = 'en-US' as const;

function parseDate(isoString: string | null | undefined): Date | null {
    if (isoString == null || isoString === '') return null;
    try {
        const date = new Date(isoString);
        return Number.isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

/** Format as "Feb 14, 2026, 8:30 PM" (date + time). */
export function formatOrderDateTime(isoString: string | null | undefined): string {
    const date = parseDate(isoString);
    if (!date) return isoString ?? '';
    return date.toLocaleString(EN_US, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

/** Format date only: "Feb 14, 2026". */
export function formatOrderDate(isoString: string | null | undefined): string {
    const date = parseDate(isoString);
    if (!date) return isoString ?? '';
    return date.toLocaleDateString(EN_US, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/** Format time only: "8:30 PM". */
export function formatOrderTime(isoString: string | null | undefined): string {
    const date = parseDate(isoString);
    if (!date) return isoString ?? '';
    return date.toLocaleTimeString(EN_US, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/** Date and time as separate strings (e.g. for card layout). */
export function formatOrderDateAndTime(isoString: string | null | undefined): {
    date: string;
    time: string;
} {
    const date = parseDate(isoString);
    if (!date) return { date: '', time: '' };
    return {
        date: date.toLocaleDateString(EN_US, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }),
        time: date.toLocaleTimeString(EN_US, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }),
    };
}
