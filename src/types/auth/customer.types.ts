/**
 * Customer-related types for authentication
 */

/**
 * Customer data returned by login endpoint
 * Note: is_profile_complete is NOT returned by login endpoint
 * Use CustomerProfile.is_profile_complete for profile completion status
 */
export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
}

/**
 * Full customer profile with complete information
 * Returned by /store/profile endpoint
 */
export interface CustomerProfile {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    phone: string;
    email: string;
    is_profile_complete: boolean;
    is_phone_verified: boolean;
    is_email_verified: boolean;
    points: number;
    total_orders: number;
    total_spent: number;
    address: string | null;
    last_login_at: string;
    created_at: string;
}
