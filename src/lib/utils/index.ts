import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isValidColor(color: string): boolean {
    return (
        /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) ||
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)
    );
}

export function formatCurrency(amount: number, locale: string = 'ar') {
    return `${amount.toFixed(2)} ${locale === 'ar' ? '﷼' : 'SAR'}`;
}

export function formatMoneyAmount(amount: number, locale: string = 'ar') {
    const safe = Number.isFinite(amount) ? amount : 0;
    // IMPORTANT: Always render Latin digits (English numbers) even in Arabic UI.
    // Currency label/symbol is handled separately by `CurrencySymbol`.
    void locale;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(safe);
}

export { normalizeRedirectPath } from './redirect';
