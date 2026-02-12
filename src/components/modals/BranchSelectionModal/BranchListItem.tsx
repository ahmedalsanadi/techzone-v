/**
 * Branch list item component
 */

import React from 'react';
import { Building2, Headphones, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Branch } from '@/types/branches';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface BranchListItemProps {
    branch: Branch;
    isSelected: boolean;
    onFocus: () => void;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onWorkingHoursClick: (e: React.MouseEvent) => void;
    onContactClick: (e: React.MouseEvent) => void;
}

export const BranchListItem: React.FC<BranchListItemProps> = ({
    branch,
    isSelected,
    onFocus,
    onClick,
    onKeyDown,
    onWorkingHoursClick,
    onContactClick,
}) => {
    const t = useTranslations('Branches');

    return (
        <div
            data-branch-item
            tabIndex={0}
            onFocus={onFocus}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={cn(
                'group p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2',
                isSelected
                    ? 'border-theme-primary bg-linear-to-br from-theme-primary/10 to-theme-primary/5 shadow-xl shadow-theme-primary/10 z-10'
                    : 'border-gray-50 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100',
            )}
            role="option"
            aria-selected={isSelected}
            aria-label={`${branch.name || 'Branch'}, ${
                branch.is_open ? t('open') : t('closed')
            }`}>
            <div className="flex items-center justify-between gap-2 md:gap-6">
                <div className="flex items-center gap-2.5 md:gap-5 flex-1 min-w-0">
                    <div
                        className={cn(
                            'w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 overflow-hidden',
                            isSelected
                                ? 'bg-theme-primary text-white scale-105 shadow-lg shadow-theme-primary/30'
                                : 'bg-gray-50 text-gray-400 group-hover:bg-theme-primary/10 group-hover:text-theme-primary',
                        )}
                        aria-hidden="true">
                        <Building2 className="size-4 md:size-6 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-0.5 md:mb-2 transition-colors duration-300 group-hover:text-theme-primary">
                            {branch.name || 'Branch'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 md:gap-x-3">
                            <span
                                className={cn(
                                    'text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm',
                                    branch.is_open
                                        ? 'text-green-600 bg-green-50/80 backdrop-blur-sm'
                                        : 'text-gray-400 bg-gray-50',
                                )}>
                                {branch.is_open ? t('open') : t('closed')}
                            </span>
                            <span
                                className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gray-200"
                                aria-hidden="true"
                            />
                            {branch.services && (
                                <span className="text-sm  text-gray-500 font-medium whitespace-nowrap">
                                    {branch.services.shipping_enabled
                                        ? t('free_delivery')
                                        : t('delivery_with_fee', { fee: 5 })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="iconMuted"
                        size="icon"
                        onClick={onWorkingHoursClick}
                        className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl shrink-0 active:scale-90"
                        aria-label={`${t('view_working_hours') || 'View working hours'} - ${branch.name}`}
                        title={t('view_working_hours') || 'View working hours'}>
                        <Clock className="size-4 md:size-[22px]" />
                    </Button>
                    <Button
                        type="button"
                        variant="iconMuted"
                        size="icon"
                        onClick={onContactClick}
                        className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl shrink-0 active:scale-90"
                        aria-label={`${t('contact_branch') || 'Contact branch'} - ${branch.name}`}
                        title={t('contact_branch') || 'Contact branch'}>
                        <Headphones className="size-4 md:size-[22px]" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
