// src/components/modals/AddressModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DeliveryAddress } from '@/store/useOrderStore';
import { DEFAULT_MAP_CENTER } from '@/lib/branches';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Lazy load map to avoid SSR issues
const AddressMap = dynamic(
    () => import('./AddressMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-sm text-gray-400">Loading map...</div>
            </div>
        ),
    },
);

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: DeliveryAddress) => void;
    initialAddress?: DeliveryAddress | null;
}

const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialAddress,
}) => {
    const t = useTranslations('Address');
    const [addressName, setAddressName] = useState('');
    const [addressNotes, setAddressNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
        initialAddress
            ? [initialAddress.latitude, initialAddress.longitude]
            : DEFAULT_MAP_CENTER,
    );
    const [formattedAddress, setFormattedAddress] = useState(
        initialAddress?.formatted || '',
    );
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Initialize form with existing address if editing
    useEffect(() => {
        if (initialAddress) {
            setAddressName(initialAddress.name);
            setAddressNotes(initialAddress.notes || '');
            setSelectedLocation([
                initialAddress.latitude,
                initialAddress.longitude,
            ]);
            setFormattedAddress(initialAddress.formatted);
        } else {
            setAddressName('');
            setAddressNotes('');
            setSelectedLocation(DEFAULT_MAP_CENTER);
            setFormattedAddress('');
        }
    }, [initialAddress, isOpen]);

    // Focus trap and keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Trigger map resize after modal is fully rendered
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSave = () => {
        if (!selectedLocation || !addressName.trim() || !formattedAddress.trim()) {
            return;
        }

        const address: DeliveryAddress = {
            id: initialAddress?.id || `addr-${Date.now()}`,
            name: addressName.trim(),
            formatted: formattedAddress.trim(),
            latitude: selectedLocation[0],
            longitude: selectedLocation[1],
            notes: addressNotes.trim() || undefined,
            isDefault: !initialAddress, // First address is default
        };

        onSave(address);
        onClose();
    };

    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setSelectedLocation(location);
            setFormattedAddress(formatted);
        },
        [],
    );

    if (!isOpen) return null;

    const isValid = selectedLocation && addressName.trim() && formattedAddress.trim();

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="address-modal-title">
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t('close') || 'Close'}>
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2
                            id="address-modal-title"
                            className="text-xl font-bold text-gray-900">
                            {initialAddress
                                ? t('editAddress') || 'Edit Address'
                                : t('addNewAddress') || 'Add New Address'}
                        </h2>
                        <div className="w-9" /> {/* Spacer for centering */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Form */}
                            <div className="space-y-6">
                                {/* Search Bar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('searchAddress') || 'Search Address'}
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            placeholder={
                                                t('searchPlaceholder') ||
                                                'Al Yarmouk, Al Najah Street...'
                                            }
                                            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-libero-red focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {t('addressDetails') || 'Address Details'}
                                    </h3>

                                    {/* Selected Address Display */}
                                    {formattedAddress && (
                                        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-libero-red flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700 flex-1">
                                                {formattedAddress}
                                            </p>
                                        </div>
                                    )}

                                    {/* Address Name */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('addressName') || 'Address Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={addressName}
                                            onChange={(e) =>
                                                setAddressName(e.target.value)
                                            }
                                            placeholder={
                                                t('addressNamePlaceholder') ||
                                                'Home'
                                            }
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-libero-red focus:border-transparent"
                                        />
                                    </div>

                                    {/* Address Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('addressNotes') ||
                                                'Note on Address'}
                                        </label>
                                        <textarea
                                            value={addressNotes}
                                            onChange={(e) =>
                                                setAddressNotes(e.target.value)
                                            }
                                            placeholder={
                                                t('addressNotesPlaceholder') ||
                                                'Red building, second floor, apartment number 5'
                                            }
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-libero-red focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Map */}
                            <div className="h-[400px] lg:h-[600px] min-h-[400px] rounded-2xl overflow-hidden relative">
                                <AddressMap
                                    center={selectedLocation || DEFAULT_MAP_CENTER}
                                    onLocationSelect={handleLocationSelect}
                                    searchQuery={searchQuery}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isValid}
                            className={cn(
                                'px-6 py-3 font-medium rounded-xl transition-colors',
                                isValid
                                    ? 'bg-libero-red text-white hover:bg-libero-red/90'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                            )}>
                            {initialAddress
                                ? t('save') || 'Save'
                                : t('addNewAddress') || 'Add New Address'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressModal;
