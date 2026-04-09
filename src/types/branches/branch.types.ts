/**
 * Branch-related type definitions
 */

import type { BranchWorkingHours } from './working-hours.types';

/**
 * Support channel for branch (phone, email, whatsapp, etc.)
 */
export interface BranchSupportChannel {
    type: string;
    title: string;
    value: string;
    status: boolean;
}

/**
 * Branch address information
 */
export interface BranchAddress {
    id: number;
    street: string;
    building: string;
    unit: string | null;
    floor: string | null;
    postal_code: string | null;
    description: string;
    latitude: number | null;
    longitude: number | null;
    formatted: string;
}

/**
 * Branch services configuration
 */
export interface BranchServices {
    shipping_enabled: boolean;
    pickup_enabled: boolean;
    dine_in_enabled: boolean;
    online_payment_enabled: boolean;
    cash_on_delivery_enabled: boolean;
    order_scheduling_enabled: boolean;
}

/**
 * Branch settings configuration
 */
export interface BranchSettings {
    preparation_time: number;
    tax_percentage: number;
    cash_on_delivery_fee: number;
    dine_in_session_duration: number;
    auto_accept_orders: boolean;
}

/**
 * Complete branch information returned by API
 */
export interface Branch {
    id: number;
    name: string;
    type: number;
    type_label: string;
    description: string;
    image_url: string | null;
    status: number;
    status_label: string;
    support_channels: BranchSupportChannel[] | null;
    address: BranchAddress;
    working_hours: BranchWorkingHours | null;
    services: BranchServices;
    settings: BranchSettings;
    distance?: number; // Optional distance from user (calculated client-side)
    is_open?: boolean; // Calculated status based on working hours
}
