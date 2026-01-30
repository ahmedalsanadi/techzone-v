/**
 * Shared address display helpers. Use these everywhere to avoid duplicate formatting logic.
 */

import type { Address } from '@/types/address';

const DEFAULT_LABEL = 'Address';

/**
 * Label for an address (e.g. "Home", "Work"). Handles both label and legacy name.
 */
export function getAddressLabel(address: Address | null | undefined): string {
    if (!address) return DEFAULT_LABEL;
    return address.label || address.name || DEFAULT_LABEL;
}

/**
 * Single-line formatted address for display (street, building, unit, city).
 */
export function formatAddressForDisplay(
    address: Address | null | undefined,
): string {
    if (!address) return '';
    if (address.formatted?.trim()) return address.formatted.trim();
    const parts: string[] = [address.street || ''];
    const building = address.building_number ?? address.building ?? null;
    if (building) parts.push(String(building));
    const unit = address.unit_number ?? address.unit ?? null;
    if (unit) parts.push(String(unit));
    const city = address.city_name ?? '';
    if (city) parts.push(city);
    return parts.filter(Boolean).join(', ');
}

/**
 * Whether to show the "Add New" address button.
 * Guest: only when they have no address (max one). Auth: always.
 */
export function showAddNewAddressButton(
    isAuthenticated: boolean,
    addressCount: number,
): boolean {
    if (isAuthenticated) return true;
    return addressCount === 0;
}
/**
 * Formats a Date object for the "Scheduled Time" display (e.g. "Tomorrow 10:00 AM").
 */
export function formatScheduledTime(date: Date, locale: string = 'ar'): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (locale === 'ar') {
        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${day}/${month}/${year}، ${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return date.toLocaleString();
}
