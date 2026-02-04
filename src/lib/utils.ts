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
    // Standardizing on SAR for this project
    return `${amount.toFixed(2)} ${locale === 'ar' ? '﷼' : 'SAR'}`;
}
