import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
    Address,
    AddressFormSubmitPayload,
    normalizeAddress,
} from '@/types/address';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocationLogic } from '@/hooks/address/useLocationLogic';
import { useAddressForm } from '@/hooks/address/useAddressForm';
import { DEFAULT_COORDINATES } from '@/lib/address/constants';
import { formatAddressForDisplay } from '@/lib/address';
import { forwardGeocode } from '@/lib/address/geocoding';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { UseFormRegisterReturn } from 'react-hook-form';

function parseSavedMapCoords(
    address: Address | null,
): [number, number] | null {
    if (!address) return null;
    const lat = Number(address.latitude);
    const lng = Number(address.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (Math.abs(lat) < 1e-6 && Math.abs(lng) < 1e-6) return null;
    return [lat, lng];
}

function buildAddressGeocodeQuery(address: Address): string {
    return [
        address.street,
        address.district_name,
        address.city_name,
        address.country_name,
    ]
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .join(', ');
}

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: AddressFormSubmitPayload) => void | Promise<void>;
    initialAddress?: Address | null;
}

const InputField = ({
    label,
    required,
    type = 'text',
    placeholder,
    dir,
    className,
    registration,
    error,
    vt,
}: {
    label: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    dir?: string;
    className?: string;
    registration: UseFormRegisterReturn;
    error?: string;
    vt?: (key: string) => string;
}) => (
    <div className={className}>
        <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide md:tracking-wider mb-1 md:mb-1.5 ps-1">
            {label} {required && '*'}
        </label>
        <input
            type={type}
            dir={dir}
            placeholder={placeholder}
            {...registration}
            className={cn(
                'w-full px-3 py-2 md:px-4 md:py-3 min-h-[44px] md:min-h-[48px] rounded-lg md:rounded-xl lg:rounded-2xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all font-semibold text-sm md:text-base leading-snug',
                error && 'border-red-500 ring-red-500/10',
            )}
        />
        {error && (
            <span className="text-[10px] md:text-xs text-red-500 font-medium ps-1 mt-0.5 md:mt-1 block leading-tight">
                {vt ? vt(error) : error}
            </span>
        )}
    </div>
);

const AddressMapLoadingFallback = () => {
    const t = useTranslations('Address');
    return (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center px-2">
            <span className="text-xs md:text-sm text-gray-400 text-center">
                {t('loadingMap')}
            </span>
        </div>
    );
};

const AddressMap = dynamic(() => import('./AddressMap'), {
    ssr: false,
    loading: () => <AddressMapLoadingFallback />,
});

const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialAddress: initialAddressProp,
}) => {
    const t = useTranslations('Address');
    const vt = useTranslations('Validation');
    const { isAuthenticated } = useAuthStore();
    const location = useLocationLogic(undefined, isOpen, {
        suppressAutoSelectCountry: Boolean(initialAddressProp),
    });

    const activeAddress = useMemo(
        () => normalizeAddress(initialAddressProp),
        [initialAddressProp],
    );

    const { form, buildPayload, reset } = useAddressForm();
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors, isValid: isFormValid },
    } = form;

    // Map-related state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] =
        useState<[number, number]>(DEFAULT_COORDINATES);
    const [formattedAddress, setFormattedAddress] = useState('');
    const hasShownLocationToastRef = useRef(false);

    // Re-initialize when modal opens or active data changes (layout effect so map gets correct center before paint)
    useLayoutEffect(() => {
        if (!isOpen) return;
        hasShownLocationToastRef.current = false;
        if (activeAddress) {
            reset({
                label: activeAddress.label || '',
                recipient_name: activeAddress.recipient_name || '',
                phone: activeAddress.phone || '',
                notes: activeAddress.description || '',
                street: activeAddress.street || '',
                building_number:
                    activeAddress.building_number ??
                    activeAddress.building ??
                    '',
                unit_number:
                    activeAddress.unit_number ?? activeAddress.unit ?? '',
                postal_code: activeAddress.postal_code || '',
                additional_number: activeAddress.additional_number || '',
                city_id: activeAddress.city_id
                    ? Number(activeAddress.city_id)
                    : undefined,
                district_id: activeAddress.district_id
                    ? Number(activeAddress.district_id)
                    : undefined,
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

            const coords = parseSavedMapCoords(activeAddress);
            setSelectedLocation(coords ?? DEFAULT_COORDINATES);
            setFormattedAddress(formatAddressForDisplay(activeAddress));
            setSearchQuery('');
        } else {
            reset();
            location.dispatch({ type: 'RESET' });
            setSelectedLocation(DEFAULT_COORDINATES);
            setFormattedAddress('');
            setSearchQuery('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when isOpen or activeAddress changes
    }, [isOpen, activeAddress]);

    useEffect(() => {
        if (!isOpen || !activeAddress) return;
        if (parseSavedMapCoords(activeAddress)) return;
        const q = buildAddressGeocodeQuery(activeAddress);
        if (!q.trim()) return;
        const ac = new AbortController();
        forwardGeocode(q, ac.signal)
            .then((res) => {
                if (!res) return;
                setSelectedLocation([res.lat, res.lon]);
            })
            .catch(() => {});
        return () => ac.abort();
    }, [isOpen, activeAddress]);

    const handleSearchNavigate = useCallback(
        (loc: [number, number], previewFormatted: string) => {
            setSelectedLocation(loc);
            setFormattedAddress(previewFormatted);
            if (!activeAddress) {
                setValue('street', '', { shouldValidate: true });
            }
        },
        [activeAddress, setValue],
    );

    const handleLocationSelect = useCallback(
        (loc: [number, number], formatted: string) => {
            setSelectedLocation(loc);
            setFormattedAddress(formatted);
            setValue('street', formatted, { shouldValidate: true });
            if (!hasShownLocationToastRef.current) {
                toast.success(t('locationSelected'), { duration: 2000 });
                hasShownLocationToastRef.current = true;
            }
        },
        [setValue, t],
    );

    const handleSave = () => {
        const payload = buildPayload(
            location.state.selectedCountry,
            location.state.selectedCity,
            location.state.selectedDistrict,
            selectedLocation,
            formattedAddress,
        );

        // Fire and forget (almost): Close immediately and let background handle feedback
        onClose();

        // onSave can be a Promise, but we don't await it here to keep UI snappy
        onSave(payload);
    };

    const isLocationValid = !!(
        location.state.selectedCountry &&
        location.state.selectedCity &&
        selectedLocation &&
        selectedLocation[0] !== 0
    );

    const isTotalValid = isFormValid && isLocationValid;

    return (
        <Dialog
            open={isOpen}
            as="div"
            className="relative z-50 focus:outline-none"
            onClose={onClose}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
            />

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-2 sm:p-3 md:p-5">
                    <DialogPanel
                        transition
                        className="bg-white shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col relative max-h-[92vh] sm:max-h-[90vh] rounded-xl sm:rounded-2xl md:rounded-4xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
                        <header className="flex items-center justify-between gap-2 py-2 px-3 md:px-4 lg:px-6 border-b border-gray-100 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xl"
                                onClick={onClose}
                                aria-label={t('close')}>
                                <X className="size-5" />
                            </Button>
                            <DialogTitle
                                as="h2"
                                className="text-sm sm:text-base md:text-xl font-bold text-gray-900 text-center leading-tight px-1">
                                {activeAddress
                                    ? t('editAddress')
                                    : t('addNewAddress')}
                            </DialogTitle>
                            <div className="w-9 min-w-[44px]" />
                        </header>

                        <main className="flex-1 overflow-y-auto  py-2 md:py-4 px-3 md:px-4 lg:px-6  min-h-[36vh] sm:min-h-[480px]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 md:gap-8">
                                {/* Map column first on mobile so user sees location feedback immediately */}
                                <div className="flex min-h-0 flex-col gap-2.5 sm:gap-4 order-first lg:order-0">
                                    {/* Taller map on small screens: search + status live on the map */}
                                    <div className="relative min-h-[min(52vh,420px)] sm:min-h-[320px] lg:min-h-[380px] flex-1 overflow-hidden rounded-md sm:rounded-2xl border border-gray-100 shadow-inner">
                                        <AddressMap
                                            key={
                                                activeAddress
                                                    ? `addr-${activeAddress.id}`
                                                    : 'addr-new'
                                            }
                                            center={selectedLocation}
                                            onLocationSelect={
                                                handleLocationSelect
                                            }
                                            onSearchNavigate={
                                                handleSearchNavigate
                                            }
                                            searchQuery={searchQuery}
                                            onSearchChange={setSearchQuery}
                                            searchLabel={t('searchAddress')}
                                            searchPlaceholder={t(
                                                'searchPlaceholder',
                                            )}
                                            formattedAddress={formattedAddress}
                                            locationSelectedLabel={t(
                                                'locationSelected',
                                            )}
                                            locationNotSelectedLabel={t(
                                                'locationNotSelectedYet',
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-5 md:space-y-6">
                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <InputField
                                            label={t('addressName')}
                                            registration={register('label')}
                                            error={errors.label?.message}
                                            vt={vt}
                                            required
                                            placeholder={t(
                                                'addressNamePlaceholder',
                                            )}
                                            className="sm:col-span-2"
                                        />
                                        <InputField
                                            label={t('recipientName')}
                                            registration={register(
                                                'recipient_name',
                                            )}
                                            error={
                                                errors.recipient_name?.message
                                            }
                                            vt={vt}
                                            required
                                        />
                                        <InputField
                                            label={t('phone')}
                                            registration={register('phone')}
                                            error={errors.phone?.message}
                                            vt={vt}
                                            required
                                            type="tel"
                                            dir="ltr"
                                        />
                                        <SearchableSelect
                                            label={t('country')}
                                            value={
                                                location.state.selectedCountry
                                            }
                                            onChange={(v) => {
                                                location.dispatch({
                                                    type: 'SET_COUNTRY',
                                                    value: v,
                                                });
                                            }}
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
                                            onChange={(v) => {
                                                location.dispatch({
                                                    type: 'SET_CITY',
                                                    value: v,
                                                });
                                                setValue('city_id', Number(v), {
                                                    shouldValidate: true,
                                                });
                                            }}
                                            options={location.cities}
                                            placeholder={t('selectCity')}
                                            searchPlaceholder={t(
                                                'searchOptionPlaceholder',
                                            )}
                                            error={
                                                typeof errors.city_id?.message ===
                                                'string'
                                                    ? vt(errors.city_id.message)
                                                    : undefined
                                            }
                                            required
                                            isLoading={location.isLoadingCities}
                                            disabled={location.isLoadingCities}
                                        />
                                        <SearchableSelect
                                            label={t('district')}
                                            value={
                                                location.state.selectedDistrict
                                            }
                                            onChange={(v) => {
                                                location.dispatch({
                                                    type: 'SET_DISTRICT',
                                                    value: v,
                                                });
                                                setValue(
                                                    'district_id',
                                                    v ? Number(v) : null,
                                                    { shouldValidate: true },
                                                );
                                            }}
                                            options={location.districts}
                                            placeholder={t('selectDistrict')}
                                            searchPlaceholder={t(
                                                'searchOptionPlaceholder',
                                            )}
                                            error={
                                                typeof errors.district_id
                                                    ?.message === 'string'
                                                    ? vt(
                                                          errors.district_id
                                                              .message,
                                                      )
                                                    : undefined
                                            }
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
                                            registration={register('street')}
                                            error={errors.street?.message}
                                            vt={vt}
                                            required
                                            className="sm:col-span-2"
                                        />
                                        <InputField
                                            label={t('building')}
                                            registration={register(
                                                'building_number',
                                            )}
                                            error={
                                                errors.building_number?.message
                                            }
                                            vt={vt}
                                            required
                                        />
                                        <InputField
                                            label={t('unit')}
                                            registration={register(
                                                'unit_number',
                                            )}
                                            error={errors.unit_number?.message}
                                            vt={vt}
                                        />
                                        <InputField
                                            label={t('postalCode')}
                                            registration={register(
                                                'postal_code',
                                            )}
                                            error={errors.postal_code?.message}
                                            vt={vt}
                                        />
                                        <InputField
                                            label={t('additionalNumber')}
                                            registration={register(
                                                'additional_number',
                                            )}
                                            error={
                                                errors.additional_number
                                                    ?.message
                                            }
                                            vt={vt}
                                        />
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide md:tracking-wider mb-1 md:mb-1.5 ps-1">
                                                {t('addressNotes')}
                                            </label>
                                            <textarea
                                                {...register('notes')}
                                                rows={2}
                                                placeholder={t(
                                                    'addressNotesPlaceholder',
                                                )}
                                                className={cn(
                                                    'w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl lg:rounded-2xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none resize-none text-sm md:text-base min-h-[72px] md:min-h-[80px] leading-snug',
                                                    errors.notes &&
                                                        'border-red-500 ring-red-500/10',
                                                )}
                                            />
                                            {errors.notes && (
                                                <span className="text-[10px] md:text-xs text-red-500 font-medium ps-1 mt-0.5 md:mt-1 block">
                                                    {typeof errors.notes
                                                        ?.message === 'string'
                                                        ? vt(
                                                              errors.notes
                                                                  .message,
                                                          )
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                        {isAuthenticated && (
                                            <div className="sm:col-span-2 flex items-start gap-2 md:gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="set-default"
                                                    className="mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-theme-primary focus:ring-theme-primary shrink-0"
                                                />
                                                <label
                                                    htmlFor="set-default"
                                                    className="text-xs md:text-sm font-bold text-gray-700 cursor-pointer leading-snug">
                                                    {t('setDefault')}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </main>

                        <footer className="py-2 md:py-3 px-3 md:px-4 lg:px-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                            <Button
                                type="button"
                                variant="secondary"
                                size="default"
                                onClick={onClose}>
                                {t('cancel')}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit(handleSave)}
                                disabled={!isTotalValid}
                                className="active:scale-[0.98]">
                                {activeAddress ? t('save') : t('addNew')}
                            </Button>
                        </footer>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default AddressModal;
