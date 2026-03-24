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

const actionIconClass = 'size-9 shrink-0 rounded-lg md:size-11 md:rounded-xl';

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
    const branchName = branch.name || 'Branch';
    const isOpen = branch.is_open;

    return (
        <div
            data-branch-item
            tabIndex={0}
            role="option"
            aria-selected={isSelected}
            aria-label={`${branchName}, ${isOpen ? t('open') : t('closed')}`}
            onFocus={onFocus}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={cn(
                'group cursor-pointer rounded-xl border p-3 transition duration-200 md:rounded-2xl md:p-4',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2',
                isSelected
                    ? 'border-theme-primary bg-linear-to-br from-theme-primary/10 to-theme-primary/5 shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md',
            )}>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 md:gap-x-3 md:gap-y-2">
                <div
                    className={cn(
                        'row-span-2 flex size-10 shrink-0 items-center justify-center self-center rounded-lg transition-colors md:size-16 md:rounded-2xl',
                        isSelected
                            ? 'bg-theme-primary text-white shadow-sm'
                            : 'bg-gray-50 text-gray-400 group-hover:bg-theme-primary/10 group-hover:text-theme-primary',
                    )}
                    aria-hidden="true">
                    <Building2 className="size-5 md:size-6" />
                </div>

                <h4 className="min-w-0 text-sm font-bold text-gray-900 wrap-break-word group-hover:text-theme-primary md:text-base">
                    {branchName}
                </h4>

                <div className="flex min-w-0 items-center gap-2 md:gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                'rounded-md px-2 py-1 text-xs font-semibold',
                                isOpen
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-gray-50 text-gray-400',
                            )}>
                            {isOpen ? t('open') : t('closed')}
                        </span>
                        <span
                            className="size-1 shrink-0 rounded-full bg-gray-200"
                            aria-hidden="true"
                        />
                        {branch.services && (
                            <span className="text-sm font-medium whitespace-nowrap text-gray-500">
                                {branch.services.shipping_enabled
                                    ? t('free_delivery')
                                    : t('delivery_with_fee', { fee: 5 })}
                            </span>
                        )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            type="button"
                            variant="iconMuted"
                            size="icon"
                            onClick={onWorkingHoursClick}
                            className={actionIconClass}
                            aria-label={`${t('view_working_hours') || 'View working hours'} - ${branchName}`}
                            title={
                                t('view_working_hours') || 'View working hours'
                            }>
                            <Clock className="size-4 md:size-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="iconMuted"
                            size="icon"
                            onClick={onContactClick}
                            className={actionIconClass}
                            aria-label={`${t('contact_branch') || 'Contact branch'} - ${branchName}`}
                            title={t('contact_branch') || 'Contact branch'}>
                            <Headphones className="size-4 md:size-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
