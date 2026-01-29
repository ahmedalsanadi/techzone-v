// src/components/modals/AddressModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { X, MapPin, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DEFAULT_MAP_CENTER } from '@/lib/branches';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { storeService } from '@/services/store-service';
import { Country, City, District, Address } from '@/types/address';

// Lazy load map component
const AddressMap = dynamic(() => import('./AddressMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
            <span className="text-sm text-gray-400">Loading map...</span>
        </div>
    ),
});

// Types
interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: AddressFormData) => void;
    initialAddress?: Address | null;
}

interface AddressFormData {
    id?: number | string;
    label: string;
    recipient_name: string;
    phone: string;
    country_id: number;
    city_id: number;
    district_id: number | null;
    street: string;
    building: string;
    unit: string;
    postal_code: string;
    additional_number: string;
    description: string;
    is_default: boolean;
    latitude: number;
    longitude: number;
    // UI compatibility fields
    name: string;
    formatted: string;
    building_number: string;
    unit_number: string;
    notes: string;
}

interface FormState {
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

interface LocationState {
    selectedCountry: number | '';
    selectedCity: number | '';
    selectedDistrict: number | '';
}

type FormAction =
    | { type: 'SET_FIELD'; field: keyof FormState; value: string | boolean }
    | { type: 'RESET'; payload?: Partial<FormState> };

type LocationAction =
    | { type: 'SET_COUNTRY'; value: number | '' }
    | { type: 'SET_CITY'; value: number | '' }
    | { type: 'SET_DISTRICT'; value: number | '' }
    | { type: 'RESET'; payload?: Partial<LocationState> };

// Reducers
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

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
    switch (action.type) {
        case 'SET_COUNTRY':
            return { ...state, selectedCountry: action.value, selectedCity: '', selectedDistrict: '' };
        case 'SET_CITY':
            return { ...state, selectedCity: action.value, selectedDistrict: '' };
        case 'SET_DISTRICT':
            return { ...state, selectedDistrict: action.value };
        case 'RESET':
            return { selectedCountry: '', selectedCity: '', selectedDistrict: '', ...action.payload };
        default:
            return state;
    }
};

// Initial states
const initialFormState: FormState = {
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

const initialLocationState: LocationState = {
    selectedCountry: '',
    selectedCity: '',
    selectedDistrict: '',
};

// Helper to extract initial location from address
const getInitialMapLocation = (address: Address | null | undefined): [number, number] => {
    if (address?.latitude && address?.longitude) {
        return [Number(address.latitude), Number(address.longitude)];
    }
    return DEFAULT_MAP_CENTER;
};

// Custom hooks
function useLocationData(
    isOpen: boolean,
    locationState: LocationState,
    initialAddress: Address | null | undefined,
    dispatchLocation: React.Dispatch<LocationAction>
) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const initializedRef = useRef(false);

    // Fetch countries on open
    useEffect(() => {
        if (!isOpen) {
            initializedRef.current = false;
            return;
        }

        const fetchCountries = async () => {
            try {
                const data = await storeService.getCountries();
                const countriesArray = Array.isArray(data) ? data : [];
                setCountries(countriesArray);

                // Set default country only if not editing and not yet set
                if (!initialAddress && countriesArray.length > 0 && !locationState.selectedCountry) {
                    dispatchLocation({ type: 'SET_COUNTRY', value: countriesArray[0].id });
                }
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };

        if (!initializedRef.current) {
            initializedRef.current = true;
            fetchCountries();
        }
    }, [isOpen, initialAddress, locationState.selectedCountry, dispatchLocation]);

    // Fetch cities when country changes
    useEffect(() => {
        if (!locationState.selectedCountry) {
            setCities([]);
            return;
        }

        const fetchCities = async () => {
            setIsLoadingLocations(true);
            try {
                const data = await storeService.getCities(Number(locationState.selectedCountry));
                const citiesArray = Array.isArray(data) ? data : [];
                setCities(citiesArray);

                // Auto-select initial city if editing
                if (initialAddress?.city_id) {
                    const targetCityId = Number(initialAddress.city_id);
                    if (citiesArray.some((c) => c.id === targetCityId)) {
                        dispatchLocation({ type: 'SET_CITY', value: targetCityId });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        fetchCities();
    }, [locationState.selectedCountry, initialAddress?.city_id, dispatchLocation]);

    // Fetch districts when city changes
    useEffect(() => {
        if (!locationState.selectedCity) {
            setDistricts([]);
            return;
        }

        const fetchDistricts = async () => {
            try {
                const data = await storeService.getDistricts(Number(locationState.selectedCity));
                const districtsArray = Array.isArray(data) ? data : [];
                setDistricts(districtsArray);

                // Auto-select initial district if editing
                if (initialAddress?.district_id) {
                    const targetDistrictId = Number(initialAddress.district_id);
                    if (districtsArray.some((d) => d.id === targetDistrictId)) {
                        dispatchLocation({ type: 'SET_DISTRICT', value: targetDistrictId });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch districts:', error);
            }
        };

        fetchDistricts();
    }, [locationState.selectedCity, initialAddress?.district_id, dispatchLocation]);

    // Cleanup
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    return { countries, cities, districts, isLoadingLocations };
}

function useBodyScrollLock(isOpen: boolean) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Trigger resize for map
            const timer = setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = '';
            };
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
}

// Sub-components
interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    dir?: string;
    className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
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

interface SelectFieldProps {
    label: string;
    value: number | '';
    onChange: (value: number | '') => void;
    options: Array<{ id: number; name: string }>;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
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
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none disabled:opacity-50"
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
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

// Main component
const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialAddress,
}) => {
    const t = useTranslations('Address');

    // Form state with reducer
    const [formState, dispatchForm] = useReducer(formReducer, initialFormState);
    const [locationState, dispatchLocation] = useReducer(locationReducer, initialLocationState);

    // Map-related state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<[number, number]>(
        () => getInitialMapLocation(initialAddress)
    );
    const [formattedAddress, setFormattedAddress] = useState('');

    // Lock body scroll
    useBodyScrollLock(isOpen);

    // Fetch location data
    const { countries, cities, districts, isLoadingLocations } = useLocationData(
        isOpen,
        locationState,
        initialAddress,
        dispatchLocation
    );

    // Initialize form when modal opens or initialAddress changes
    useEffect(() => {
        if (!isOpen) return;

        if (initialAddress) {
            dispatchForm({
                type: 'RESET',
                payload: {
                    addressName: initialAddress.label || initialAddress.name || '',
                    recipientName: initialAddress.recipient_name || '',
                    phone: initialAddress.phone || '',
                    addressNotes: initialAddress.notes || initialAddress.description || '',
                    street: initialAddress.street || '',
                    building: initialAddress.building_number || initialAddress.building || '',
                    unit: initialAddress.unit_number || initialAddress.unit || '',
                    postalCode: initialAddress.postal_code || '',
                    additionalNumber: initialAddress.additional_number || '',
                    isDefault: initialAddress.is_default || initialAddress.isDefault || false,
                },
            });

            dispatchLocation({
                type: 'RESET',
                payload: {
                    selectedCountry: initialAddress.country_id ? Number(initialAddress.country_id) : '',
                    selectedCity: initialAddress.city_id ? Number(initialAddress.city_id) : '',
                    selectedDistrict: initialAddress.district_id ? Number(initialAddress.district_id) : '',
                },
            });

            setSelectedLocation(getInitialMapLocation(initialAddress));
            setFormattedAddress(initialAddress.formatted || initialAddress.street || '');
        } else {
            dispatchForm({ type: 'RESET' });
            dispatchLocation({ type: 'RESET' });
            setSelectedLocation(DEFAULT_MAP_CENTER);
            setFormattedAddress('');
        }
        setSearchQuery('');
    }, [isOpen, initialAddress]);

    // Memoized validation
    const isValid = useMemo(() => {
        return !!(
            formState.addressName.trim() &&
            formState.phone.trim() &&
            locationState.selectedCountry &&
            locationState.selectedCity &&
            formState.street.trim() &&
            selectedLocation &&
            selectedLocation[0] !== 0
        );
    }, [
        formState.addressName,
        formState.phone,
        formState.street,
        locationState.selectedCountry,
        locationState.selectedCity,
        selectedLocation,
    ]);

    // Callbacks
    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setSelectedLocation(location);
            setFormattedAddress(formatted);
        },
        []
    );

    const handleFieldChange = useCallback(
        (field: keyof FormState) => (value: string | boolean) => {
            dispatchForm({ type: 'SET_FIELD', field, value });
        },
        []
    );

    const handleSave = useCallback(() => {
        if (!isValid) return;

        const addressData: AddressFormData = {
            id: initialAddress?.id,
            label: formState.addressName.trim(),
            recipient_name: formState.recipientName.trim(),
            phone: formState.phone.trim(),
            country_id: Number(locationState.selectedCountry),
            city_id: Number(locationState.selectedCity),
            district_id: locationState.selectedDistrict ? Number(locationState.selectedDistrict) : null,
            street: formState.street.trim(),
            building: formState.building.trim(),
            unit: formState.unit.trim(),
            postal_code: formState.postalCode.trim(),
            additional_number: formState.additionalNumber.trim(),
            description: formState.addressNotes.trim(),
            is_default: formState.isDefault,
            latitude: selectedLocation?.[0] || 0,
            longitude: selectedLocation?.[1] || 0,
            // UI compatibility
            name: formState.addressName.trim(),
            formatted: formattedAddress || formState.street.trim(),
            building_number: formState.building.trim(),
            unit_number: formState.unit.trim(),
            notes: formState.addressNotes.trim(),
        };

        onSave(addressData);
        onClose();
    }, [isValid, formState, locationState, selectedLocation, formattedAddress, initialAddress?.id, onSave, onClose]);

    const handleBackdropClick = useCallback(() => {
        onClose();
    }, [onClose]);

    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
                    onClick={stopPropagation}
                >
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t('close')}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                            {initialAddress ? t('editAddress') : t('addNewAddress')}
                        </h2>
                        <div className="w-9" aria-hidden="true" />
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {/* Form Section */}
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
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={t('searchPlaceholder')}
                                            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField
                                        label={t('addressName')}
                                        value={formState.addressName}
                                        onChange={handleFieldChange('addressName')}
                                        required
                                        placeholder={t('addressNamePlaceholder')}
                                        className="sm:col-span-2"
                                    />

                                    <InputField
                                        label={t('recipientName')}
                                        value={formState.recipientName}
                                        onChange={handleFieldChange('recipientName')}
                                    />

                                    <InputField
                                        label={t('phone')}
                                        value={formState.phone}
                                        onChange={handleFieldChange('phone')}
                                        required
                                        type="tel"
                                        dir="ltr"
                                        placeholder="05xxxx..."
                                    />

                                    <SelectField
                                        label={t('country')}
                                        value={locationState.selectedCountry}
                                        onChange={(v) => dispatchLocation({ type: 'SET_COUNTRY', value: v })}
                                        options={countries}
                                        required
                                    />

                                    <SelectField
                                        label={t('city')}
                                        value={locationState.selectedCity}
                                        onChange={(v) => dispatchLocation({ type: 'SET_CITY', value: v })}
                                        options={cities}
                                        placeholder={t('selectCity')}
                                        required
                                        disabled={isLoadingLocations}
                                        isLoading={isLoadingLocations}
                                    />

                                    <SelectField
                                        label={t('district')}
                                        value={locationState.selectedDistrict}
                                        onChange={(v) => dispatchLocation({ type: 'SET_DISTRICT', value: v })}
                                        options={districts}
                                        placeholder={t('selectDistrict')}
                                        className="sm:col-span-2"
                                    />

                                    <InputField
                                        label={t('street')}
                                        value={formState.street}
                                        onChange={handleFieldChange('street')}
                                        required
                                        className="sm:col-span-2"
                                    />

                                    <InputField
                                        label={t('building')}
                                        value={formState.building}
                                        onChange={handleFieldChange('building')}
                                    />

                                    <InputField
                                        label={t('unit')}
                                        value={formState.unit}
                                        onChange={handleFieldChange('unit')}
                                    />

                                    <InputField
                                        label={t('postalCode')}
                                        value={formState.postalCode}
                                        onChange={handleFieldChange('postalCode')}
                                    />

                                    <InputField
                                        label={t('additionalNumber')}
                                        value={formState.additionalNumber}
                                        onChange={handleFieldChange('additionalNumber')}
                                    />

                                    {/* Notes */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('addressNotes')}
                                        </label>
                                        <textarea
                                            value={formState.addressNotes}
                                            onChange={(e) => handleFieldChange('addressNotes')(e.target.value)}
                                            placeholder={t('addressNotesPlaceholder')}
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none resize-none"
                                        />
                                    </div>

                                    {/* Default Checkbox */}
                                    <div className="sm:col-span-2 flex items-center gap-3 py-2">
                                        <input
                                            type="checkbox"
                                            id="set-default"
                                            checked={formState.isDefault}
                                            onChange={(e) => handleFieldChange('isDefault')(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                                        />
                                        <label
                                            htmlFor="set-default"
                                            className="text-sm font-bold text-gray-700 cursor-pointer"
                                        >
                                            {t('setDefault')}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="flex flex-col gap-4">
                                <div className="h-[300px] lg:h-full min-h-[400px] rounded-[32px] overflow-hidden relative border-4 border-gray-50 shadow-inner">
                                    <AddressMap
                                        center={selectedLocation}
                                        onLocationSelect={handleLocationSelect}
                                        searchQuery={searchQuery}
                                    />
                                    <div className="absolute top-4 start-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-theme-primary" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-tight">
                                            Live Map Selection
                                        </span>
                                    </div>
                                </div>

                                {formattedAddress && (
                                    <div className="p-4 bg-theme-primary/5 rounded-2xl border border-theme-primary/10 flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
                                        <p className="text-sm text-theme-primary/80 font-medium leading-relaxed">
                                            {formattedAddress}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="p-4 md:p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isValid}
                            className={cn(
                                'px-10 py-3 font-black rounded-xl transition-all shadow-lg',
                                isValid
                                    ? 'bg-theme-primary text-white hover:brightness-95 shadow-theme-primary/20 active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            )}
                        >
                            {initialAddress ? t('save') : t('addNew')}
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default AddressModal;