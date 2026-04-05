// src/app/[locale]/(protected)/my-addresses/MyAddressesView.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, MapPin, Home as HomeIcon } from 'lucide-react';
import { Address, AddressFormSubmitPayload } from '@/types/address';
import AddressCard from './AddressCard';
import AddressModal from '@/components/modals/AddressModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAddressFlow } from '@/hooks/address/useAddressFlow';

export default function MyAddressesView() {
    const t = useTranslations('MyAddresses');
    const {
        addresses,
        isLoading,
        isError,
        refetch,
        saveAddress,
        deleteAddress,
        setDefault,
    } = useAddressFlow();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteTargetId(id);
    };

    const handleDeleteConfirm = async () => {
        if (deleteTargetId == null) return;
        setIsDeleting(true);
        try {
            await deleteAddress(deleteTargetId);
            toast.success(t('deleteSuccess'));
            setDeleteTargetId(null);
        } catch {
            toast.error(t('deleteError'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSetDefault = async (address: Address) => {
        try {
            await setDefault(address);
            toast.success(t('defaultUpdated'));
        } catch {
            toast.error(t('defaultError'));
        }
    };

    const handleSave = async (payload: AddressFormSubmitPayload) => {
        try {
            await saveAddress(
                payload,
                editingAddress ? Number(editingAddress.id) : undefined,
            );
            toast.success(
                editingAddress ? t('updateSuccess') : t('addSuccess'),
            );
            setIsModalOpen(false);
            setEditingAddress(null);
        } catch {
            toast.error('Failed to save address');
        }
    };

    return (
        <div className="space-y-6 py-2">
        
            <div className="bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-end justify-between gap-3 sm:gap-4 md:gap-6 overflow-hidden relative rounded-lg sm:rounded-xl md:rounded-2xl  p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
                <div className="absolute top-0 inset-s-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-theme-primary/5 rounded-full -ms-10 -mt-10 sm:-ms-12 sm:-mt-12 md:-ms-16 md:-mt-16" />

                <div className="flex flex-col items-center md:items-start text-center md:text-start relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl bg-theme-primary/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 ring-2 sm:ring-4 md:ring-8 ring-theme-primary/5">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-theme-primary" />
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold md:font-black text-gray-900">
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium mt-0.5 sm:mt-1 max-w-sm px-1 sm:px-0">
                        {t('subtitle')}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="xl"
                    onClick={handleAdd}
                    className="w-full md:w-auto relative z-10 active:scale-[0.98]">
                    <Plus className="w-5 h-5 shrink-0" />
                    {t('addNew')}
                </Button>
            </div>

            <div className=" bg-theme-primary/5 rounded-lg sm:rounded-xl md:rounded-2xl  p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 border border-gray-100/80 min-h-[260px] sm:min-h-[320px] md:min-h-[400px] flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-white border-2 border-gray-100 rounded-lg sm:rounded-xl md:rounded-2xl  p-3 sm:p-4 md:p-5 lg:p-6 animate-pulse">
                                <div className="flex items-start justify-between gap-3 sm:gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gray-100" />
                                        <div className="flex-1">
                                            <div className="h-4 sm:h-5 w-28 bg-gray-200 rounded" />
                                            <div className="h-3 sm:h-4 w-48 bg-gray-100 rounded mt-2" />
                                            <div className="h-3 w-32 bg-gray-100 rounded mt-2" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mb-4 sm:mb-6">
                            <HomeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {t('loadErrorTitle') || 'Unable to load addresses'}
                        </h3>
                        <p className="text-gray-500 text-sm sm:text-base max-w-xs mb-6 sm:mb-8">
                            {t('loadErrorSubtitle') ||
                                'Check your connection and try again.'}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="xl"
                            onClick={() => refetch()}>
                            {t('retry') || 'Retry'}
                        </Button>
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onSetDefault={handleSetDefault}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mb-4 sm:mb-6">
                            <HomeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {t('noAddresses')}
                        </h3>
                        <p className="text-gray-500 text-sm sm:text-base max-w-xs mb-6 sm:mb-8">
                            Add your first address to enjoy faster checkout and
                            delivery.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="xl"
                            onClick={handleAdd}>
                            {t('addNew')}
                        </Button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddressModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingAddress(null);
                    }}
                    onSave={handleSave}
                    initialAddress={editingAddress}
                />
            )}

            <ConfirmModal
                isOpen={deleteTargetId != null}
                onClose={() => setDeleteTargetId(null)}
                title={t('deleteTitle')}
                message={t('deleteConfirm')}
                confirmLabel={t('confirmDelete')}
                cancelLabel={t('cancel')}
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
