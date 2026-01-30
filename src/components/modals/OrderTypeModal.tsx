// src/components/modals/OrderTypeModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Plus, Edit, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    useOrderStore,
    OrderType,
    OrderTime,
    getScheduledTimeAsDate,
} from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Address } from '@/types/address';
import type { AddressFormSubmitPayload } from '@/types/address';
import AddressModal from './AddressModal';
import { cn } from '@/lib/utils';
import { useAddressFlow } from '@/hooks/address/useAddressFlow';
import {
    getAddressLabel,
    formatAddressForDisplay,
    showAddNewAddressButton,
} from '@/lib/address';
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
    const {
        addresses: displayAddresses,
        isLoading: isLoadingAddresses,
        saveAddress,
    } = useAddressFlow();

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

    // Sync deliveryAddress from available list if not set
    useEffect(() => {
        if (displayAddresses.length > 0 && !deliveryAddress) {
            const prioritized = isAuthenticated
                ? displayAddresses.find((a) => a.is_default) ||
                  displayAddresses[0]
                : displayAddresses[0];
            setDeliveryAddress(prioritized);
        }
    }, [
        displayAddresses,
        deliveryAddress,
        setDeliveryAddress,
        isAuthenticated,
    ]);

    const isSelected = (addrId: number) => {
        if (!deliveryAddress) return false;
        return Number(deliveryAddress.id) === Number(addrId);
    };

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

    const handleAddressSave = async (payload: AddressFormSubmitPayload) => {
        try {
            await saveAddress(
                payload,
                editingAddress ? Number(editingAddress.id) : undefined,
            );
            toast.success(t('addressSaved') || 'Address saved');
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

    const canAddAddress = showAddNewAddressButton(
        isAuthenticated,
        displayAddresses.length,
    );

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            {t('orderType')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                                            'p-4 rounded-2xl border-2 transition-all text-right',
                                            orderType === type
                                                ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-bold shadow-sm'
                                                : 'bg-gray-50 border-gray-100 hover:border-gray-200',
                                        )}>
                                        {t(type)}
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                                className="text-theme-primary text-sm font-black flex items-center gap-1 hover:brightness-90 transition-all">
                                                <Plus className="w-4 h-4" />{' '}
                                                {t('addNew')}
                                            </button>
                                        )}
                                </div>

                                {isLoadingAddresses ? (
                                    <div className="flex justify-center p-12 bg-gray-50 rounded-3xl">
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
                                                    'p-5 rounded-3xl border-2 transition-all cursor-pointer group relative',
                                                    isSelected(addr.id)
                                                        ? 'bg-theme-primary/5 border-theme-primary shadow-lg shadow-theme-primary/5'
                                                        : 'bg-white border-gray-100 hover:border-gray-200',
                                                )}>
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={cn(
                                                            'w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
                                                            isSelected(addr.id)
                                                                ? 'border-theme-primary bg-theme-primary'
                                                                : 'border-gray-300',
                                                        )}>
                                                        {isSelected(
                                                            addr.id,
                                                        ) && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-gray-900">
                                                            {getAddressLabel(
                                                                addr,
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-1">
                                                            {formatAddressForDisplay(
                                                                addr,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAddress(
                                                                addr,
                                                            );
                                                        }}
                                                        className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddAddress}
                                        className="w-full p-10 border-2 border-dashed border-gray-200 rounded-[32px] hover:border-theme-primary hover:bg-theme-primary/5 group transition-all">
                                        <Plus className="w-8 h-8 mx-auto text-gray-300 group-hover:text-theme-primary mb-3" />
                                        <span className="font-black text-gray-400 group-hover:text-theme-primary">
                                            {t('addAddress')}
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

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
                                                'p-4 rounded-2xl border-2 transition-all text-right',
                                                orderTime === time
                                                    ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-bold shadow-sm'
                                                    : 'bg-gray-50 border-gray-100 hover:border-gray-200',
                                            )}>
                                            {t(time)}
                                        </button>
                                    ),
                                )}
                            </div>

                            {orderTime === 'later' && (
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-theme-primary/10 rounded-xl">
                                            <Clock className="w-5 h-5 text-theme-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">
                                            {scheduledTime
                                                ? scheduledTime.toLocaleString()
                                                : t('selectDateTime')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={openDateTimePicker}
                                        className="text-theme-primary font-black text-sm hover:underline">
                                        {t('change')}
                                    </button>
                                </div>
                            )}

                            {showDateTimePicker && (
                                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            value={tempDate}
                                            onChange={(e) =>
                                                setTempDate(e.target.value)
                                            }
                                            className="w-full p-3 bg-gray-50 border-0 rounded-xl font-bold"
                                        />
                                        <input
                                            type="time"
                                            value={tempTime}
                                            onChange={(e) =>
                                                setTempTime(e.target.value)
                                            }
                                            className="w-full p-3 bg-gray-50 border-0 rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={() =>
                                                setShowDateTimePicker(false)
                                            }
                                            className="px-6 py-2.5 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all">
                                            {t('cancel')}
                                        </button>
                                        <button
                                            onClick={handleDateTimeSave}
                                            className="px-8 py-2.5 bg-theme-primary text-white font-black rounded-xl shadow-lg shadow-theme-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
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
                            className="w-full bg-theme-primary text-white font-black py-4 rounded-[20px] shadow-xl shadow-theme-primary/20 hover:brightness-95 active:scale-[0.98] transition-all">
                            {t('save')}
                        </button>
                    </footer>
                </div>
            </div>

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
