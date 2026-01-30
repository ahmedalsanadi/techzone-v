// src/components/modals/AddressModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, MapPin, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Address, AddressFormSubmitPayload } from '@/types/address';
import { useAuthStore } from '@/store/useAuthStore';
import { useAddress } from '@/hooks/useAddresses';
import { useLocationLogic } from '@/hooks/address/useLocationLogic';
import { useAddressForm } from '@/hooks/address/useAddressForm';
import { DEFAULT_COORDINATES } from '@/lib/address/constants';

// Lazy load map component
const AddressMap = dynamic(() => import('./AddressMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <span className="text-sm text-gray-400">Loading map...</span>
        </div>
    ),
});

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: AddressFormSubmitPayload) => void | Promise<void>;
    initialAddress?: Address | null;
}

// Sub-components
const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    dir?: string;
    className?: string;
}> = ({
    label,
    value,
    onChange,
    required,
    type = 'text',
    placeholder,
    dir,
    className,
}) => (
    <div className={className}>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
            {label} {required && '*'}
        </label>
        <input
            type={type}
            dir={dir}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-semibold"
        />
    </div>
);

const SelectField: React.FC<{
    label: string;
    value: number | '';
    onChange: (value: number | '') => void;
    options: Array<{ id: number; name: string }>;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}> = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    required,
    disabled,
    isLoading,
    className,
}) => (
    <div className={cn('relative', className)}>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
            {label} {required && '*'}
        </label>
        <select
            value={value}
            onChange={(e) =>
                onChange(e.target.value ? Number(e.target.value) : '')
            }
            disabled={disabled}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none disabled:opacity-50">
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                    {opt.name}
                </option>
            ))}
        </select>
        {isLoading && (
            <Loader2 className="absolute left-10 top-[38px] w-4 h-4 animate-spin text-theme-primary" />
        )}
    </div>
);

const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialAddress: initialAddressProp,
}) => {
    const t = useTranslations('Address');
    const { isAuthenticated } = useAuthStore();

    // Fetch full data for Auth Edit
    const shouldFetchAddress = !!(isAuthenticated && initialAddressProp?.id);
    const { data: fetchedAddress, isLoading: isFetchingAddress } = useAddress(
        shouldFetchAddress ? Number(initialAddressProp?.id) : null,
    );

    const activeAddress = useMemo(
        () =>
            shouldFetchAddress && fetchedAddress
                ? fetchedAddress
                : initialAddressProp,
        [shouldFetchAddress, fetchedAddress, initialAddressProp],
    );

    // Custom Hooks for Logic Separation
    const location = useLocationLogic();
    const form = useAddressForm(activeAddress);

    // Map-related state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] =
        useState<[number, number]>(DEFAULT_COORDINATES);
    const [formattedAddress, setFormattedAddress] = useState('');

    // Re-initialize when modal opens or active data changes
    useEffect(() => {
        if (!isOpen) {
            // Optional: reset when closing to be extra safe
            setSearchQuery('');
            return;
        }

        if (activeAddress) {
            form.reset({
                addressName: activeAddress.label || activeAddress.name || '',
                recipientName: activeAddress.recipient_name || '',
                phone: activeAddress.phone || '',
                addressNotes:
                    activeAddress.notes || activeAddress.description || '',
                street: activeAddress.street || '',
                building:
                    activeAddress.building_number ||
                    activeAddress.building ||
                    '',
                unit: activeAddress.unit_number || activeAddress.unit || '',
                postalCode: activeAddress.postal_code || '',
                additionalNumber: activeAddress.additional_number || '',
                isDefault: !!(
                    activeAddress.is_default || activeAddress.isDefault
                ),
            });

            location.dispatch({
                type: 'RESET',
                payload: {
                    selectedCountry: activeAddress.country_id
                        ? Number(activeAddress.country_id)
                        : '',
                    selectedCity: activeAddress.city_id
                        ? Number(activeAddress.city_id)
                        : '',
                    selectedDistrict: activeAddress.district_id
                        ? Number(activeAddress.district_id)
                        : '',
                },
            });

            const coords: [number, number] =
                activeAddress.latitude && activeAddress.longitude
                    ? [
                          Number(activeAddress.latitude),
                          Number(activeAddress.longitude),
                      ]
                    : DEFAULT_COORDINATES;

            setSelectedLocation(coords);
            setFormattedAddress(
                activeAddress.formatted || activeAddress.street || '',
            );
            setSearchQuery('');
        } else {
            // New Address Case: Critical thorough reset
            form.reset();
            location.dispatch({ type: 'RESET' });
            setSelectedLocation(DEFAULT_COORDINATES);
            setFormattedAddress('');
            setSearchQuery('');
        }
    }, [isOpen, activeAddress]);

    const handleLocationSelect = useCallback(
        (loc: [number, number], formatted: string) => {
            setSelectedLocation(loc);
            setFormattedAddress(formatted);
            if (!form.state.street) form.setField('street')(formatted);
        },
        [form.state.street],
    );

    const handleSave = async () => {
        const payload = form.buildPayload(
            location.state.selectedCountry,
            location.state.selectedCity,
            location.state.selectedDistrict,
            selectedLocation,
            formattedAddress,
        );

        try {
            const result = onSave(payload);
            if (result instanceof Promise) await result;
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const isFormValid = form.isValid(
        location.state.selectedCountry,
        location.state.selectedCity,
        selectedLocation,
    );

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
                role="dialog"
                aria-modal="true">
                <div
                    className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col relative"
                    onClick={(e) => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-6 border-b border-gray-100">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isFetchingAddress
                                ? t('loading')
                                : activeAddress
                                  ? t('editAddress')
                                  : t('addNewAddress')}
                        </h2>
                        <div className="w-9" />
                    </header>

                    <main className="flex-1 overflow-y-auto p-6">
                        {isFetchingAddress ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    {t('fetchingLocationDetails')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {/* Map Search */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('searchAddress')}
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'searchPlaceholder',
                                                )}
                                                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-theme-primary/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField
                                            label={t('addressName')}
                                            value={form.state.addressName}
                                            onChange={form.setField(
                                                'addressName',
                                            )}
                                            required
                                            placeholder={t(
                                                'addressNamePlaceholder',
                                            )}
                                            className="sm:col-span-2"
                                        />
                                        <InputField
                                            label={t('recipientName')}
                                            value={form.state.recipientName}
                                            onChange={form.setField(
                                                'recipientName',
                                            )}
                                        />
                                        <InputField
                                            label={t('phone')}
                                            value={form.state.phone}
                                            onChange={form.setField('phone')}
                                            required
                                            type="tel"
                                            dir="ltr"
                                        />
                                        <SelectField
                                            label={t('country')}
                                            value={
                                                location.state.selectedCountry
                                            }
                                            onChange={(v) =>
                                                location.dispatch({
                                                    type: 'SET_COUNTRY',
                                                    value: v,
                                                })
                                            }
                                            options={location.countries}
                                            required
                                        />
                                        <SelectField
                                            label={t('city')}
                                            value={location.state.selectedCity}
                                            onChange={(v) =>
                                                location.dispatch({
                                                    type: 'SET_CITY',
                                                    value: v,
                                                })
                                            }
                                            options={location.cities}
                                            placeholder={t('selectCity')}
                                            required
                                            isLoading={location.isLoadingCities}
                                            disabled={location.isLoadingCities}
                                        />
                                        <SelectField
                                            label={t('district')}
                                            value={
                                                location.state.selectedDistrict
                                            }
                                            onChange={(v) =>
                                                location.dispatch({
                                                    type: 'SET_DISTRICT',
                                                    value: v,
                                                })
                                            }
                                            options={location.districts}
                                            placeholder={t('selectDistrict')}
                                            className="sm:col-span-2"
                                            isLoading={
                                                location.isLoadingDistricts
                                            }
                                            disabled={
                                                location.isLoadingDistricts
                                            }
                                        />
                                        <InputField
                                            label={t('street')}
                                            value={form.state.street}
                                            onChange={form.setField('street')}
                                            required
                                            className="sm:col-span-2"
                                        />
                                        <InputField
                                            label={t('building')}
                                            value={form.state.building}
                                            onChange={form.setField('building')}
                                        />
                                        <InputField
                                            label={t('unit')}
                                            value={form.state.unit}
                                            onChange={form.setField('unit')}
                                        />
                                        <InputField
                                            label={t('postalCode')}
                                            value={form.state.postalCode}
                                            onChange={form.setField(
                                                'postalCode',
                                            )}
                                        />
                                        <InputField
                                            label={t('additionalNumber')}
                                            value={form.state.additionalNumber}
                                            onChange={form.setField(
                                                'additionalNumber',
                                            )}
                                        />
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('addressNotes')}
                                            </label>
                                            <textarea
                                                value={form.state.addressNotes}
                                                onChange={(e) =>
                                                    form.setField(
                                                        'addressNotes',
                                                    )(e.target.value)
                                                }
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none resize-none"
                                            />
                                        </div>
                                        {isAuthenticated && (
                                            <div className="sm:col-span-2 flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="set-default"
                                                    checked={
                                                        form.state.isDefault
                                                    }
                                                    onChange={(e) =>
                                                        form.setField(
                                                            'isDefault',
                                                        )(e.target.checked)
                                                    }
                                                    className="w-5 h-5 rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                                                />
                                                <label
                                                    htmlFor="set-default"
                                                    className="text-sm font-bold text-gray-700 cursor-pointer">
                                                    {t('setDefault')}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Map Section */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex-1 min-h-[400px] rounded-[40px] overflow-hidden relative shadow-inner border border-gray-100">
                                        <AddressMap
                                            center={selectedLocation}
                                            onLocationSelect={
                                                handleLocationSelect
                                            }
                                            searchQuery={searchQuery}
                                        />
                                        <div className="absolute top-4 start-4 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                                Map Live Selection
                                            </span>
                                        </div>
                                    </div>
                                    {formattedAddress && (
                                        <div className="p-4 bg-theme-primary/5 rounded-3xl border border-theme-primary/10 flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
                                            <p className="text-sm text-theme-primary/80 font-medium">
                                                {formattedAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isFormValid || isFetchingAddress}
                            className={cn(
                                'px-12 py-3.5 font-black rounded-2xl transition-all shadow-xl',
                                isFormValid && !isFetchingAddress
                                    ? 'bg-theme-primary text-white hover:scale-[1.02] shadow-theme-primary/20 active:scale-95'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed',
                            )}>
                            {activeAddress ? t('save') : t('addNew')}
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default AddressModal;
