import React from 'react';
import { MapPin, Trash2, Edit, Check, Phone, Loader2 } from 'lucide-react';
import { Address } from '@/types/address';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getAddressLabel, formatAddressForDisplay } from '@/lib/address';
import { Button } from '@/components/ui/Button';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: number) => void;
    onSetDefault: (address: Address) => void;
}

const AddressCard = ({
    address,
    onEdit,
    onDelete,
    onSetDefault,
}: AddressCardProps) => {
    const t = useTranslations('MyAddresses');

    const isDefault = address.is_default;
    const isOptimistic = typeof address.id === 'number' && address.id < 0;
    const label = getAddressLabel(address);
    const formatted = formatAddressForDisplay(address);

    return (
        <div
            onClick={() => !isDefault && !isOptimistic && onSetDefault(address)}
            className={cn(
                'group relative bg-white border-2 transition-all',
                'rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl',
                'p-3 sm:p-4 md:p-5 lg:p-6',
                isOptimistic
                    ? 'opacity-70 border-dashed border-theme-primary/30 cursor-wait animate-pulse'
                    : 'cursor-pointer',
                isDefault
                    ? 'border-theme-primary shadow-lg shadow-theme-primary/10'
                    : 'border-gray-100 hover:border-theme-primary/30 shadow-sm',
            )}>
            {isOptimistic && (
                <div className="absolute top-2 end-2 flex items-center gap-1.5 bg-theme-primary/10 px-2 py-1 rounded-full">
                    <Loader2 className="w-3 h-3 text-theme-primary animate-spin" />
                    <span className="text-[10px] font-bold text-theme-primary uppercase tracking-tighter">
                        Syncing...
                    </span>
                </div>
            )}
            <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div
                        className={cn(
                            'mt-0.5 sm:mt-1 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors',
                            isDefault
                                ? 'bg-theme-primary/10'
                                : 'bg-gray-50 group-hover:bg-theme-primary/5',
                        )}>
                        <MapPin
                            className={cn(
                                'w-5 h-5 sm:w-5 md:w-6 md:h-6',
                                isDefault
                                    ? 'text-theme-primary'
                                    : 'text-gray-400 group-hover:text-theme-primary/70',
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap pe-8 sm:pe-9">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate min-w-0 flex-1">
                                {label}
                            </h3>
                            {isDefault && (
                                <span className="bg-theme-primary text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full uppercase tracking-wider shrink-0">
                                    {t('default')}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-snug line-clamp-2 mt-0.5 wrap-break-word">
                            {formatted}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-2">
                            {address.phone && (
                                <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
                                    <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                    <span
                                        dir="ltr"
                                        className="text-xs sm:text-sm font-semibold truncate">
                                        {address.phone}
                                    </span>
                                </div>
                            )}
                            {address.recipient_name && (
                                <span className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[140px] sm:max-w-none">
                                    {address.recipient_name}
                                </span>
                            )}
                        </div>

                        {address.description && (
                            <p className="text-gray-500 text-xs mt-2 italic bg-gray-50/80 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-dashed border-gray-200 line-clamp-2">
                                &quot;{address.description}&quot;
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className=" me-1 flex flex-col gap-1.5 sm:gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="button"
                        variant="iconMuted"
                        size="icon-sm"
                        onClick={() => onEdit(address)}
                        className="hover:bg-theme-primary/10 hover:text-theme-primary active:scale-95"
                        title="Edit"
                        aria-label="Edit address">
                        <Edit className="w-4 h-4 " />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(address.id)}
                        className="bg-gray-50 hover:bg-red-50 hover:text-red-500 active:scale-95"
                        title="Delete"
                        aria-label="Delete address">
                        <Trash2 className="w-4 h-4 " />
                    </Button>
                </div>
            </div>

            {isDefault && (
                <div className="absolute top-2.5 end-2.5 sm:top-3 sm:end-3 md:top-4 md:end-4">
                    <div className="w-4 h-4  bg-theme-primary rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 stroke-2" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressCard;
