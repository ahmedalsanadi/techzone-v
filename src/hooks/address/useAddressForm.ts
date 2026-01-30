'use client';

import { useReducer, useMemo, useCallback } from 'react';
import {
    Address,
    AddressFormSubmitPayload,
    normalizeAddress,
} from '@/types/address';

export interface FormState {
    addressName: string;
    recipientName: string;
    phone: string;
    addressNotes: string;
    street: string;
    building: string;
    unit: string;
    postalCode: string;
    additionalNumber: string;
    isDefault: boolean;
}

type FormAction =
    | { type: 'SET_FIELD'; field: keyof FormState; value: string | boolean }
    | { type: 'RESET'; payload?: Partial<FormState> };

const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'RESET':
            return {
                addressName: '',
                recipientName: '',
                phone: '',
                addressNotes: '',
                street: '',
                building: '',
                unit: '',
                postalCode: '',
                additionalNumber: '',
                isDefault: false,
                ...action.payload,
            };
        default:
            return state;
    }
};

const initialState: FormState = {
    addressName: '',
    recipientName: '',
    phone: '',
    addressNotes: '',
    street: '',
    building: '',
    unit: '',
    postalCode: '',
    additionalNumber: '',
    isDefault: false,
};

/**
 * Hook to manage address form state and validation.
 */
export function useAddressForm(initialAddress?: Address | null) {
    const [state, dispatch] = useReducer(formReducer, initialState);

    // Normalize if provided (though caller should have done it, we are safe here)
    const normalized = useMemo(
        () => normalizeAddress(initialAddress),
        [initialAddress],
    );

    const setField = useCallback(
        (field: keyof FormState) => (value: string | boolean) => {
            dispatch({ type: 'SET_FIELD', field, value });
        },
        [],
    );

    const reset = useCallback((payload?: Partial<FormState>) => {
        dispatch({ type: 'RESET', payload });
    }, []);

    const isValid = (
        selectedCountry: number | '',
        selectedCity: number | '',
        selectedLocation: [number, number] | null,
    ) => {
        return !!(
            state.addressName.trim() &&
            state.phone.trim() &&
            selectedCountry &&
            selectedCity &&
            state.street.trim() &&
            selectedLocation &&
            selectedLocation[0] !== 0
        );
    };

    const buildPayload = (
        selectedCountry: number | '',
        selectedCity: number | '',
        selectedDistrict: number | '',
        selectedLocation: [number, number],
        formattedAddress: string,
    ): AddressFormSubmitPayload => {
        return {
            label: state.addressName.trim(),
            recipient_name: state.recipientName.trim(),
            phone: state.phone.trim(),
            country_id: Number(selectedCountry),
            city_id: Number(selectedCity),
            district_id: selectedDistrict ? Number(selectedDistrict) : null,
            street: state.street.trim(),
            building: state.building.trim(),
            unit: state.unit.trim(),
            postal_code: state.postalCode.trim(),
            additional_number: state.additionalNumber.trim(),
            description: state.addressNotes.trim(),
            is_default: state.isDefault,
            latitude: Number(selectedLocation[0]),
            longitude: Number(selectedLocation[1]),
            // Backward compatibility for UI consumers if any
            formatted: formattedAddress || state.street.trim(),
        };
    };

    return {
        state,
        setField,
        reset,
        isValid,
        buildPayload,
        normalized,
    };
}
