// src/components/modals/OrderTypeModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, MapPin, Clock, Plus, Edit, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    useOrderStore,
    OrderType,
    OrderTime,
    getScheduledTimeAsDate,
} from '@/store/useOrderStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Address } from '@/types/address';
import AddressModal from './AddressModal';
import { cn } from '@/lib/utils';
import { useAddresses, useAddressMutations } from '@/hooks/useAddresses';
import { toast } from 'sonner';

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
    const { guestAddress, setGuestAddress } = useAddressStore();

    // React Query for Auth addresses
    const { data: authAddresses = [], isLoading: isLoadingAuthAddresses } =
        useAddresses();
    const { createAddress, updateAddress } = useAddressMutations();

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);
    const modalRef = useRef<HTMLDivElement>(null);

    // Sync deliveryAddress from Auth list if not set
    useEffect(() => {
        if (isAuthenticated && authAddresses.length > 0 && !deliveryAddress) {
            const defaultAddr =
                authAddresses.find((a) => a.is_default) || authAddresses[0];
            setDeliveryAddress(defaultAddr);
        } else if (!isAuthenticated && guestAddress && !deliveryAddress) {
            setDeliveryAddress(guestAddress);
        }
    }, [
        isAuthenticated,
        authAddresses,
        guestAddress,
        deliveryAddress,
        setDeliveryAddress,
    ]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    const handleAddAddress = () => {
        setEditingAddress(null);
        setShowAddressModal(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowAddressModal(true);
    };

    const handleAddressSave = async (addressData: any) => {
        try {
            if (isAuthenticated) {
                if (editingAddress) {
                    await updateAddress.mutateAsync({
                        id: Number(editingAddress.id),
                        data: addressData,
                    });
                    toast.success(t('addressSaved') || 'Address updated');
                } else {
                    const created =
                        await createAddress.mutateAsync(addressData);
                    setDeliveryAddress(created);
                    toast.success(t('addressSaved') || 'Address added');
                }
            } else {
                // Guest logic: only one address allowed
                const newAddress = { ...addressData, id: Date.now() };
                setGuestAddress(newAddress);
                setDeliveryAddress(newAddress);
                toast.success(t('addressSaved') || 'Guest address saved');
            }
            setShowAddressModal(false);
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error('Failed to save address');
        }
    };

    const handleTimeSelect = (time: OrderTime) => {
        setOrderTime(time);
        if (time === 'now') {
            setScheduledTime(null);
            setShowDateTimePicker(false);
        }
    };

    const openDateTimePicker = () => {
        const base = scheduledTime instanceof Date ? scheduledTime : new Date();
        const year = base.getFullYear();
        const month = String(base.getMonth() + 1).padStart(2, '0');
        const day = String(base.getDate()).padStart(2, '0');
        const hours = String(base.getHours()).padStart(2, '0');
        const minutes = String(base.getMinutes()).padStart(2, '0');
        setTempDate(`${year}-${month}-${day}`);
        setTempTime(`${hours}:${minutes}`);
        setShowDateTimePicker(true);
    };

    const handleDateTimeSave = () => {
        if (tempDate && tempTime) {
            const [hours, minutes] = tempTime.split(':').map(Number);
            const selectedDate = new Date(tempDate);
            selectedDate.setHours(hours, minutes, 0, 0);
            if (selectedDate <= new Date())
                selectedDate.setDate(selectedDate.getDate() + 1);
            setScheduledTime(selectedDate);
            setShowDateTimePicker(false);
        }
    };

    if (!isOpen) return null;

    const displayAddresses = isAuthenticated
        ? authAddresses
        : guestAddress
          ? [guestAddress]
          : [];
    const canAddAddress =
        isAuthenticated || (!isAuthenticated && !guestAddress);

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            {t('orderType')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Order Type */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderType')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {(
                                    [
                                        'delivery',
                                        'dineIn',
                                        'pickup',
                                        'carPickup',
                                    ] as OrderType[]
                                ).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setOrderType(type)}
                                        className={cn(
                                            'p-4 rounded-xl border-2 transition-all text-right',
                                            orderType === type
                                                ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                                : 'bg-gray-50 border-gray-200 hover:border-gray-300',
                                        )}>
                                        {t(type)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Addresses */}
                        {orderType === 'delivery' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t('deliveryAddress')}
                                    </h3>
                                    {canAddAddress &&
                                        displayAddresses.length > 0 && (
                                            <button
                                                onClick={handleAddAddress}
                                                className="text-theme-primary text-sm font-bold flex items-center gap-1">
                                                <Plus className="w-4 h-4" />{' '}
                                                {t('addNew')}
                                            </button>
                                        )}
                                </div>

                                {isLoadingAuthAddresses ? (
                                    <div className="flex justify-center p-8 bg-gray-50 rounded-xl">
                                        <Loader2 className="animate-spin text-theme-primary" />
                                    </div>
                                ) : displayAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {displayAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() =>
                                                    setDeliveryAddress(addr)
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
                                                            'w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center',
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
                                                        <div className="font-bold text-gray-900">
                                                            {addr.label ||
                                                                addr.name ||
                                                                'Home'}
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-1">
                                                            {addr.formatted ||
                                                                addr.street}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAddress(
                                                                addr,
                                                            );
                                                        }}
                                                        className="p-2 opacity-0 group-hover:opacity-100">
                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddAddress}
                                        className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-theme-primary hover:bg-theme-primary/5 group">
                                        <Plus className="w-8 h-8 mx-auto text-gray-300 group-hover:text-theme-primary mb-2" />
                                        <span className="font-bold text-gray-400 group-hover:text-theme-primary">
                                            {t('addAddress')}
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Order Time */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t('selectOrderTime')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {(['now', 'later'] as OrderTime[]).map(
                                    (time) => (
                                        <button
                                            key={time}
                                            onClick={() =>
                                                handleTimeSelect(time)
                                            }
                                            className={cn(
                                                'p-4 rounded-xl border-2 transition-all text-right',
                                                orderTime === time
                                                    ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300',
                                            )}>
                                            {t(time)}
                                        </button>
                                    ),
                                )}
                            </div>

                            {orderTime === 'later' && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-theme-primary" />
                                        <span className="text-sm font-medium">
                                            {scheduledTime
                                                ? scheduledTime.toLocaleString()
                                                : t('selectDateTime')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={openDateTimePicker}
                                        className="text-theme-primary font-bold text-sm">
                                        {t('change')}
                                    </button>
                                </div>
                            )}

                            {showDateTimePicker && (
                                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-inner space-y-4 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            value={tempDate}
                                            onChange={(e) =>
                                                setTempDate(e.target.value)
                                            }
                                            className="w-full p-2 border rounded-lg"
                                        />
                                        <input
                                            type="time"
                                            value={tempTime}
                                            onChange={(e) =>
                                                setTempTime(e.target.value)
                                            }
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                setShowDateTimePicker(false)
                                            }
                                            className="px-4 py-2 text-gray-400 font-bold">
                                            {t('cancel')}
                                        </button>
                                        <button
                                            onClick={handleDateTimeSave}
                                            className="px-6 py-2 bg-theme-primary text-white font-bold rounded-lg">
                                            {t('save')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="p-6 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="w-full bg-theme-primary text-white font-bold py-3.5 rounded-xl hover:brightness-95">
                            {t('save')}
                        </button>
                    </footer>
                </div>
            </div>

            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSave={handleAddressSave}
                initialAddress={editingAddress}
            />
        </>
    );
};

export default OrderTypeModal;
