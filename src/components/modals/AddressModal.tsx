// src/components/modals/AddressModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, MapPin, Search, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
    Address,
    AddressFormSubmitPayload,
    normalizeAddress,
} from '@/types/address';
import { useAuthStore } from '@/store/useAuthStore';
import { useAddress } from '@/hooks/useAddresses';
import { useLocationLogic } from '@/hooks/address/useLocationLogic';
import { useAddressForm } from '@/hooks/address/useAddressForm';
import { DEFAULT_COORDINATES } from '@/lib/address/constants';
import { formatAddressForDisplay } from '@/lib/address';

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
            className="w-full px-4 py-3 sm:py-3.5 min-h-[48px] rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all font-semibold text-base"
        />
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

    const activeAddress = useMemo(() => {
        const raw =
            shouldFetchAddress && fetchedAddress
                ? fetchedAddress
                : initialAddressProp;
        return normalizeAddress(raw);
    }, [shouldFetchAddress, fetchedAddress, initialAddressProp]);

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
        if (!isOpen) return;

        // Use queueMicrotask to avoid "cascading renders" error (setState in effect synchronously)
        queueMicrotask(() => {
            if (activeAddress) {
                form.reset({
                    addressName: activeAddress.label || '',
                    recipientName: activeAddress.recipient_name || '',
                    phone: activeAddress.phone || '',
                    addressNotes: activeAddress.description || '',
                    street: activeAddress.street || '',
                    building: activeAddress.building || '',
                    unit: activeAddress.unit || '',
                    postalCode: activeAddress.postal_code || '',
                    additionalNumber: activeAddress.additional_number || '',
                    isDefault: activeAddress.is_default,
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

                const coords: [number, number] = [
                    Number(activeAddress.latitude),
                    Number(activeAddress.longitude),
                ];
                setSelectedLocation(coords);
                setFormattedAddress(formatAddressForDisplay(activeAddress));
                setSearchQuery('');
            } else {
                form.reset();
                location.dispatch({ type: 'RESET' });
                setSelectedLocation(DEFAULT_COORDINATES);
                setFormattedAddress('');
                setSearchQuery('');
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when isOpen or activeAddress changes
    }, [isOpen, activeAddress]);

    const handleLocationSelect = useCallback(
        (loc: [number, number], formatted: string) => {
            setSelectedLocation(loc);
            setFormattedAddress(formatted);
            toast.success(t('locationSelected'), { duration: 2000 });
            // Only update street if empty to avoid overwriting user manual input
            if (!form.state.street.trim()) {
                form.setField('street')(formatted);
            }
        },
        [form, t],
    );

    const handleSave = () => {
        const payload = form.buildPayload(
            location.state.selectedCountry,
            location.state.selectedCity,
            location.state.selectedDistrict,
            selectedLocation,
            formattedAddress,
        );

        // Fire and forget (almost): Close immediately and let background handle feedback
        // This is a Senior UX move: don't make the user wait for a millisecond of API latency
        onClose();

        // onSave can be a Promise, but we don't await it here to keep UI snappy
        // Error handling should be inside onSave or via global mutation handlers
        onSave(payload);
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
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-5"
                role="dialog"
                aria-modal="true">
                <div
                    className={cn(
                        'bg-white shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col relative',
                        'max-h-[88vh] sm:max-h-[90vh]',
                        'rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl',
                    )}
                    onClick={(e) => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-100 shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={t('close')}>
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                            {isFetchingAddress
                                ? t('fetchingAddress')
                                : activeAddress
                                  ? t('editAddress')
                                  : t('addNewAddress')}
                        </h2>
                        <div className="w-9 min-w-[44px]" />
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 min-h-[40vh] sm:min-h-[480px]">
                        {isFetchingAddress ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 h-full">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gray-100 animate-pulse" />
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'h-12 sm:h-14 rounded-lg sm:rounded-xl bg-gray-100 animate-pulse',
                                                    i === 1 || i === 2
                                                        ? 'sm:col-span-2'
                                                        : '',
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 sm:gap-4 order-first lg:order-0">
                                    <div className="h-[220px] sm:h-[280px] lg:min-h-[400px] rounded-lg sm:rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                                    <div className="h-16 sm:h-20 rounded-lg sm:rounded-xl bg-gray-100/80 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                {/* Map column first on mobile so user sees location feedback immediately */}
                                <div className="flex flex-col gap-3 sm:gap-4 order-first lg:order-0">
                                    {/* Location selected card - visible so user knows selection was made */}
                                    {formattedAddress && (
                                        <div className="p-3 sm:p-4 bg-theme-primary/5 rounded-lg sm:rounded-xl border border-theme-primary/10 flex items-start gap-2 sm:gap-3 shrink-0">
                                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] sm:text-xs font-bold uppercase text-theme-primary/80 tracking-wider mb-0.5">
                                                    {t('locationSelected')}
                                                </p>
                                                <p className="text-xs sm:text-sm text-theme-primary/90 font-medium leading-snug line-clamp-2">
                                                    {formattedAddress}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-[400px] rounded-lg sm:rounded-2xl overflow-hidden relative shadow-inner border border-gray-100">
                                        <AddressMap
                                            center={selectedLocation}
                                            onLocationSelect={
                                                handleLocationSelect
                                            }
                                            searchQuery={searchQuery}
                                        />
                                        <div className="absolute top-3 start-3 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">
                                                {t('locationSelected')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    {/* Map Search */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('searchAddress')}
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
                                                className="w-full pr-10 pl-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all text-base"
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
                                        <SearchableSelect
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
                                            placeholder={t('selectCountry')}
                                            searchPlaceholder={t(
                                                'searchOptionPlaceholder',
                                            )}
                                            required
                                        />
                                        <SearchableSelect
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
                                            searchPlaceholder={t(
                                                'searchOptionPlaceholder',
                                            )}
                                            required
                                            isLoading={location.isLoadingCities}
                                            disabled={location.isLoadingCities}
                                        />
                                        <SearchableSelect
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
                                            searchPlaceholder={t(
                                                'searchOptionPlaceholder',
                                            )}
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
                                                className="w-full px-4 py-3 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none resize-none text-base min-h-[80px]"
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
                            </div>
                        )}
                    </main>

                    <footer className="p-4 sm:p-5 md:p-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-[48px] px-6 py-3 text-gray-500 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors touch-manipulation">
                            {t('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isFormValid || isFetchingAddress}
                            className={cn(
                                'min-h-[48px] px-8 sm:px-10 py-3 font-black rounded-lg sm:rounded-xl transition-all shadow-lg touch-manipulation',
                                isFormValid && !isFetchingAddress
                                    ? 'bg-theme-primary text-white hover:brightness-95 shadow-theme-primary/20 active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-none',
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
