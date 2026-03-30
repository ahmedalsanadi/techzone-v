import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/lib/validations';
import { AddressFormSubmitPayload } from '@/types/address';
import type { z } from 'zod';

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

type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * Hook to manage address form state and validation.
 */
export function useAddressForm() {
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        mode: 'onChange',
        defaultValues: {
            label: '',
            recipient_name: '',
            phone: '',
            notes: '',
            street: '',
            building_number: '',
            unit_number: '',
            postal_code: '',
            additional_number: '',
            city_id: undefined,
            district_id: undefined,
        },
    });

    const reset = useCallback(
        (data?: Partial<AddressFormValues>) => {
            form.reset(
                data || {
                    label: '',
                    recipient_name: '',
                    phone: '',
                    notes: '',
                    street: '',
                    building_number: '',
                    unit_number: '',
                    postal_code: '',
                    additional_number: '',
                },
            );
        },
        [form],
    );

    const buildPayload = (
        selectedCountry: number | '',
        selectedCity: number | '',
        selectedDistrict: number | '',
        selectedLocation: [number, number],
        formattedAddress: string,
    ): AddressFormSubmitPayload => {
        const values = form.getValues();
        return {
            label: values.label.trim(),
            recipient_name: values.recipient_name.trim(),
            phone: values.phone.trim(),
            country_id: Number(selectedCountry),
            city_id: Number(selectedCity),
            district_id: selectedDistrict ? Number(selectedDistrict) : null,
            street: values.street.trim(),
            building: values.building_number.trim(),
            unit: values.unit_number || '',
            postal_code: values.postal_code || '',
            additional_number: values.additional_number || '',
            description: values.notes || '',
            is_default: false, // Updated individually in store
            latitude: Number(selectedLocation[0]),
            longitude: Number(selectedLocation[1]),
            formatted: formattedAddress || values.street.trim(),
        };
    };

    return {
        form,
        reset,
        buildPayload,
    };
}
