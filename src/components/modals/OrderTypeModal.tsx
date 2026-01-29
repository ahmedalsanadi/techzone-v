// src/components/modals/OrderTypeModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, MapPin, Clock, Plus, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    useOrderStore,
    OrderType,
    OrderTime,
    getScheduledTimeAsDate,
} from '@/store/useOrderStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/store-service';
import { Address } from '@/types/address';
import AddressModal from './AddressModal';
import { cn } from '@/lib/utils';
import { DeliveryAddress } from '@/store/useOrderStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface OrderTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderTypeModal: React.FC<OrderTypeModalProps> = ({ isOpen, onClose }) => {
    const t = useTranslations('Order');
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
        setOrderType,
        setDeliveryAddress,
        setScheduledTime,
        setOrderTime,
    } = useOrderStore();

    const { isAuthenticated } = useAuthStore();
    const {
        addresses: guestAddresses,
        addAddress: addGuestAddress,
        updateAddress: updateGuestAddress,
    } = useAddressStore();

    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Convert scheduledTime from string to Date if needed
    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Fetch addresses
    useEffect(() => {
        if (!isOpen || orderType !== 'delivery') return;

        let isMounted = true;

        if (isAuthenticated) {
            const fetchAddresses = async () => {
                if (retryCount === 0) setIsLoadingAddresses(true);

                try {
                    const data = await storeService.getAddresses();
                    if (!isMounted) return;

                    setSavedAddresses(data);

                    // If no address is selected in useOrderStore, but we have addresses,
                    // pick the default one
                    if (!deliveryAddress && data.length > 0) {
                        const defaultAddr =
                            data.find((a) => a.is_default) || data[0];
                        setDeliveryAddress(defaultAddr as any);
                    }
                    setIsLoadingAddresses(false);
                    setRetryCount(0); // Reset on success
                } catch (error) {
                    console.error('Failed to fetch addresses:', error);

                    // Small retry logic for transient 500 errors after login
                    if (retryCount < 2 && isMounted) {
                        console.log(
                            `[OrderTypeModal] Retrying address fetch... (${retryCount + 1}/2)`,
                        );
                        setTimeout(() => {
                            if (isMounted) setRetryCount((prev) => prev + 1);
                        }, 1500);
                    } else {
                        setIsLoadingAddresses(false);
                    }
                }
            };
            fetchAddresses();
        } else {
            // For guest, use addresses from useAddressStore
            setSavedAddresses(guestAddresses);
            if (!deliveryAddress && guestAddresses.length > 0) {
                const defaultAddr =
                    guestAddresses.find((a) => a.is_default) ||
                    guestAddresses[0];
                setDeliveryAddress(defaultAddr as any);
            }
            setIsLoadingAddresses(false);
        }

        return () => {
            isMounted = false;
        };
    }, [
        isOpen,
        orderType,
        isAuthenticated,
        guestAddresses,
        deliveryAddress,
        setDeliveryAddress,
        retryCount,
    ]);

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
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSave = () => {
        onClose();
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setShowAddressModal(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowAddressModal(true);
    };

    const handleSelectAddress = (address: Address) => {
        setDeliveryAddress(address as any);
    };

    const handleAddressSave = async (addressData: any) => {
        try {
            if (isAuthenticated) {
                if (editingAddress) {
                    const updated = await storeService.updateAddress(
                        editingAddress.id,
                        addressData,
                    );
                    setDeliveryAddress(updated as any);
                    toast.success(t('addressSaved') || 'Address updated');
                } else {
                    const created =
                        await storeService.createAddress(addressData);
                    setDeliveryAddress(created as any);
                    toast.success(t('addressSaved') || 'Address added');
                }
                // Refresh list
                const data = await storeService.getAddresses();
                setSavedAddresses(data);
            } else {
                // For guest
                if (editingAddress) {
                    updateGuestAddress({
                        ...addressData,
                        id: editingAddress.id,
                    });
                    setDeliveryAddress({
                        ...addressData,
                        id: editingAddress.id,
                    });
                } else {
                    // Generate a temp ID for guest address
                    const newAddress = { ...addressData, id: Date.now() };
                    // If guest already has an address, replace it (per requirement: only one for guests)
                    if (guestAddresses.length > 0) {
                        updateGuestAddress(newAddress);
                    } else {
                        addGuestAddress(newAddress);
                    }
                    setDeliveryAddress(newAddress);
                }
                toast.success(
                    t('addressSaved') || 'Address saved successfully',
                );
            }
            setShowAddressModal(false);
            setEditingAddress(null);
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error(t('addressSaveError') || 'Failed to save address');
        }
    };

    const handleTimeSelect = (time: OrderTime) => {
        setOrderTime(time);
        if (time === 'now') {
            setScheduledTime(null);
            setShowDateTimePicker(false);
        } else if (!scheduledTime) {
            // Set default to tomorrow at 4:30 PM
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(16, 30, 0, 0);
            setScheduledTime(tomorrow);
        }
    };

    // Initialize temp date/time when opening picker
    const openDateTimePicker = () => {
        if (scheduledTime) {
            const date =
                scheduledTime instanceof Date
                    ? scheduledTime
                    : new Date(scheduledTime);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            setTempDate(`${year}-${month}-${day}`);
            setTempTime(`${hours}:${minutes}`);
        } else {
            // Default to tomorrow at 4:30 PM
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const year = tomorrow.getFullYear();
            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const day = String(tomorrow.getDate()).padStart(2, '0');

            setTempDate(`${year}-${month}-${day}`);
            setTempTime('16:30');
        }
        setShowDateTimePicker(true);
    };

    const handleDateTimeSave = () => {
        if (tempDate && tempTime) {
            const [hours, minutes] = tempTime.split(':').map(Number);
            const selectedDate = new Date(tempDate);
            selectedDate.setHours(hours, minutes, 0, 0);

            // Ensure the date is in the future
            const now = new Date();
            if (selectedDate <= now) {
                // If selected time is in the past, set to tomorrow at the selected time
                selectedDate.setDate(selectedDate.getDate() + 1);
            }

            setScheduledTime(selectedDate);
            setShowDateTimePicker(false);
        }
    };

    const handleDateTimeCancel = () => {
        setShowDateTimePicker(false);
    };

    const formatScheduledTime = (date: Date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${day}/${month}/${year}، ${displayHours}:${minutes
            .toString()
            .padStart(2, '0')} ${period}`;
    };

    if (!isOpen) return null;

    const orderTypes: Array<{ id: OrderType; label: string }> = [
        { id: 'delivery', label: t('delivery') || 'Deliver to my location' },
        { id: 'dineIn', label: t('dineIn') || 'Dine-in at branch' },
        { id: 'pickup', label: t('pickup') || 'Pickup from branch' },
        { id: 'carPickup', label: t('carPickup') || 'Car pickup soon' },
    ];

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
                aria-labelledby="order-modal-title">
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2
                            id="order-modal-title"
                            className="text-xl font-bold text-gray-900">
                            {t('orderType') || 'Order Type'}
                        </h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t('close') || 'Close'}>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Order Type Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderType') || 'Select order type'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {orderTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setOrderType(type.id)}
                                        className={cn(
                                            'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                            orderType === type.id
                                                ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                        )}
                                        aria-pressed={orderType === type.id}>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address Section - Only show if delivery is selected */}
                        {orderType === 'delivery' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t('deliveryAddress') ||
                                            'Delivery Address'}
                                    </h3>
                                    {savedAddresses.length > 0 && (
                                        <button
                                            onClick={handleAddAddress}
                                            className="text-theme-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                            <Plus className="w-4 h-4" />
                                            {t('addNew') || 'Add New'}
                                        </button>
                                    )}
                                </div>

                                {isLoadingAddresses ? (
                                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                                        <Loader2 className="w-6 h-6 text-theme-primary animate-spin" />
                                    </div>
                                ) : savedAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() =>
                                                    handleSelectAddress(addr)
                                                }
                                                className={cn(
                                                    'p-4 rounded-xl border-2 transition-all cursor-pointer group relative',
                                                    deliveryAddress?.id ===
                                                        addr.id
                                                        ? 'bg-theme-primary/5 border-theme-primary'
                                                        : 'bg-white border-gray-100 hover:border-gray-200',
                                                )}>
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={cn(
                                                            'w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0',
                                                            deliveryAddress?.id ===
                                                                addr.id
                                                                ? 'border-theme-primary bg-theme-primary'
                                                                : 'border-gray-300',
                                                        )}>
                                                        {deliveryAddress?.id ===
                                                            addr.id && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900">
                                                                {addr.label ||
                                                                    addr.name ||
                                                                    'Address'}
                                                            </span>
                                                            {addr.is_default && (
                                                                <span className="text-[10px] bg-theme-primary/10 text-theme-primary px-2 py-0.5 rounded-full font-bold">
                                                                    {t(
                                                                        'default',
                                                                    ) ||
                                                                        'Default'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-1">
                                                            {addr.formatted || (
                                                                <>
                                                                    {
                                                                        addr.street
                                                                    }
                                                                    {(addr.building_number ||
                                                                        addr.building) &&
                                                                        `, ${addr.building_number || addr.building}`}
                                                                    {(addr.unit_number ||
                                                                        addr.unit) &&
                                                                        `, ${addr.unit_number || addr.unit}`}
                                                                    {', '}
                                                                    {addr.city_name ||
                                                                        addr.city ||
                                                                        ''}
                                                                </>
                                                            )}
                                                        </p>
                                                        {(addr.description ||
                                                            addr.notes) && (
                                                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">
                                                                {addr.description ||
                                                                    addr.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAddress(
                                                                addr,
                                                            );
                                                        }}
                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddAddress}
                                        className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-theme-primary hover:bg-theme-primary/5 transition-all group">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-theme-primary/10 transition-colors">
                                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-theme-primary" />
                                            </div>
                                            <span className="font-bold text-gray-500 group-hover:text-theme-primary">
                                                {t('addAddress') ||
                                                    'Add Delivery Address'}
                                            </span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Order Time Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderTime') || 'Select order time'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleTimeSelect('now')}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                        orderTime === 'now'
                                            ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}
                                    aria-pressed={orderTime === 'now'}>
                                    {t('now') || 'Now'}
                                </button>
                                <button
                                    onClick={() => handleTimeSelect('later')}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                        orderTime === 'later'
                                            ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}
                                    aria-pressed={orderTime === 'later'}>
                                    {t('later') || 'Later'}
                                </button>
                            </div>

                            {/* Scheduled Time Display */}
                            {orderTime === 'later' && (
                                <>
                                    {scheduledTime && !showDateTimePicker && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-theme-primary shrink-0" />
                                            <p className="text-sm text-gray-700">
                                                {formatScheduledTime(
                                                    scheduledTime,
                                                )}
                                            </p>
                                            <button
                                                onClick={openDateTimePicker}
                                                className="ml-auto px-4 py-2 bg-theme-primary text-white text-sm font-medium rounded-lg hover:brightness-[0.95] transition-all">
                                                {t('change') || 'Change'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Date/Time Picker */}
                                    {showDateTimePicker && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Clock className="w-5 h-5 text-theme-primary shrink-0" />
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    {t('selectOrderTime') ||
                                                        'Select Date & Time'}
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                                        {t('date') || 'Date'}
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={tempDate}
                                                        onChange={(e) =>
                                                            setTempDate(
                                                                e.target.value,
                                                            )
                                                        }
                                                        min={
                                                            new Date()
                                                                .toISOString()
                                                                .split('T')[0]
                                                        }
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                                        {t('time') || 'Time'}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={tempTime}
                                                        onChange={(e) =>
                                                            setTempTime(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3 pt-2">
                                                <button
                                                    onClick={
                                                        handleDateTimeCancel
                                                    }
                                                    className="px-4 py-2 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                                    {t('cancel') || 'Cancel'}
                                                </button>
                                                <button
                                                    onClick={handleDateTimeSave}
                                                    disabled={
                                                        !tempDate || !tempTime
                                                    }
                                                    className={cn(
                                                        'px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors',
                                                        tempDate && tempTime
                                                            ? 'bg-theme-primary hover:brightness-[0.95]'
                                                            : 'bg-gray-300 cursor-not-allowed',
                                                    )}>
                                                    {t('save') || 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!scheduledTime && !showDateTimePicker && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-sm text-gray-600 text-center mb-3">
                                                {t('selectDateTime') ||
                                                    'Please select a date and time'}
                                            </p>
                                            <button
                                                onClick={openDateTimePicker}
                                                className="w-full px-4 py-2 bg-theme-primary text-white text-sm font-medium rounded-lg hover:bg-theme-primary-hover transition-colors">
                                                {t('selectDateTime') ||
                                                    'Select Date & Time'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 flex items-center justify-end">
                        <button
                            onClick={handleSave}
                            className="w-full bg-theme-primary text-white font-semibold py-3 rounded-xl hover:brightness-[0.95] transition-all">
                            {t('save') || 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            <AddressModal
                isOpen={showAddressModal}
                onClose={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                }}
                onSave={handleAddressSave}
                initialAddress={editingAddress}
            />
        </>
    );
};

export default OrderTypeModal;
