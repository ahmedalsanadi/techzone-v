// src/types/address.ts
export interface Country {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
}

export interface District {
    id: number;
    name: string;
}

export interface Address {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    country_id: number;
    city_id: number;
    district_id: number | null;
    street: string;
    building?: string | null;
    building_number?: string | null;
    unit?: string | null;
    unit_number?: string | null;
    postal_code?: string | null;
    additional_number?: string | null;
    description?: string | null;
    notes?: string | null;
    is_default: boolean;
    latitude: string | number;
    longitude: string | number;
    // For convenience in UI
    country_name?: string;
    city_name?: string;
    district_name?: string;
    // Seen in some API responses
    country?: string;
    city?: string;
    district?: string;
    formatted?: string;
    name?: string;
    isDefault?: boolean;
}

export interface CreateAddressRequest {
    label: string;
    recipient_name?: string;
    phone: string;
    country_id: number;
    city_id: number;
    district_id?: number;
    street: string;
    latitude: number;
    longitude: number;
    building?: string;
    unit?: string;
    postal_code?: string;
    additional_number?: string;
    description?: string;
    is_default?: boolean;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

/**
 * Form-level payload from AddressModal (may include display-only fields).
 * Use toCreateAddressRequest / toUpdateAddressRequest before sending to API.
 */
export interface AddressFormSubmitPayload {
    label: string;
    recipient_name?: string;
    phone: string;
    country_id: number;
    city_id: number;
    district_id?: number | null;
    street: string;
    latitude: number;
    longitude: number;
    building?: string;
    unit?: string;
    postal_code?: string;
    additional_number?: string;
    description?: string;
    is_default?: boolean;
    // Display-only (dropped before API)
    name?: string;
    formatted?: string;
    building_number?: string;
    unit_number?: string;
    notes?: string;
}

/**
 * Normalize form payload to API CreateAddressRequest (snake_case, district_id as number | undefined).
 */
export function toCreateAddressRequest(
    payload: AddressFormSubmitPayload,
): CreateAddressRequest {
    return {
        label: payload.label,
        recipient_name: payload.recipient_name || undefined,
        phone: payload.phone,
        country_id: payload.country_id,
        city_id: payload.city_id,
        district_id:
            payload.district_id != null
                ? Number(payload.district_id)
                : undefined,
        street: payload.street,
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        building: payload.building || undefined,
        unit: payload.unit || undefined,
        postal_code: payload.postal_code || undefined,
        additional_number: payload.additional_number || undefined,
        description: payload.description || undefined,
        is_default: payload.is_default,
    };
}

/**
 * Normalize form payload to API UpdateAddressRequest (partial, drop display-only fields).
 */
export function toUpdateAddressRequest(
    payload: AddressFormSubmitPayload,
): UpdateAddressRequest {
    const base = toCreateAddressRequest(payload);
    const result: UpdateAddressRequest = { ...base };
    return result;
}
